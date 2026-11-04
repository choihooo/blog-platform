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

  it("renders article links through the extracted body renderer", () => {
    const postPage = read("app/posts/[slug]/page.tsx");
    const renderer = read("app/posts/[slug]/post-body-renderer.tsx");
    expect(postPage).toContain("<PostBodyRenderer");
    expect(renderer).toContain('node.href.startsWith("/")');
    expect(renderer).toContain('href.startsWith("/")');
    expect(read("features/blog/components/recommended-posts.tsx")).toContain("AnalyticsLink");
  });

  it("uses Work-specific skeletons instead of the blog window fallback", () => {
    expect(read("app/projects/loading.tsx")).toContain("ProjectFeedLoadingSkeleton");
    expect(read("app/projects/[slug]/loading.tsx")).toContain("ProjectDetailLoadingSkeleton");
    expect(read("features/projects/project-loading-skeleton.tsx")).toContain(
      "work-feed__loading-grid",
    );
  });

  it("uses ordinary pages for Work and About without a modal slot", () => {
    for (const route of [
      "app/@modal/(.)projects/page.tsx",
      "app/@modal/(.)projects/[slug]/page.tsx",
      "app/@modal/(.)resume/page.tsx",
      "app/@modal/default.tsx",
    ])
      expect(() => read(route)).toThrow();
    expect(read("app/layout.tsx")).not.toContain("{modal}");
    const projects = read("features/projects/desktop/desktop-portfolio.tsx");
    expect(projects).not.toContain("replaceLinks");
    expect(read("app/projects/page.tsx")).toContain("<DesktopPortfolio />");
    expect(projects).toContain("projectIdFromHash");
    expect(read("features/projects/project-detail-page.tsx")).toContain(
      "href={`/projects#${project.slug}`}",
    );
  });
});
