export type PublicRefreshOperation = "publish" | "unpublish" | "archive" | "retry";

export type PublicRefreshMetadata = {
  slug?: string;
  category?: string;
  tags?: string[];
  status?: "draft" | "published" | "archived";
};

export type PublicRefreshRequest = {
  operation: PublicRefreshOperation;
  previous?: PublicRefreshMetadata;
  next?: PublicRefreshMetadata;
};

export type PublicRefreshResult =
  | { ok: true; targets: string[]; refreshedAt: string }
  | {
      ok: false;
      targets: string[];
      failedTargets: string[];
      refreshedAt?: string;
      message: string;
      retryable: boolean;
    };

export type PublicRefreshRetryToken = {
  operation: Exclude<PublicRefreshOperation, "retry">;
  targets: string[];
  postPath: string;
  postSha: string;
  issuedAt: string;
};

type PublicRefreshEnv = {
  [key: string]: string | undefined;
  BLOG_DEPLOY_HOOK_URL?: string;
  BLOG_REVALIDATE_SECRET?: string;
  BLOG_REVALIDATE_URL?: string;
  VERCEL_DEPLOY_HOOK_URL?: string;
};

type RefreshFetch = (
  input: string | URL,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  },
) => Promise<{ ok: boolean; status: number }>;

function configured(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned && cleaned !== "replace-me" ? cleaned : undefined;
}

function addMetadataTargets(targets: Set<string>, metadata?: PublicRefreshMetadata) {
  if (!metadata) return;
  if (metadata.slug) {
    targets.add(`/posts/${metadata.slug}`);
    targets.add(`/og/${metadata.slug}`);
  }
  if (metadata.category) targets.add(`/categories/${metadata.category}`);
  for (const tag of metadata.tags ?? []) targets.add(`/tags/${tag}`);
}

export function publicRefreshTargets(request: PublicRefreshRequest): string[] {
  if (request.operation === "retry") return [];
  const targets = new Set(["/", "/rss.xml", "/sitemap.xml", "/robots.txt"]);
  addMetadataTargets(targets, request.previous);
  addMetadataTargets(targets, request.next);
  return [...targets];
}

export function createConfiguredPublicRefresh(
  env: PublicRefreshEnv = process.env,
  refreshFetch: RefreshFetch = fetch,
) {
  const deployHookUrl = configured(env.BLOG_DEPLOY_HOOK_URL ?? env.VERCEL_DEPLOY_HOOK_URL);
  if (deployHookUrl) {
    let requested = false;
    return async () => {
      if (requested) return;
      requested = true;
      const response = await refreshFetch(deployHookUrl, { method: "POST" });
      if (!response.ok) throw new Error(`Blog deploy hook failed with ${response.status}`);
    };
  }

  const revalidateUrl = configured(env.BLOG_REVALIDATE_URL);
  const revalidateSecret = configured(env.BLOG_REVALIDATE_SECRET);
  if (revalidateUrl && revalidateSecret) {
    return async (target: string) => {
      const response = await refreshFetch(revalidateUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: target, secret: revalidateSecret }),
      });
      if (!response.ok) throw new Error(`Blog revalidate failed with ${response.status}`);
    };
  }

  return undefined;
}

export async function refreshPublicTargets(
  targets: string[],
  refresh: (target: string) => Promise<void> | void = () => {},
  now = new Date(),
): Promise<PublicRefreshResult> {
  const failedTargets: string[] = [];
  for (const target of targets) {
    try {
      await refresh(target);
    } catch {
      failedTargets.push(target);
    }
  }
  if (failedTargets.length > 0) {
    return {
      ok: false,
      targets,
      failedTargets,
      message: "Public refresh failed",
      retryable: true,
    };
  }
  return { ok: true, targets, refreshedAt: now.toISOString() };
}

export function createPublicRefreshRetryToken(input: {
  operation: Exclude<PublicRefreshOperation, "retry">;
  targets: string[];
  postPath: string;
  postSha: string;
  now?: Date;
}): PublicRefreshRetryToken {
  return {
    operation: input.operation,
    targets: input.targets,
    postPath: input.postPath,
    postSha: input.postSha,
    issuedAt: (input.now ?? new Date()).toISOString(),
  };
}
