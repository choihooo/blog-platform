import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { PREVIEW_TOKEN_TTL_SECONDS, verifyPreviewToken } from "./preview-token";

function issue(payload: object, secret: string) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

describe("blog preview token verification", () => {
  it("accepts a valid signed token", () => {
    const now = new Date("2026-07-30T00:00:00.000Z");
    const token = issue(
      {
        slug: "draft",
        contentSha: "sha",
        exp: Math.floor(now.getTime() / 1000) + PREVIEW_TOKEN_TTL_SECONDS,
        nonce: "nonce",
      },
      "preview-secret",
    );

    expect(
      verifyPreviewToken(token, {
        slug: "draft",
        contentSha: "sha",
        secret: "preview-secret",
        now,
      }),
    ).toMatchObject({ ok: true });
  });

  it("rejects expired, mismatched, stale, and invalid tokens", () => {
    const token = issue(
      {
        slug: "draft",
        contentSha: "sha",
        exp: 2_000_000_000,
        nonce: "nonce",
      },
      "preview-secret",
    );
    const expired = issue(
      {
        slug: "draft",
        contentSha: "sha",
        exp: Math.floor(new Date("2026-07-30T00:00:00.000Z").getTime() / 1000),
        nonce: "nonce",
      },
      "preview-secret",
    );

    expect(
      verifyPreviewToken(expired, {
        slug: "draft",
        contentSha: "sha",
        secret: "preview-secret",
        now: new Date("2026-07-30T00:00:01.000Z"),
      }),
    ).toMatchObject({ ok: false, reason: "expired" });
    expect(
      verifyPreviewToken(token, { slug: "other", contentSha: "sha", secret: "preview-secret" }),
    ).toMatchObject({ ok: false, reason: "slug-mismatch" });
    expect(
      verifyPreviewToken(token, { slug: "draft", contentSha: "next", secret: "preview-secret" }),
    ).toMatchObject({ ok: false, reason: "stale-content" });
    expect(
      verifyPreviewToken(`${token}x`, {
        slug: "draft",
        contentSha: "sha",
        secret: "preview-secret",
      }),
    ).toMatchObject({ ok: false, reason: "invalid" });
  });
});
