export type PostStatus = "draft" | "published" | "archived";

export interface ValidationIssue {
  code: string;
  message: string;
  path: string[];
  severity?: "error" | "warning";
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
    ga4PropertyId?: string;
    searchConsoleProperty?: string;
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

export interface MdxDocumentInput {
  path: string;
  source: string;
}

export interface ParsedMdxDocument {
  path: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

export interface Heading {
  depth: number;
  text: string;
  slug: string;
}

export interface TocItem {
  depth: number;
  text: string;
  slug: string;
}

export interface ReadingTimeResult {
  minutes: number;
  words: number;
  label: string;
}

export interface CodeBlock {
  language: string;
  fallback: boolean;
}

export interface MdxAnalysis extends ParsedMdxDocument {
  headings: Heading[];
  toc: TocItem[];
  readingTime: ReadingTimeResult;
  codeBlocks: CodeBlock[];
  warnings: ValidationIssue[];
}

export interface MdxAnalysisOptions {
  tocMinDepth?: number;
  tocMaxDepth?: number;
  allowedComponents?: string[];
}
