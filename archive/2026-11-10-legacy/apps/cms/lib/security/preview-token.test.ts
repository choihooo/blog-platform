import { describe, expect, it } from "vitest";

import { PREVIEW_TOKEN_TTL_SECONDS, issuePreviewToken, verifyPreviewToken } from "./preview-token";

describe("preview token", () => {
  it("issues a signed payload with slug, exp, contentSha, and nonce", () => {
    const now = new Date("2026-07-30T00:00:00.000Z");
    const token = issuePreviewToken({
      slug: "draft",
      contentSha: "sha",
      secret: "preview-secret",
      now,
      nonce: "nonce",
    });

    const result = verifyPreviewToken(token, {
      slug: "draft",
      contentSha: "sha",
      secret: "preview-secret",
      now,
    });

    expect(result.ok && result.payload).toMatchObject({
      slug: "draft",
      contentSha: "sha",
      nonce: "nonce",
      exp: Math.floor(now.getTime() / 1000) + PREVIEW_TOKEN_TTL_SECONDS,
    });
  });

  it("rejects expired, slug mismatch, stale content, and invalid signature states", () => {
    const token = issuePreviewToken({
      slug: "draft",
      contentSha: "sha",
      secret: "preview-secret",
      now: new Date("2026-07-30T00:30:00.000Z"),
      nonce: "nonce",
    });
    const expired = issuePreviewToken({
      slug: "draft",
      contentSha: "sha",
      secret: "preview-secret",
      now: new Date("2026-07-30T00:00:00.000Z"),
      nonce: "nonce",
    });

    expect(
      verifyPreviewToken(expired, {
        slug: "draft",
        contentSha: "sha",
        secret: "preview-secret",
        now: new Date("2026-07-30T00:31:00.000Z"),
      }),
    ).toMatchObject({ ok: false, reason: "expired" });
    expect(
      verifyPreviewToken(token, {
        slug: "other",
        contentSha: "sha",
        secret: "preview-secret",
        now: new Date("2026-07-30T00:31:00.000Z"),
      }),
    ).toMatchObject({ ok: false, reason: "slug-mismatch" });
    expect(
      verifyPreviewToken(token, {
        slug: "draft",
        contentSha: "next",
        secret: "preview-secret",
        now: new Date("2026-07-30T00:31:00.000Z"),
      }),
    ).toMatchObject({ ok: false, reason: "stale-content" });
    expect(
      verifyPreviewToken(`${token}x`, {
        slug: "draft",
        contentSha: "sha",
        secret: "preview-secret",
        now: new Date("2026-07-30T00:31:00.000Z"),
      }),
    ).toMatchObject({ ok: false, reason: "invalid" });
  });
});
