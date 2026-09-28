import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd());
const read = (file: string) => readFileSync(join(root, file), "utf8");

describe("pixel-room blog archive integration", () => {
  it("opens Blog as a full page without a route-intercepted modal", () => {
    expect(() => read("app/@modal/(.)blog/page.tsx")).toThrow();
    expect(read("features/pixel-room/pixel-room.tsx")).toContain('href="/blog"');
    expect(read("features/pixel-room/pixel-room.tsx")).toContain('data-hotspot="blog"');
  });

  it("uses canonical full-page routes for archive-to-post navigation", () => {
    expect(() => read("app/@modal/(.)blog/[slug]/page.tsx")).toThrow();
    expect(read("app/posts/[slug]/page.tsx")).toContain("export default async function PostPage");
    expect(read("features/blog/components/blog-listing-page.tsx")).toContain("/blog");
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
    expect(postPage).toContain("replace={isArchivePresentation}");
    expect(read("features/blog/components/recommended-posts.tsx")).toContain("AnalyticsLink");
    expect(read("features/projects/projects-page.tsx")).toContain("<ProjectGrid replaceLinks />");
  });

  it("uses Work-specific skeletons instead of the blog window fallback", () => {
    expect(read("app/@modal/(.)projects/loading.tsx")).toContain("ProjectFeedLoadingSkeleton");
    expect(read("app/@modal/(.)projects/[slug]/loading.tsx")).toContain(
      "ProjectDetailLoadingSkeleton",
    );
    expect(read("features/projects/project-loading-skeleton.tsx")).toContain(
      "work-feed__loading-grid",
    );
  });

  it("closes the Work feed when its empty backdrop is clicked", () => {
    const modal = read("features/projects/project-feed-modal.tsx");
    expect(modal).toContain("onPointerDown");
    expect(modal).toContain("event.target === event.currentTarget");
    expect(modal).toContain("closeRequested");
  });
});
