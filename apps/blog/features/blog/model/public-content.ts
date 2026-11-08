import type { EditorNode } from "@blog-platform/core/content";

export type Category = {
  slug: string;
  label: string;
  description?: string;
};

export type Tag = {
  slug: string;
  label: string;
  description?: string;
};

export type PublicPost = {
  path: string;
  status: "published" | "draft" | "archived";
  title: string;
  slug: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  excerpt?: string;
  coverImage?: string;
  body: string;
  bodyNodes: EditorNode[];
  authorProfile?: { id: string; name: string; avatar?: string };
  category?: string;
  categoryEntry?: Category;
  tagEntries: Tag[];
  tags?: string[];
  toc: Array<{ depth: number; text: string; slug: string }>;
  readingTimeLabel: string;
};

export type CategoryHierarchy = Category & {
  depth: 1 | 2;
  parentSlug?: string | null;
};
