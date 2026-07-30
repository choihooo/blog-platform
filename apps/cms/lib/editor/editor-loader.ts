import {
  createEmptyEditorDocument,
  mdxToEditorDocument,
  type EditorDocument,
} from "@blog-platform/editor";

import {
  createLocalContentAdapter,
  type ContentAdapter,
  type RepositoryFileSummary,
} from "../content-adapter/index";
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

function slugFromPath(path: string) {
  return path.replace(/^content\/posts\//, "").replace(/\.mdx$/, "");
}

function titleFromSource(source: string, fallback: string) {
  return /^title:\s*"?([^"\n]+)"?/m.exec(source)?.[1]?.trim() ?? fallback;
}

function statusFromSource(source: string) {
  return /^status:\s*"?([^"\n]+)"?/m.exec(source)?.[1]?.trim() ?? "draft";
}

export async function listPostSummaries(
  adapter: ContentAdapter = createLocalContentAdapter(repositoryRoot()),
) {
  const listed = await adapter.listFiles({ root: "posts" });
  if (!listed.success) return [];
  const posts = await Promise.all(
    listed.data.files
      .filter((file): file is RepositoryFileSummary & { kind: "post" } => file.kind === "post")
      .map(async (file) => {
        const read = await adapter.readFile({ path: file.path });
        if (!read.success) return null;
        return {
          path: file.path,
          slug: slugFromPath(file.path),
          title: titleFromSource(read.data.file.content, slugFromPath(file.path)),
          status: statusFromSource(read.data.file.content),
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
  adapter: ContentAdapter = createLocalContentAdapter(repositoryRoot()),
): Promise<EditorLoadResult> {
  const read = await adapter.readFile({ path });
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
  return `content/posts/${slug}.mdx`;
}
