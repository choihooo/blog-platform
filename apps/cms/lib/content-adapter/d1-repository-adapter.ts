import { createHash, randomUUID } from "node:crypto";

import { parsePostFile, serializeFrontmatter } from "@blog-platform/markdown";

import { createContentAdapter } from "./content-adapter";
import type { ContentFailure, PostRecord } from "./content-adapter.interface";
import type {
  AdapterResult,
  ContentAdapter,
  ContentChangeRequest,
  ContentChangeResult,
  ListFilesRoot,
  RepositoryContentFile,
  RepositoryFailureCode,
} from "./types";

const AUTHOR_IDENTITY = "cms-editor";

function slugFromPath(path: string) {
  return path.replace(/^(?:content|db)\/posts\//, "").replace(/\.mdx$/, "");
}

function pathForSlug(slug: string) {
  return `db/posts/${slug}`;
}

function shaFor(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function mapFailureCode(code: ContentFailure["code"]): RepositoryFailureCode {
  if (code === "auth-required" || code === "forbidden") return "unauthorized";
  if (code === "not-found") return "missing-file";
  if (code === "conflict") return "duplicate-file";
  if (code === "retryable-failure" || code === "storage-failure" || code === "upstream-failure") {
    return "temporary-connectivity";
  }
  if (code === "validation-failure") return "validation-failure";
  return "unknown";
}

function repositoryFailure(error: ContentFailure, submittedContent?: string): AdapterResult<never> {
  return {
    success: false,
    error: {
      code: mapFailureCode(error.code),
      message: error.message,
      retryable: error.retryable,
      path: error.path,
      submittedContent,
    },
  };
}

function unsupportedRoot(root: ListFilesRoot): AdapterResult<{ files: [] }> {
  if (root === "posts") return { success: true, data: { files: [] } };
  return { success: true, data: { files: [] } };
}

function postToSource(post: PostRecord) {
  const serialized = serializeFrontmatter({
    title: post.title,
    status: post.isPublished === 1 ? "published" : post.publishedAt ? "archived" : "draft",
    slug: post.slug,
    publishedAt: post.publishedAt ?? undefined,
    updatedAt: post.updatedAt,
    excerpt: post.summary || undefined,
    coverImage: post.heroImageKey || undefined,
    category: post.categoryPath || undefined,
    tags: post.tags,
  });
  const frontmatter = serialized.success && serialized.data ? serialized.data : "---\n---";
  return `${frontmatter}\n\n${post.content}\n`;
}

function postToFile(post: PostRecord): RepositoryContentFile {
  const content = postToSource(post);
  return {
    path: pathForSlug(post.slug),
    kind: "post",
    content,
    encoding: "utf8",
    sha: shaFor(content),
    sizeBytes: Buffer.byteLength(content, "utf8"),
    updatedAt: post.updatedAt,
  };
}

function postFromChange(
  input: ContentChangeRequest,
  existing?: PostRecord,
): AdapterResult<PostRecord> {
  const parsed = parsePostFile({ path: input.path, source: input.content });
  if (!parsed.success || !parsed.data) {
    return {
      success: false,
      error: {
        code: "validation-failure",
        message: parsed.issues[0]?.message ?? "Post frontmatter is invalid",
        retryable: false,
        path: input.path,
        submittedContent: input.content,
      },
    };
  }

  const now = new Date().toISOString();
  const post = parsed.data;
  const slug = post.slug || slugFromPath(input.path);
  const updatedAt = post.updatedAt ?? now;
  return {
    success: true,
    data: {
      id:
        existing?.id ??
        createHash("md5")
          .update(slug || randomUUID())
          .digest("hex"),
      slug,
      title: post.title ?? "Untitled",
      content: post.body,
      summary: post.excerpt ?? "",
      categoryId: existing?.categoryId ?? null,
      categoryPath: post.category ?? existing?.categoryPath ?? null,
      heroImageKey: post.coverImage ?? existing?.heroImageKey ?? null,
      publishedAt: post.status === "published" ? (post.publishedAt ?? null) : null,
      updatedAt,
      isPublished: post.status === "published" ? 1 : 0,
      viewCount: existing?.viewCount ?? 0,
      tags: post.tags ?? existing?.tags ?? [],
      mediaRefs: existing?.mediaRefs ?? [],
    },
  };
}

export function createD1RepositoryContentAdapter(): ContentAdapter {
  const adapter = createContentAdapter("d1r2");

  async function readExisting(slug: string) {
    const result = await adapter.getPostBySlug(slug, { includeUnpublished: true });
    return result.ok ? result.data : null;
  }

  function changeResult(
    post: PostRecord,
    status: ContentChangeResult["status"],
  ): ContentChangeResult {
    const file = postToFile(post);
    return {
      path: file.path,
      sha: file.sha,
      summary: `${status} ${file.path}`,
      status,
    };
  }

  return {
    async listFiles(input) {
      if (input.root !== "posts") return unsupportedRoot(input.root);
      const result = await adapter.listPosts({ publishedOnly: false, page: 1, limit: 100 });
      if (!result.ok) return repositoryFailure(result.error);
      return {
        success: true,
        data: {
          files: result.data.items.map((post) => {
            const file = postToFile(post);
            return {
              path: file.path,
              kind: file.kind,
              sha: file.sha,
              sizeBytes: file.sizeBytes,
            };
          }),
        },
      };
    },

    async readFile(input) {
      const slug = slugFromPath(input.path);
      const result = await adapter.getPostBySlug(slug, { includeUnpublished: true });
      if (!result.ok) return repositoryFailure(result.error);
      if (!result.data) {
        return {
          success: false,
          error: {
            code: "missing-file",
            message: "Post not found",
            retryable: false,
            path: input.path,
          },
        };
      }
      return { success: true, data: { file: postToFile(result.data) } };
    },

    async createFile(input) {
      const parsed = postFromChange(input);
      if (!parsed.success) return parsed;
      const result = await adapter.createPost({
        post: parsed.data,
        authorIdentity: AUTHOR_IDENTITY,
      });
      if (!result.ok) return repositoryFailure(result.error, input.content);
      return { success: true, data: changeResult(result.data, "created") };
    },

    async updateFile(input) {
      const currentSlug = slugFromPath(input.path);
      const existing = await readExisting(currentSlug);
      const parsed = postFromChange(input, existing ?? undefined);
      if (!parsed.success) return parsed;
      const result = existing
        ? await adapter.updatePost({
            slug: currentSlug,
            post: parsed.data,
            authorIdentity: AUTHOR_IDENTITY,
          })
        : await adapter.createPost({
            post: parsed.data,
            authorIdentity: AUTHOR_IDENTITY,
          });
      if (!result.ok) return repositoryFailure(result.error, input.content);
      return { success: true, data: changeResult(result.data, existing ? "updated" : "created") };
    },

    async deleteFile(input) {
      const slug = slugFromPath(input.path);
      const result = await adapter.deletePost({ slug, authorIdentity: AUTHOR_IDENTITY });
      if (!result.ok) return repositoryFailure(result.error);
      return {
        success: true,
        data: {
          path: pathForSlug(result.data.slug),
          sha: input.expectedSha,
          summary: `deleted ${pathForSlug(result.data.slug)}`,
          status: "deleted",
        },
      };
    },

    async commitMedia(input) {
      return {
        success: false,
        error: {
          code: "temporary-connectivity",
          message: "D1/R2 editor media uploads must use the R2 upload pipeline",
          retryable: false,
          path: input.path,
          submittedContent: input.contentBase64,
        },
      };
    },
  };
}
