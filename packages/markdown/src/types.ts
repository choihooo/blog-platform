export type PostStatus = "draft" | "published" | "archived";

export interface ValidationIssue {
  code: string;
  message: string;
  path: string[];
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  issues: ValidationIssue[];
}

export interface FileInput {
  path: string;
  source: string;
}

interface BasePost {
  path: string;
  body: string;
  title?: string;
  slug?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
}

export interface DraftPost extends BasePost {
  status: "draft";
}

export interface PublishedPost extends BasePost {
  status: "published";
  title: string;
  slug: string;
  author: string;
  publishedAt: string;
}

export interface ArchivedPost extends BasePost {
  status: "archived";
}

export type Post = DraftPost | PublishedPost | ArchivedPost;

export interface Author {
  path: string;
  id: string;
  name: string;
  body: string;
  githubLogin: string;
  githubUserId: string;
  bio?: string;
  avatar?: string;
}

export interface Category {
  slug: string;
  label: string;
  description?: string;
}

export interface Tag {
  slug: string;
  label: string;
  description?: string;
}

export interface SiteConfig {
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
  };
  features: {
    aiAssistant: boolean;
    internalLinkSuggestions: boolean;
  };
}

export interface ContentCollection {
  posts: Post[];
  authors: Author[];
  categories: Category[];
  tags: Tag[];
  site: SiteConfig;
}

export interface ContentCollectionInput {
  posts: FileInput[];
  authors: FileInput[];
  categoriesJson: string;
  tagsJson: string;
  siteJson: string;
}
