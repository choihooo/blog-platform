import type { PublicPost, CategoryHierarchy } from "../model/public-content";
export type { PublicPost, Category, Tag, CategoryHierarchy } from "../model/public-content";
import type { PostRecord } from "@blog-platform/core/content";

export type ContentSourceMode = "d1r2" | "remote";

export type ContentFailureCode =
  | "validation-failure"
  | "auth-required"
  | "forbidden"
  | "not-found"
  | "conflict"
  | "upstream-failure"
  | "storage-failure"
  | "retryable-failure";

export type ContentFailure = {
  code: ContentFailureCode;
  message: string;
  retryable: boolean;
};

export type ContentSourceResult<T> =
  { success: true; data: T } | { success: false; error: ContentFailure };

export type ContentListInput = {
  publishedOnly?: boolean;
  page?: number;
  limit?: number;
  tagSlug?: string;
  categoryPath?: string;
  query?: string;
  includeTotal?: boolean;
  includeTags?: boolean;
  includeMedia?: boolean;
  analyzeBody?: boolean;
};

export type CategoryListInput = {
  depth: 1 | 2;
  parentSlug?: string;
};

export interface BlogContentSource {
  readonly mode: ContentSourceMode;
  listPostPage(input?: ContentListInput): Promise<{ items: PublicPost[]; total: number }>;
  listPosts(input?: ContentListInput): Promise<PublicPost[]>;
  getPostBySlug(slug: string, options?: { analyzeBody?: boolean }): Promise<PublicPost | undefined>;
  getPostsByTag(tagSlug: string, input?: Omit<ContentListInput, "tagSlug">): Promise<PublicPost[]>;
  getPostsByCategoryPath(
    categoryPath: string,
    input?: Omit<ContentListInput, "categoryPath">,
  ): Promise<PublicPost[]>;
  listCategories(input: CategoryListInput): Promise<CategoryHierarchy[]>;
  getCategoryByPath(path: string): Promise<CategoryHierarchy | undefined>;
  getSiteConfig(): Promise<{
    siteName: string;
    siteUrl: string;
    description: string;
    defaultAuthor: string;
    defaultAuthorName: string;
    defaultAuthorAvatar?: string;
    adminGithubLogin: string;
    adminGithubUserId: string;
    github: { owner: string; repo: string; branch: string };
    analytics: { provider: string; ga4PropertyId?: string; searchConsoleProperty?: string };
    features: { aiAssistant: boolean; internalLinkSuggestions: boolean };
  }>;
}

export type PostRecordWithTags = PostRecord & {
  tags?: string[];
};
