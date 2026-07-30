import { describe, expect, it } from "vitest";

import {
  createPublicRefreshRetryToken,
  publicRefreshTargets,
  refreshPublicTargets,
} from "./public-refresh";

describe("public refresh", () => {
  it("expands previous and next metadata into unique targets", () => {
    expect(
      publicRefreshTargets({
        operation: "publish",
        previous: { slug: "old", category: "dev", tags: ["ts"] },
        next: { slug: "new", category: "dev", tags: ["ts", "next"] },
      }),
    ).toEqual([
      "/",
      "/rss.xml",
      "/sitemap.xml",
      "/robots.txt",
      "/posts/old",
      "/og/old",
      "/categories/dev",
      "/tags/ts",
      "/posts/new",
      "/og/new",
      "/tags/next",
    ]);
  });

  it("reports failed refresh targets and creates retry tokens", async () => {
    const result = await refreshPublicTargets(["/", "/rss.xml"], (target) => {
      if (target === "/rss.xml") throw new Error("nope");
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failedTargets).toEqual(["/rss.xml"]);
    expect(
      createPublicRefreshRetryToken({
        operation: "publish",
        targets: ["/"],
        postPath: "content/posts/a.mdx",
        postSha: "sha",
        now: new Date("2026-07-30T00:00:00.000Z"),
      }),
    ).toMatchObject({ targets: ["/"], postSha: "sha" });
  });
});
