import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd());
const read = (file: string) => readFileSync(join(root, file), "utf8");

describe("pixel-room blog archive integration", () => {
  it("keeps Blog as a route-intercepted modal over the room", () => {
    expect(read("app/@modal/(.)blog/page.tsx")).toContain("BlogArchiveModal");
    expect(read("app/@modal/loading.tsx")).toContain("불러오는 중");
    expect(read("features/pixel-room/pixel-room.tsx")).toContain('href="/blog"');
    expect(read("features/pixel-room/pixel-room.tsx")).toContain('data-hotspot="blog"');
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
    expect(postPage).toContain("replace={isArchivePresentation}");
    expect(read("features/blog/components/recommended-posts.tsx")).toContain("AnalyticsLink");
    expect(read("features/projects/projects-page.tsx")).toContain("<ProjectGrid replaceLinks />");
  });

  it("uses one history entry for each modal flow", () => {
    const archiveModal = read("features/blog/components/blog-archive-modal.tsx");
    expect(archiveModal).toContain("router.back()");
    expect(archiveModal).toContain("closeRequested");
    expect(archiveModal).not.toContain("window.setTimeout");
    expect(read("features/blog/components/blog-archive-list.tsx")).toContain("replace");
    expect(read("features/blog/components/post-list-view.tsx")).toContain("replaceLinks");
    expect(read("features/blog/components/blog-archive-modal.tsx")).not.toContain(
      'router.replace("/")',
    );
  });

  it("records the archive window styling and responsive fallback", () => {
    const css = read("app/globals.css");
    expect(css).toContain(".blog-archive-backdrop");
    expect(css).toContain(".blog-archive__sidebar");
    expect(css).toContain("@media (max-width: 639px)");
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
});
