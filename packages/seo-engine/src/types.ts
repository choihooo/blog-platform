export type SeoStatus = "draft" | "published" | "archived";
export type SeoIssueSeverity = "blocking" | "warning" | "passed";

export type SeoIssue = {
  code: string;
  message: string;
  field: string;
  severity: SeoIssueSeverity;
  points?: number;
};

export type SeoSite = {
  siteName: string;
  siteUrl: string;
  description?: string;
  defaultAuthor?: SeoAuthor;
};

export type SeoAuthor = {
  id: string;
  name: string;
  avatar?: string;
};

export type SeoTaxonomy = {
  slug: string;
  label: string;
  description?: string;
};

export type SeoSubject = {
  path: string;
  status: SeoStatus;
  site: SeoSite;
  title?: string;
  slug?: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  author?: SeoAuthor;
  publishedAt?: string;
  updatedAt?: string;
  category?: SeoTaxonomy;
  tags: SeoTaxonomy[];
  coverImage?: string;
  body: string;
  headings: Array<{ depth: number; text: string; slug: string }>;
  toc: Array<{ depth: number; text: string; slug: string }>;
  readingTime?: { minutes: number; words: number; label: string };
  imageAltTexts: string[];
  internalLinks: string[];
};

export type SeoReport = {
  score: number;
  status: "blocking" | "warning" | "pass";
  blockingIssues: SeoIssue[];
  warnings: SeoIssue[];
  passedChecks: SeoIssue[];
  searchPreview: { title: string; description: string; url: string };
  socialPreview: { title: string; description: string; image: string };
  jsonLdPreview: unknown[];
  generatedUrls: { publicUrl?: string; canonical?: string; ogImage?: string };
  evaluatedAt: string;
};

export type PageMetadata = {
  title: string;
  description: string;
  canonical: string;
  openGraph: {
    title: string;
    description: string;
    url: string;
    type: "article" | "website";
    images: string[];
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
    images: string[];
  };
};

export type FeedItem = {
  title: string;
  link: string;
  guid: string;
  pubDate: string;
  description?: string;
};

export type FeedOutput = {
  title: string;
  link: string;
  items: FeedItem[];
};

export type SitemapEntry = {
  loc: string;
  lastModified?: string;
};

export type RobotsPolicy = {
  lines: string[];
};

export type OgImagePayload = {
  width: 1200;
  height: 630;
  title: string;
  siteName: string;
  author?: string;
  category?: string;
  coverImage?: string;
  fallback: boolean;
  publicPostUrl: string;
};
