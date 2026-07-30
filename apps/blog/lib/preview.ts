import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { analyzeMdx, parsePostFile } from "@blog-platform/markdown";

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

const defaultContentRoot = path.resolve(process.cwd(), "../../content");

export function previewCacheControl() {
  return "private, no-store";
}

function safeSlug(slug: string): string | undefined {
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(slug)) return undefined;
  return slug;
}

export async function loadDraftPreview(input: {
  slug: string;
  token: string;
  secret?: string;
  contentRoot?: string;
  now?: Date;
}): Promise<DraftPreviewResult> {
  const slug = safeSlug(input.slug);
  const secret = input.secret ?? process.env.PREVIEW_TOKEN_SECRET;
  if (!slug || !secret || !input.token) return { ok: false, reason: "invalid-token" };

  let source: string;
  try {
    source = await readFile(
      path.join(input.contentRoot ?? defaultContentRoot, "posts", `${slug}.mdx`),
      "utf8",
    );
  } catch {
    return { ok: false, reason: "missing" };
  }

  const contentSha = createHash("sha256").update(source).digest("hex");
  const token = verifyPreviewToken(input.token, { slug, contentSha, secret, now: input.now });
  if (!token.ok) return { ok: false, reason: "invalid-token" };

  const parsed = parsePostFile({ path: `posts/${slug}.mdx`, source });
  if (!parsed.success || !parsed.data || parsed.data.slug !== slug) {
    return { ok: false, reason: "missing" };
  }
  if (parsed.data.status === "published") return { ok: false, reason: "published" };

  const analysis = analyzeMdx({ path: `posts/${slug}.mdx`, source });
  if (!analysis.success || !analysis.data) return { ok: false, reason: "unsafe-mdx" };

  return {
    ok: true,
    post: {
      title: parsed.data.title ?? slug,
      slug,
      body: analysis.data.body,
      readingTimeLabel: analysis.data.readingTime.label,
      toc: analysis.data.toc,
    },
  };
}
