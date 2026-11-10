import {
  analyzeEditorNodes,
  loadPostContent,
  textFromEditorNodes,
} from "@blog-platform/core/content";
import { createContentAdapter } from "@blog-platform/core/storage";
import type { PostRecord } from "@blog-platform/core/content";

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
  | { ok: false; reason: "missing" | "invalid-token" | "published" | "invalid-content" };

export function previewCacheControl() {
  return "private, no-store";
}

function safeSlug(slug: string): string | undefined {
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(slug)) return undefined;
  return slug;
}

function postStatus(post: PostRecord) {
  if (post.isPublished === 1) return "published";
  return post.publishedAt ? "archived" : "draft";
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

  const adapter = createContentAdapter();
  const loaded = await adapter.getPostBySlug(slug, { includeUnpublished: true });
  if (!loaded.ok || !loaded.data) return { ok: false, reason: "missing" };
  if (postStatus(loaded.data) === "published") return { ok: false, reason: "published" };

  const contentSha = `${loaded.data.updatedAt}:${loaded.data.slug}`;
  const token = verifyPreviewToken(input.token, { slug, contentSha, secret, now: input.now });
  if (!token.ok) return { ok: false, reason: "invalid-token" };

  const content = loadPostContent(loaded.data.content);
  const analysis = analyzeEditorNodes(content.nodes);

  return {
    ok: true,
    post: {
      title: loaded.data.title,
      slug,
      body: textFromEditorNodes(content.nodes),
      readingTimeLabel: analysis.readingTime.label,
      toc: analysis.headings,
    },
  };
}
