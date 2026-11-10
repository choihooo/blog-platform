import { describe, expect, it } from "vitest";

import {
  createConfiguredPublicRefresh,
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
      "/blog",
      "/blog/rss.xml",
      "/sitemap.xml",
      "/robots.txt",
      "/blog/old",
      "/og/old",
      "/blog/categories/dev",
      "/blog/tags/ts",
      "/blog/new",
      "/og/new",
      "/blog/tags/next",
    ]);
  });

  it("reports failed refresh targets and creates retry tokens", async () => {
    const result = await refreshPublicTargets(["/", "/blog/rss.xml"], (target) => {
      if (target === "/blog/rss.xml") throw new Error("nope");
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failedTargets).toEqual(["/blog/rss.xml"]);
    expect(
      createPublicRefreshRetryToken({
        operation: "publish",
        targets: ["/"],
        postPath: "db/posts/a",
        postSha: "sha",
        now: new Date("2026-07-30T00:00:00.000Z"),
      }),
    ).toMatchObject({ targets: ["/"], postSha: "sha" });
  });

  it("uses a deploy hook at most once per publication refresh", async () => {
    const calls: string[] = [];
    const refresh = createConfiguredPublicRefresh(
      { BLOG_DEPLOY_HOOK_URL: "https://example.com/deploy" },
      async (url) => {
        calls.push(String(url));
        return { ok: true, status: 200 };
      },
    );

    await refreshPublicTargets(["/", "/blog/rss.xml"], refresh);

    expect(calls).toEqual(["https://example.com/deploy"]);
  });

  it("posts target paths to a configured revalidation endpoint", async () => {
    const bodies: unknown[] = [];
    const refresh = createConfiguredPublicRefresh(
      {
        BLOG_REVALIDATE_URL: "https://blog.example.com/api/revalidate",
        BLOG_REVALIDATE_SECRET: "secret",
      },
      async (_url, init) => {
        bodies.push(JSON.parse(init?.body ?? "{}"));
        return { ok: true, status: 200 };
      },
    );

    await refreshPublicTargets(["/", "/blog/rss.xml"], refresh);

    expect(bodies).toEqual([
      { path: "/", secret: "secret" },
      { path: "/blog/rss.xml", secret: "secret" },
    ]);
  });
});
