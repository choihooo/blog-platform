import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

import type {
  FetchLike,
  GoogleAnalyticsProviderConfig,
  GoogleServiceAccount,
  GoogleTokenResponse,
} from "../model/google-contracts";
import { clean } from "../model/google-normalization";
export function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

export async function loadServiceAccount(config: GoogleAnalyticsProviderConfig) {
  const serviceAccountJson = clean(config.serviceAccountJson);
  const raw = serviceAccountJson
    ? serviceAccountJson
    : await readFile(clean(config.serviceAccountKeyFile), "utf8");
  const account = JSON.parse(raw) as Partial<GoogleServiceAccount>;
  const clientEmail = clean(account.client_email);
  const privateKey = clean(account.private_key);
  if (!clientEmail || !privateKey) {
    throw new Error("Google service account credential is missing client_email or private_key.");
  }
  return {
    client_email: clientEmail,
    private_key: privateKey,
    token_uri: clean(account.token_uri) || "https://oauth2.googleapis.com/token",
  } satisfies GoogleServiceAccount;
}

export function createServiceAccountJwt(
  account: GoogleServiceAccount,
  scopes: string[],
  now = new Date(),
) {
  const issuedAt = Math.floor(now.getTime() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: account.client_email,
    scope: scopes.join(" "),
    aud: account.token_uri ?? "https://oauth2.googleapis.com/token",
    iat: issuedAt,
    exp: issuedAt + 3600,
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(account.private_key);
  return `${unsigned}.${base64Url(signature)}`;
}

export async function requestAccessToken(account: GoogleServiceAccount, fetchImpl: FetchLike) {
  const assertion = createServiceAccountJwt(account, [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/webmasters.readonly",
  ]);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });
  const response = await fetchImpl(account.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = (await response.json()) as GoogleTokenResponse;
  if (!response.ok || !payload.access_token) {
    throw new Error(
      `Google token request failed ${response.status}: ${
        payload.error_description ?? payload.error ?? "unknown error"
      }`,
    );
  }
  return payload.access_token;
}
