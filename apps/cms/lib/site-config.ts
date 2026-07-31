import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type SiteConfig = {
  siteName: string;
  siteUrl: string;
  defaultAuthor: string;
  adminGithubLogin: string;
  adminGithubUserId: string;
  github: {
    owner: string;
    repo: string;
    branch: string;
  };
  analytics: {
    provider: string;
    ga4PropertyId?: string;
    searchConsoleProperty?: string;
  };
  features: {
    aiAssistant: boolean;
    internalLinkSuggestions: boolean;
  };
};

export const siteConfigPath = "content/site.json";

const cmsSourceDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(cmsSourceDirectory, "../..");

type SiteConfigInput = Partial<
  Omit<SiteConfig, "github" | "analytics" | "features"> & {
    github: Partial<SiteConfig["github"]>;
    analytics: Partial<SiteConfig["analytics"]>;
    features: Partial<SiteConfig["features"]>;
  }
>;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function envFlag(value: string | undefined) {
  return value === "1" || value === "true";
}

function repoNameFromEnv() {
  const fullName = clean(process.env.GITHUB_REPOSITORY);
  if (!fullName.includes("/")) return "";
  return fullName.split("/")[1] ?? "";
}

function ownerFromEnv() {
  const fullName = clean(process.env.GITHUB_REPOSITORY);
  if (fullName.includes("/")) return fullName.split("/")[0] ?? "";
  return clean(process.env.GITHUB_REPOSITORY_OWNER);
}

export function defaultSiteConfig(): SiteConfig {
  const ga4PropertyId = clean(
    process.env.GA4_PROPERTY_ID ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  );
  const gtmId = clean(process.env.NEXT_PUBLIC_GTM_ID);
  const provider =
    clean(process.env.ANALYTICS_PROVIDER) || (gtmId ? "gtm" : ga4PropertyId ? "ga4" : "disabled");

  return {
    siteName: clean(process.env.SITE_NAME) || "Blog",
    siteUrl:
      clean(process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL) || "http://localhost:3000",
    defaultAuthor: clean(process.env.DEFAULT_AUTHOR) || "admin",
    adminGithubLogin: clean(process.env.ADMIN_GITHUB_LOGIN) || "replace-me",
    adminGithubUserId: clean(process.env.ADMIN_GITHUB_USER_ID) || "0",
    github: {
      owner: clean(process.env.CONTENT_REPO_OWNER) || ownerFromEnv() || "replace-me",
      repo: clean(process.env.CONTENT_REPO_NAME) || repoNameFromEnv() || "replace-me",
      branch:
        clean(
          process.env.CONTENT_REPO_BRANCH ??
            process.env.VERCEL_GIT_COMMIT_REF ??
            process.env.GITHUB_REF_NAME,
        ) || "main",
    },
    analytics: {
      provider,
      ga4PropertyId: ga4PropertyId || undefined,
      searchConsoleProperty: clean(process.env.SEARCH_CONSOLE_PROPERTY) || undefined,
    },
    features: {
      aiAssistant: envFlag(process.env.FEATURE_AI_ASSISTANT),
      internalLinkSuggestions: envFlag(process.env.FEATURE_INTERNAL_LINK_SUGGESTIONS),
    },
  };
}

export function normalizeSiteConfig(input: SiteConfigInput = {}): SiteConfig {
  const fallback = defaultSiteConfig();

  return {
    siteName: clean(input.siteName) || fallback.siteName,
    siteUrl: clean(input.siteUrl) || fallback.siteUrl,
    defaultAuthor: clean(input.defaultAuthor) || fallback.defaultAuthor,
    adminGithubLogin: clean(input.adminGithubLogin) || fallback.adminGithubLogin,
    adminGithubUserId: clean(input.adminGithubUserId) || fallback.adminGithubUserId,
    github: {
      owner: clean(input.github?.owner) || fallback.github.owner,
      repo: clean(input.github?.repo) || fallback.github.repo,
      branch: clean(input.github?.branch) || fallback.github.branch,
    },
    analytics: {
      provider: clean(input.analytics?.provider) || fallback.analytics.provider,
      ga4PropertyId: clean(input.analytics?.ga4PropertyId) || fallback.analytics.ga4PropertyId,
      searchConsoleProperty:
        clean(input.analytics?.searchConsoleProperty) || fallback.analytics.searchConsoleProperty,
    },
    features: {
      aiAssistant: input.features?.aiAssistant ?? fallback.features.aiAssistant,
      internalLinkSuggestions:
        input.features?.internalLinkSuggestions ?? fallback.features.internalLinkSuggestions,
    },
  };
}

function resolveSiteConfigRoot() {
  if (process.env.NODE_ENV === "test") {
    const cwd = process.cwd();
    return cwd.endsWith(path.join("apps", "cms")) ? path.resolve(cwd, "../..") : cwd;
  }
  return repositoryRoot;
}

export async function loadSiteConfig(root = resolveSiteConfigRoot()): Promise<SiteConfig> {
  try {
    const raw = await readFile(path.join(root, siteConfigPath), "utf8");
    return normalizeSiteConfig(JSON.parse(raw) as SiteConfigInput);
  } catch {
    return defaultSiteConfig();
  }
}
