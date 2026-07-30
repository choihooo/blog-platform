import { createSign } from "node:crypto";

import { normalizeHttpFailure, repositoryFailure } from "./repository-error";
import type { RepositoryFailureState } from "./types";

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export type GitHubAppCredentialState =
  | { status: "ready"; token: string; expiresAt?: string }
  | { status: "failure"; error: RepositoryFailureState };

type GitHubAppEnv = {
  GITHUB_APP_ID?: string;
  GITHUB_APP_PRIVATE_KEY?: string;
  GITHUB_INSTALLATION_ID?: string;
};

function missing(keys: string[]): GitHubAppCredentialState {
  return {
    status: "failure",
    error: repositoryFailure("missing-config", {
      message: `Missing GitHub App configuration: ${keys.join(", ")}`,
    }),
  };
}

function jwt(input: { appId: string; privateKey: string; now?: Date }): string {
  const now = Math.floor((input.now ?? new Date()).getTime() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: input.appId }),
  ).toString("base64url");
  const body = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256").update(body).sign(input.privateKey, "base64url");
  return `${body}.${signature}`;
}

async function readMessage(response: Response): Promise<string | undefined> {
  try {
    return ((await response.json()) as { message?: string }).message;
  } catch {
    return undefined;
  }
}

export async function getGitHubAppInstallationToken(input: {
  env?: GitHubAppEnv;
  fetchImpl?: FetchLike;
  now?: Date;
}): Promise<GitHubAppCredentialState> {
  const env = input.env ?? process.env;
  const required = {
    GITHUB_APP_ID: env.GITHUB_APP_ID,
    GITHUB_APP_PRIVATE_KEY: env.GITHUB_APP_PRIVATE_KEY,
    GITHUB_INSTALLATION_ID: env.GITHUB_INSTALLATION_ID,
  };
  const missingKeys = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missingKeys.length > 0) return missing(missingKeys);
  const appId = required.GITHUB_APP_ID as string;
  const privateKey = required.GITHUB_APP_PRIVATE_KEY as string;
  const installationId = required.GITHUB_INSTALLATION_ID as string;

  let bearer: string;
  try {
    bearer = jwt({
      appId,
      privateKey,
      now: input.now,
    });
  } catch {
    return {
      status: "failure",
      error: repositoryFailure("invalid-config", {
        message: "GitHub App private key is invalid.",
        secrets: [privateKey],
      }),
    };
  }

  const fetchImpl = input.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: "POST",
        headers: {
          accept: "application/vnd.github+json",
          authorization: `Bearer ${bearer}`,
          "x-github-api-version": "2022-11-28",
        },
      },
    );
    if (!response.ok) {
      return {
        status: "failure",
        error: normalizeHttpFailure(response.status, {
          message: await readMessage(response),
          secrets: [bearer, privateKey],
        }),
      };
    }
    const body = (await response.json()) as { token?: string; expires_at?: string };
    if (!body.token) {
      return {
        status: "failure",
        error: repositoryFailure("invalid-config", {
          message: "GitHub App token response did not include a token.",
        }),
      };
    }
    return { status: "ready", token: body.token, expiresAt: body.expires_at };
  } catch {
    return { status: "failure", error: repositoryFailure("temporary-connectivity") };
  }
}
