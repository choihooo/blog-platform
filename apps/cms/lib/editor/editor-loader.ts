import {
  createEmptyEditorDocument,
  mdxToEditorDocument,
  type EditorDocument,
} from "@blog-platform/editor";
import { readFile } from "node:fs/promises";
import path from "node:path";

import bundledSiteConfig from "../../../../content/site.json";

import {
  createRuntimeContentAdapter,
  type ContentAdapter,
  type RepositoryFileSummary,
} from "../content-adapter/index";
import { repositoryRoot } from "./root";

export type PostSummary = {
  path: string;
  slug: string;
  title: string;
  status: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  publishedAt?: string;
  updatedAt?: string;
  sha: string;
};

export type EditorLoadResult =
  | { ok: true; document: EditorDocument }
  | {
      ok: false;
      code: "missing-file" | "unsupported-mdx" | "unsafe-mdx" | "invalid-frontmatter";
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

function slugFromPath(path: string) {
  return path.replace(/^(?:content|db)\/posts\//, "").replace(/\.mdx$/, "");
}

function titleFromSource(source: string, fallback: string) {
  return /^title:\s*"?([^"\n]+)"?/m.exec(source)?.[1]?.trim() ?? fallback;
}

function statusFromSource(source: string) {
  return /^status:\s*"?([^"\n]+)"?/m.exec(source)?.[1]?.trim() ?? "draft";
}

function optionalFrontmatterString(source: string, key: string) {
  return new RegExp(`^${key}:\\s*['"]?([^'"\\n]+)['"]?`, "m").exec(source)?.[1]?.trim();
}

export async function listPostSummaries(adapter?: ContentAdapter): Promise<PostSummary[]> {
  const contentAdapter = adapter ?? (await createRuntimeContentAdapter(repositoryRoot()));
  const listed = await contentAdapter.listFiles({ root: "posts" });
  if (!listed.success) return [];
  const posts = await Promise.all(
    listed.data.files
      .filter((file): file is RepositoryFileSummary & { kind: "post" } => file.kind === "post")
      .map(async (file): Promise<PostSummary | null> => {
        const read = await contentAdapter.readFile({ path: file.path });
        if (!read.success) return null;
        return {
          path: file.path,
          slug: slugFromPath(file.path),
          title: titleFromSource(read.data.file.content, slugFromPath(file.path)),
          status: statusFromSource(read.data.file.content),
          excerpt: optionalFrontmatterString(read.data.file.content, "excerpt"),
          category: optionalFrontmatterString(read.data.file.content, "category"),
          coverImage: optionalFrontmatterString(read.data.file.content, "coverImage"),
          publishedAt: optionalFrontmatterString(read.data.file.content, "publishedAt"),
          updatedAt: optionalFrontmatterString(read.data.file.content, "updatedAt"),
          sha: read.data.file.sha,
        };
      }),
  );
  return posts.filter((post): post is PostSummary => post !== null);
}

export function createNewEditorDocument(now = new Date()) {
  return createEmptyEditorDocument(now);
}

export async function loadEditorDocument(
  path: string,
  adapter?: ContentAdapter,
): Promise<EditorLoadResult> {
  const contentAdapter = adapter ?? (await createRuntimeContentAdapter(repositoryRoot()));
  const read = await contentAdapter.readFile({ path });
  if (!read.success) return { ok: false, code: "missing-file", message: read.error.message };
  const loaded = mdxToEditorDocument({
    path: read.data.file.path,
    source: read.data.file.content,
    sha: read.data.file.sha,
  });
  if (!loaded.ok) {
    return {
      ok: false,
      code: loaded.code,
      message: loaded.issues[0]?.message ?? "This MDX file cannot be edited safely",
      rawSource: loaded.rawSource,
    };
  }
  return { ok: true, document: loaded.document };
}

export function pathForSlug(slug: string) {
  return `db/posts/${slug}`;
}

export async function loadEditorSiteAnalyticsConfig(
  root = repositoryRoot(),
): Promise<EditorSiteAnalyticsConfig> {
  let config: {
    siteUrl?: string;
    analytics?: {
      provider?: string;
      ga4PropertyId?: string;
      searchConsoleProperty?: string;
    };
  };

  try {
    config = JSON.parse(
      await readFile(path.join(root, "content/site.json"), "utf8"),
    ) as typeof config;
  } catch {
    config = bundledSiteConfig;
  }

  return {
    siteUrl: config.siteUrl ?? "",
    analytics: {
      provider: config.analytics?.provider ?? "disabled",
      ga4PropertyId: config.analytics?.ga4PropertyId,
      searchConsoleProperty: config.analytics?.searchConsoleProperty,
    },
  };
}
