import { readFile } from "node:fs/promises";
import path from "node:path";

import bundledSiteConfig from "../../../../content/site.json";

import { createGitHubContentAdapterFromCredential } from "./github-adapter";
import { getGitHubAppInstallationToken } from "./github-app-token";
import { createLocalContentAdapter } from "./local-adapter";
import { repositoryFailure } from "./repository-error";
import type { ContentAdapter, RepositoryFailureState } from "./types";

type GitHubTargetConfig = {
  github?: {
    owner?: unknown;
    repo?: unknown;
    branch?: unknown;
  };
};

function githubAppEnvConfigured() {
  return Boolean(
    process.env.GITHUB_APP_ID ||
    process.env.GITHUB_APP_PRIVATE_KEY ||
    process.env.GITHUB_INSTALLATION_ID,
  );
}

function failingAdapter(error: RepositoryFailureState): ContentAdapter {
  return {
    async listFiles() {
      return { success: false as const, error };
    },
    async readFile() {
      return { success: false as const, error };
    },
    async createFile(input) {
      return { success: false as const, error: { ...error, submittedContent: input.content } };
    },
    async updateFile(input) {
      return { success: false as const, error: { ...error, submittedContent: input.content } };
    },
    async deleteFile() {
      return { success: false as const, error };
    },
    async commitMedia() {
      return { success: false as const, error };
    },
  };
}

function parseGitHubTarget(config: GitHubTargetConfig) {
  const owner = typeof config.github?.owner === "string" ? config.github.owner.trim() : "";
  const repo = typeof config.github?.repo === "string" ? config.github.repo.trim() : "";
  const branch = typeof config.github?.branch === "string" ? config.github.branch.trim() : "";

  if (!owner || !repo || !branch || owner === "replace-me" || repo === "replace-me") {
    return {
      success: false as const,
      error: repositoryFailure("missing-config", {
        message: "GitHub repository target is not configured in content/site.json.",
      }),
    };
  }

  return { success: true as const, data: { owner, repo, branch } };
}

async function readGitHubTarget(root: string) {
  try {
    const raw = await readFile(path.join(root, "content/site.json"), "utf8");
    return parseGitHubTarget(JSON.parse(raw) as GitHubTargetConfig);
  } catch {
    return parseGitHubTarget(bundledSiteConfig);
  }
}

export async function createRuntimeContentAdapter(root: string): Promise<ContentAdapter> {
  if (!githubAppEnvConfigured()) return createLocalContentAdapter(root);

  const target = await readGitHubTarget(root);
  if (!target.success) return failingAdapter(target.error);

  const credential = await getGitHubAppInstallationToken({});
  const adapter = createGitHubContentAdapterFromCredential({
    ...target.data,
    credential,
  });

  return adapter.success ? adapter.data : failingAdapter(adapter.error);
}
