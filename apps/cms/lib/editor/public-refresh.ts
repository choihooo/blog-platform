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
