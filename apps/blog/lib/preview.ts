import { createHash } from "node:crypto";

import { analyzeMdx, serializeFrontmatter } from "@blog-platform/markdown";
import { createContentAdapter } from "../../cms/lib/content-adapter/content-adapter";
import type { PostRecord } from "../../cms/lib/content-adapter/content-adapter.interface";

import { verifyPreviewToken } from "./preview-token";

export type DraftPreviewResult =
  | {
      ok: true;
      post: {
        title: string;
        slug: string;
        body: string;
        readingTimeLabel: string;
        toc: Array<{ depth: number; text: string; slug: string }>;
      };
    }
  | { ok: false; reason: "missing" | "invalid-token" | "published" | "unsafe-mdx" };

export function previewCacheControl() {
  return "private, no-store";
}

function safeSlug(slug: string): string | undefined {
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(slug)) return undefined;
  return slug;
}

function compactFrontmatter(metadata: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }),
  );
}

function postStatus(post: PostRecord) {
  if (post.isPublished === 1) return "published";
  return post.publishedAt ? "archived" : "draft";
}

function postToSource(post: PostRecord) {
  const serialized = serializeFrontmatter(
    compactFrontmatter({
      title: post.title,
      status: postStatus(post),
      slug: post.slug,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      excerpt: post.summary,
      coverImage: post.heroImageKey,
      category: post.categoryPath,
      tags: post.tags,
    }),
  );
  if (!serialized.success || !serialized.data) return;
  return `${serialized.data}\n\n${post.content}\n`;
}

export async function loadDraftPreview(input: {
  slug: string;
  token: string;
  secret?: string;
  now?: Date;
}): Promise<DraftPreviewResult> {
  const slug = safeSlug(input.slug);
  const secret = input.secret ?? process.env.PREVIEW_TOKEN_SECRET;
  if (!slug || !secret || !input.token) return { ok: false, reason: "invalid-token" };

  const adapter = createContentAdapter("d1r2");
  const loaded = await adapter.getPostBySlug(slug, { includeUnpublished: true });
  if (!loaded.ok || !loaded.data) return { ok: false, reason: "missing" };
  if (postStatus(loaded.data) === "published") return { ok: false, reason: "published" };

  const source = postToSource(loaded.data);
  if (!source) return { ok: false, reason: "unsafe-mdx" };
  const contentSha = createHash("sha256").update(source).digest("hex");
  const token = verifyPreviewToken(input.token, { slug, contentSha, secret, now: input.now });
  if (!token.ok) return { ok: false, reason: "invalid-token" };

  const analysis = analyzeMdx({ path: `db/posts/${slug}.md`, source: loaded.data.content });
  if (!analysis.success || !analysis.data) return { ok: false, reason: "unsafe-mdx" };

  return {
    ok: true,
    post: {
      title: loaded.data.title,
      slug,
      body: analysis.data.body,
      readingTimeLabel: analysis.data.readingTime.label,
      toc: analysis.data.toc,
    },
  };
}
