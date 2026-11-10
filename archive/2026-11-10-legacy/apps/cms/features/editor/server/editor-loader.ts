import { createEmptyEditorDocument, postRecordToEditorDocument } from "@blog-platform/core/content";
import type {
  EditorCategoryOption,
  EditorLoadResult,
  EditorSiteAnalyticsConfig,
} from "../model/document";
export type {
  EditorCategoryOption,
  EditorLoadResult,
  EditorSiteAnalyticsConfig,
} from "../model/document";

import type { ContentAdapter } from "@blog-platform/core/content";
import { createContentAdapter } from "@blog-platform/core/storage";
import { repositoryRoot } from "../../../shared/server/repository-root";
import { loadSiteConfig } from "../../../shared/server/site-config";

export function slugFromPath(path: string) {
  return path.replace(/^db\/posts\//, "");
}

export function createNewEditorDocument(now = new Date()) {
  return createEmptyEditorDocument(now);
}

export async function loadEditorDocument(
  path: string,
  adapter?: ContentAdapter,
): Promise<EditorLoadResult> {
  const contentAdapter = adapter ?? createContentAdapter();
  const loaded = await contentAdapter.getPostBySlug(slugFromPath(path), {
    includeUnpublished: true,
  });
  if (!loaded.ok) return { ok: false, code: "missing-file", message: loaded.error.message };
  if (!loaded.data) return { ok: false, code: "missing-file", message: "Post not found" };
  return { ok: true, document: postRecordToEditorDocument(loaded.data) };
}

export function pathForSlug(slug: string) {
  return `db/posts/${slug}`;
}

export async function loadEditorSiteAnalyticsConfig(
  root = repositoryRoot(),
): Promise<EditorSiteAnalyticsConfig> {
  const config = await loadSiteConfig(root);

  return {
    siteUrl: config.siteUrl,
    analytics: {
      provider: config.analytics.provider,
      ga4PropertyId: config.analytics.ga4PropertyId,
      searchConsoleProperty: config.analytics.searchConsoleProperty,
    },
  };
}

export async function loadEditorCategories(): Promise<EditorCategoryOption[]> {
  const adapter = createContentAdapter();
  const [depth1, depth2] = await Promise.all([
    adapter.listCategories({ depth: 1 }),
    adapter.listCategories({ depth: 2 }),
  ]);
  const categories = [
    ...(depth1.ok ? depth1.data.items : []),
    ...(depth2.ok ? depth2.data.items : []),
  ];
  return categories
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      depth: category.depth,
      parentSlug: category.parentSlug ?? undefined,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}
