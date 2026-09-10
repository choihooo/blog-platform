import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd());
const read = (file: string) => readFileSync(join(root, file), "utf8");

describe("pixel-room blog archive integration", () => {
  it("keeps Blog as a route-intercepted modal over the room", () => {
    expect(read("app/@modal/(.)blog/page.tsx")).toContain("BlogArchiveModal");
    expect(read("features/pixel-room/pixel-room.tsx")).toContain('href="/blog"');
    expect(read("app/layout.tsx")).toContain("{modal}");
  });

  it("supports archive-to-post modal navigation", () => {
    expect(read("app/@modal/(.)blog/[slug]/page.tsx")).toContain("PostPage");
    expect(read("features/blog/components/blog-archive-list.tsx")).toContain("/blog/${post.slug}");
  });

  it("keeps canonical full pages for direct URL and SEO access", () => {
    for (const route of [
      "app/blog/page.tsx",
      "app/blog/page/[page]/page.tsx",
      "app/blog/search/page.tsx",
      "app/categories/[...categoryPath]/page.tsx",
      "app/projects/page.tsx",
      "app/projects/[slug]/page.tsx",
      "app/resume/page.tsx",
      "app/tags/page.tsx",
      "app/tags/[slug]/page.tsx",
      "app/tags/[slug]/page/[page]/page.tsx",
      "app/posts/[slug]/page.tsx",
    ]) {
      expect(read(route)).not.toContain('redirect("/")');
    }
  });

  it("keeps internal links inside the room while viewing an article", () => {
    const postPage = read("app/posts/[slug]/page.tsx");
    expect(postPage).toContain('node.href.startsWith("/")');
    expect(postPage).toContain('href.startsWith("/")');
    expect(read("features/blog/components/recommended-posts.tsx")).toContain("AnalyticsLink");
  });

  it("records the archive window styling and responsive fallback", () => {
    const css = read("app/globals.css");
    expect(css).toContain(".blog-archive-backdrop");
    expect(css).toContain(".blog-archive__sidebar");
    expect(css).toContain("@media (max-width: 639px)");
  });
});
