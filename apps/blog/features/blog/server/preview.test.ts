import { createHmac } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { serializePostContent } from "@blog-platform/editor";

import { loadDraftPreview } from "./preview";

const getPostBySlug = vi.fn();

vi.mock("../../../../cms/lib/content-adapter/content-adapter", () => ({
  createContentAdapter: () => ({ getPostBySlug }),
}));

function issue(input: { slug?: string; contentSha: string; exp?: number; secret?: string }) {
  const payload = {
    slug: input.slug ?? "draft",
    contentSha: input.contentSha,
    exp: input.exp ?? 2_000_000_000,
    nonce: "nonce",
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", input.secret ?? "preview-secret")
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

function draftRecord(overrides = {}) {
  return {
    id: "post_draft",
    slug: "draft",
    title: "Draft",
    content: serializePostContent({
      version: 1,
      nodes: [{ type: "heading", depth: 1, text: "Draft" }],
    }),
    summary: "",
    categoryId: null,
    categoryPath: null,
    heroImageKey: null,
    publishedAt: null,
    updatedAt: "2026-07-30T00:00:00.000Z",
    isPublished: 0,
    viewCount: 0,
    tags: [],
    mediaRefs: [],
    ...overrides,
  };
}

beforeEach(() => {
  getPostBySlug.mockReset();
});

describe("draft preview loader", () => {
  it("loads a valid draft preview", async () => {
    const contentSha = "2026-07-30T00:00:00.000Z:draft";
    getPostBySlug.mockResolvedValueOnce({ ok: true, data: draftRecord() });

    const result = await loadDraftPreview({
      slug: "draft",
      token: issue({ contentSha }),
      secret: "preview-secret",
    });

    expect(result).toMatchObject({ ok: true, post: { title: "Draft", body: "Draft" } });
    expect(getPostBySlug).toHaveBeenCalledWith("draft", { includeUnpublished: true });
  });

  it("rejects expired, slug mismatch, stale contentSha, and invalid signature states", async () => {
    const contentSha = "2026-07-30T00:00:00.000Z:draft";
    getPostBySlug.mockResolvedValue({ ok: true, data: draftRecord() });

    await expect(
      loadDraftPreview({
        slug: "draft",
        token: issue({ contentSha, exp: 1 }),
        secret: "preview-secret",
        now: new Date("2026-07-30T00:00:00.000Z"),
      }),
    ).resolves.toMatchObject({ ok: false, reason: "invalid-token" });
    await expect(
      loadDraftPreview({
        slug: "draft",
        token: issue({ slug: "other", contentSha }),
        secret: "preview-secret",
      }),
    ).resolves.toMatchObject({ ok: false, reason: "invalid-token" });
    await expect(
      loadDraftPreview({
        slug: "draft",
        token: issue({ contentSha: "stale" }),
        secret: "preview-secret",
      }),
    ).resolves.toMatchObject({ ok: false, reason: "invalid-token" });
    await expect(
      loadDraftPreview({
        slug: "draft",
        token: `${issue({ contentSha })}x`,
        secret: "preview-secret",
      }),
    ).resolves.toMatchObject({ ok: false, reason: "invalid-token" });
  });

  it("treats legacy markup as inert text", async () => {
    const contentSha = "2026-07-30T00:00:00.000Z:draft";
    getPostBySlug.mockResolvedValueOnce({
      ok: true,
      data: draftRecord({ content: "<script>x</script>" }),
    });

    await expect(
      loadDraftPreview({
        slug: "draft",
        token: issue({ contentSha }),
        secret: "preview-secret",
      }),
    ).resolves.toMatchObject({ ok: true, post: { body: "<script>x</script>" } });
  });
});
