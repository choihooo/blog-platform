import { loadSiteConfig, siteConfigPath } from "../../shared/server/site-config";
import type { AdminIdentity } from "./types";

type SiteConfigLike = {
  adminGithubLogin?: unknown;
  adminGithubUserId?: unknown;
};

export type AdminIdentityResult =
  { success: true; identity: AdminIdentity } | { success: false; reason: string };

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

export async function loadAdminIdentity(root?: string): Promise<AdminIdentityResult> {
  return parseAdminIdentity(await loadSiteConfig(root));
}
