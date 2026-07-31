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
import { createContentAdapter } from "../content-adapter/content-adapter";
import { repositoryRoot } from "./root";

export type PostSummary = {
  path: string;
  slug: string;
  title: string;
  status: string;
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

export type EditorCategoryOption = {
  slug: string;
  name: string;
  depth: 1 | 2;
  parentSlug?: string | null;
};

export type ListPostSummariesOptions = {
  query?: string;
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

function normalizeSearchQuery(query?: string) {
  return query?.trim().replace(/\s+/g, " ").toLowerCase();
}

function matchesSearchQuery(input: {
  query?: string;
  path: string;
  slug: string;
  title: string;
  status: string;
  source: string;
}) {
  if (!input.query) return true;
  const haystack = [input.path, input.slug, input.title, input.status, input.source]
    .join("\n")
    .toLowerCase();
  return haystack.includes(input.query);
}

export async function listPostSummaries(
  adapter?: ContentAdapter,
  options: ListPostSummariesOptions = {},
) {
  const contentAdapter = adapter ?? (await createRuntimeContentAdapter(repositoryRoot()));
  const query = normalizeSearchQuery(options.query);
  const listed = await contentAdapter.listFiles({ root: "posts" });
  if (!listed.success) return [];
  const posts = await Promise.all(
    listed.data.files
      .filter((file): file is RepositoryFileSummary & { kind: "post" } => file.kind === "post")
      .map(async (file) => {
        const read = await contentAdapter.readFile({ path: file.path });
        if (!read.success) return null;
        const slug = slugFromPath(file.path);
        const title = titleFromSource(read.data.file.content, slug);
        const status = statusFromSource(read.data.file.content);
        if (
          !matchesSearchQuery({
            query,
            path: file.path,
            slug,
            title,
            status,
            source: read.data.file.content,
          })
        ) {
          return null;
        }
        return {
          path: file.path,
          slug,
          title,
          status,
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

export async function loadEditorCategories(): Promise<EditorCategoryOption[]> {
  const adapter = createContentAdapter("d1r2");
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
