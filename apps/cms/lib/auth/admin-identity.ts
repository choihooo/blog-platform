import { readFile } from "node:fs/promises";
import path from "node:path";

import bundledSiteConfig from "../../../../content/site.json";

import type { AdminIdentity } from "./types";

type SiteConfigLike = {
  adminGithubLogin?: unknown;
  adminGithubUserId?: unknown;
};

export type AdminIdentityResult =
  { success: true; identity: AdminIdentity } | { success: false; reason: string };

const siteConfigPath = "content/site.json";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseAdminIdentity(config: SiteConfigLike): AdminIdentityResult {
  const githubLogin = clean(config.adminGithubLogin);
  const githubUserId = clean(config.adminGithubUserId);

  if (!githubLogin) {
    return { success: false, reason: "adminGithubLogin is required" };
  }

  if (!githubUserId) {
    return { success: false, reason: "adminGithubUserId is required" };
  }

  if (githubLogin === "replace-me" || githubUserId === "0") {
    return { success: false, reason: "admin GitHub identity must be configured" };
  }

  return { success: true, identity: { githubLogin, githubUserId, sourcePath: siteConfigPath } };
}

export async function loadAdminIdentity(root = process.cwd()): Promise<AdminIdentityResult> {
  try {
    const raw = await readFile(path.join(root, siteConfigPath), "utf8");
    return parseAdminIdentity(JSON.parse(raw) as SiteConfigLike);
  } catch {
    if (root === process.cwd()) {
      return parseAdminIdentity(bundledSiteConfig);
    }

    return { success: false, reason: "content/site.json could not be read" };
  }
}
