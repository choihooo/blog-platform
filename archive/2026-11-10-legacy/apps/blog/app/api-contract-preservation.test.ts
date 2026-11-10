import { afterEach, describe, expect, it, vi } from "vitest";
import { issuePreviewToken } from "../../cms/lib/security/preview-token";
import { verifyPreviewToken } from "../features/blog/server/preview-token";
import { createRemoteSource } from "../features/blog/server/content-source-remote";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("public API preservation", () => {
  it("accepts CMS preview tokens and rejects expired, stale and other-slug access", () => {
    const now = new Date("2026-11-08T00:00:00Z");
    const input = {
      slug: "private-draft",
      contentSha: "revision-1",
      secret: "fixture-secret",
      now,
    };
    const token = issuePreviewToken({ ...input, nonce: "fixture-nonce" });
    expect(verifyPreviewToken(token, input).ok).toBe(true);
    expect(verifyPreviewToken(token, { ...input, slug: "different" })).toEqual({
      ok: false,
      reason: "slug-mismatch",
    });
    expect(verifyPreviewToken(token, { ...input, contentSha: "revision-2" })).toEqual({
      ok: false,
      reason: "stale-content",
    });
    expect(verifyPreviewToken(token, { ...input, now: new Date("2026-11-08T00:30:01Z") })).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("distinguishes genuine missing posts from remote storage failures", async () => {
    vi.stubEnv("BLOG_CONTENT_PROXY_URL", "https://content.example.test");
    vi.stubGlobal("fetch", async () => new Response(null, { status: 404 }));
    expect(await createRemoteSource().getPostBySlug("missing")).toBeUndefined();
    vi.stubGlobal("fetch", async () => new Response(null, { status: 502 }));
    await expect(createRemoteSource().getPostBySlug("missing")).rejects.toThrow(
      "content_unavailable",
    );
    await expect(createRemoteSource().listPostPage()).rejects.toThrow("content_unavailable");
  });
});
