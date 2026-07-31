import { describe, expect, it, vi } from "vitest";

import type { ContentAdapter as D1ContentAdapter } from "./content-adapter.interface";
import { createD1RepositoryContentAdapter } from "./d1-repository-adapter";

const d1Adapter: Pick<D1ContentAdapter, "getPostBySlug" | "listPosts"> = {
  getPostBySlug: vi.fn(),
  listPosts: vi.fn(),
};

vi.mock("./content-adapter", () => ({
  createContentAdapter: () => d1Adapter,
}));

describe("createD1RepositoryContentAdapter", () => {
  it("serializes DB post metadata without dropping frontmatter when optional fields are empty", async () => {
    vi.mocked(d1Adapter.getPostBySlug).mockResolvedValueOnce({
      ok: true,
      data: {
        id: "post_hello_world",
        slug: "hello-world",
        title: "Hello World",
        content: "# Hello World\n\n파일 기반 콘텐츠 모델을 검증하기 위한 첫 번째 샘플 글입니다.",
        summary: "블로그 플랫폼의 첫 샘플 글입니다.",
        categoryId: "cat_engineering",
        categoryPath: "engineering",
        heroImageKey: null,
        publishedAt: "2026-07-30",
        updatedAt: "2026-07-30T17:30:54.488Z",
        isPublished: 0,
        viewCount: 0,
        tags: ["blog", "mdx"],
        mediaRefs: [],
      },
    });

    const adapter = createD1RepositoryContentAdapter();
    const result = await adapter.readFile({ path: "db/posts/hello-world" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.file.content).toContain("title: Hello World");
    expect(result.data.file.content).toContain("author: ho");
    expect(result.data.file.content).toContain("excerpt: 블로그 플랫폼의 첫 샘플 글입니다.");
    expect(result.data.file.content).toContain("slug: hello-world");
    expect(result.data.file.content).toContain("category: engineering");
    expect(result.data.file.content).toContain("  - blog");
    expect(result.data.file.content).not.toBe("---\n---\n\n");
  });

  it("adds the default author when serializing published DB posts for editor saves", async () => {
    vi.mocked(d1Adapter.getPostBySlug).mockResolvedValueOnce({
      ok: true,
      data: {
        id: "post_tistory_39",
        slug: "tistory-39",
        title: "검증 가능한 AI UI 설계하기",
        content: "## AI를 신뢰한다는 말\n\n본문",
        summary: "요약",
        categoryId: "cat_engineering_fe",
        categoryPath: "engineering-fe",
        heroImageKey: "https://example.com/cover.png",
        publishedAt: "2026-07-27T15:55:39+09:00",
        updatedAt: "2026-07-27T15:55:39+09:00",
        isPublished: 1,
        viewCount: 0,
        tags: [],
        mediaRefs: [],
      },
    });

    const adapter = createD1RepositoryContentAdapter();
    const result = await adapter.readFile({ path: "db/posts/tistory-39" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.file.content).toContain("status: published");
    expect(result.data.file.content).toContain("author: ho");
  });
});
