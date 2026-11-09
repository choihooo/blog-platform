import type { EditorDocument } from "@blog-platform/core/content";
export type EditorLoadResult =
  | { ok: true; document: EditorDocument }
  | {
      ok: false;
      code: "missing-file" | "unsupported-content" | "unsafe-content" | "invalid-metadata";
      message: string;
      rawSource?: string;
    };

export type EditorSiteAnalyticsConfig = {
  siteUrl: string;
  analytics: {
    provider: string;
    ga4PropertyId?: string;
    searchConsoleProperty?: string;
  };
};

export type EditorCategoryOption = {
  slug: string;
  name: string;
  depth: 1 | 2;
  parentSlug?: string | null;
};
