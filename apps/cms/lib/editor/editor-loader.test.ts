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

describe("editor-loader", () => {
  it("creates empty draft documents", () => {
    expect(createNewEditorDocument().frontmatter.status).toBe("draft");
  });

  it("lists post summaries", async () => {
    const posts = await listPostSummaries(adapter("---\ntitle: A\nstatus: draft\n---\n\nBody"));
    expect(posts).toEqual([
      { path: "content/posts/a.mdx", slug: "a", title: "A", status: "draft", sha: "sha" },
    ]);
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
