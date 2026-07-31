import { describe, expect, it, vi } from "vitest";

import type { ContentAdapter } from "../content-adapter/index";
import { createNewEditorDocument, listPostSummaries, loadEditorDocument } from "./editor-loader";

function adapter(source: string): ContentAdapter {
  return {
    listFiles: vi.fn(async () => ({
      success: true as const,
      data: {
        files: [
          {
            path: "content/posts/a.mdx",
            kind: "post" as const,
            sha: "sha",
            sizeBytes: source.length,
          },
        ],
      },
    })),
    readFile: vi.fn(async () => ({
      success: true as const,
      data: {
        file: {
          path: "content/posts/a.mdx",
          kind: "post" as const,
          content: source,
          encoding: "utf8" as const,
          sha: "sha",
          sizeBytes: source.length,
        },
      },
    })),
    createFile: vi.fn(),
    updateFile: vi.fn(),
    deleteFile: vi.fn(),
    commitMedia: vi.fn(),
  };
}

function multiPostAdapter(sources: Record<string, string>): ContentAdapter {
  return {
    listFiles: vi.fn(async () => ({
      success: true as const,
      data: {
        files: Object.entries(sources).map(([slug, source]) => ({
          path: `content/posts/${slug}.mdx`,
          kind: "post" as const,
          sha: `sha-${slug}`,
          sizeBytes: source.length,
        })),
      },
    })),
    readFile: vi.fn(async ({ path }) => {
      const slug = path.replace(/^content\/posts\//, "").replace(/\.mdx$/, "");
      const source = sources[slug] ?? "";
      return {
        success: true as const,
        data: {
          file: {
            path,
            kind: "post" as const,
            content: source,
            encoding: "utf8" as const,
            sha: `sha-${slug}`,
            sizeBytes: source.length,
          },
        },
      };
    }),
    createFile: vi.fn(),
    updateFile: vi.fn(),
    deleteFile: vi.fn(),
    commitMedia: vi.fn(),
  };
}

describe("editor-loader", () => {
  it("creates empty draft documents", () => {
    expect(createNewEditorDocument().frontmatter.status).toBe("draft");
  });

  it("lists post summaries", async () => {
    const posts = await listPostSummaries(adapter("---\ntitle: A\nstatus: draft\n---\n\nBody"));
    expect(posts).toEqual([
      {
        path: "content/posts/a.mdx",
        slug: "a",
        title: "A",
        status: "draft",
        sha: "sha",
        publishedAt: null,
        updatedAt: null,
      },
    ]);
  });

  it("sorts summaries by published or updated date", async () => {
    const contentAdapter = multiPostAdapter({
      old: "---\ntitle: Old\nstatus: published\npublishedAt: 2026-01-01T00:00:00.000Z\nupdatedAt: 2026-12-01T00:00:00.000Z\n---\n\nBody",
      new: "---\ntitle: New\nstatus: published\npublishedAt: 2026-06-01T00:00:00.000Z\nupdatedAt: 2026-06-01T00:00:00.000Z\n---\n\nBody",
    });

    await expect(listPostSummaries(contentAdapter, { sort: "published" })).resolves.toMatchObject([
      { slug: "new" },
      { slug: "old" },
    ]);
    await expect(listPostSummaries(contentAdapter, { sort: "updated" })).resolves.toMatchObject([
      { slug: "old" },
      { slug: "new" },
    ]);
  });

  it("filters post summaries by title, status, path, slug, or source body", async () => {
    await expect(
      listPostSummaries(adapter("---\ntitle: Alpha\nstatus: published\n---\n\n검증 가능한 본문"), {
        query: "검증 가능",
      }),
    ).resolves.toHaveLength(1);
    await expect(
      listPostSummaries(adapter("---\ntitle: Alpha\nstatus: published\n---\n\nBody"), {
        query: "published",
      }),
    ).resolves.toHaveLength(1);
    await expect(
      listPostSummaries(adapter("---\ntitle: Alpha\nstatus: published\n---\n\nBody"), {
        query: "missing",
      }),
    ).resolves.toEqual([]);
  });

  it("loads supported documents and blocks unsupported MDX", async () => {
    await expect(
      loadEditorDocument(
        "content/posts/a.mdx",
        adapter("---\ntitle: A\nstatus: draft\n---\n\nBody"),
      ),
    ).resolves.toMatchObject({ ok: true });
    await expect(
      loadEditorDocument(
        "content/posts/a.mdx",
        adapter("---\ntitle: A\n---\n\nimport X from './x'"),
      ),
    ).resolves.toMatchObject({
      ok: false,
      code: "unsupported-mdx",
    });
  });
});
