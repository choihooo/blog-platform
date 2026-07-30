import { describe, expect, it, vi } from "vitest";

vi.mock("../../../lib/preview", () => ({
  previewCacheControl: () => "private, no-store",
  loadDraftPreview: ({ token }: { token: string }) =>
    Promise.resolve(
      token === "valid"
        ? { ok: true, post: { title: "Draft", body: "secret draft body" } }
        : { ok: false, reason: "invalid-token" },
    ),
}));

describe("preview route", () => {
  it("serves valid preview with private no-store cache policy", async () => {
    const { GET } = await import("./route");
    const response = await GET(new Request("https://example.com/preview/draft?token=valid"), {
      params: Promise.resolve({ slug: "draft" }),
    });

    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.text()).toContain("secret draft body");
  });

  it("does not expose draft body on invalid access", async () => {
    const { GET } = await import("./route");
    const response = await GET(new Request("https://example.com/preview/draft?token=bad"), {
      params: Promise.resolve({ slug: "draft" }),
    });

    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain("secret draft body");
  });
});
