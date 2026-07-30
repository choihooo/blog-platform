import { describe, expect, it } from "vitest";
import { createEmptyEditorDocument, type EditorDocument } from "@blog-platform/editor";

import type { ContentAdapter, ContentChangeRequest } from "../content-adapter";
import { runPublicationOperation } from "./publish-workflow";

function document(overrides: Partial<EditorDocument> = {}) {
  const doc = createEmptyEditorDocument(new Date("2026-07-30T00:00:00.000Z"));
  doc.frontmatter = { title: "Hello World", status: "draft", author: "ho" };
  doc.body = [{ type: "paragraph", text: "Body" }];
  return { ...doc, ...overrides };
}

function adapter(existing: Array<{ path: string; source: string }> = []) {
  const writes: ContentChangeRequest[] = [];
  const api: Pick<ContentAdapter, "createFile" | "updateFile" | "listFiles" | "readFile"> & {
    writes: ContentChangeRequest[];
  } = {
    writes,
    async listFiles() {
      return {
        success: true,
        data: {
          files: existing.map((file) => ({
            path: file.path,
            kind: "post" as const,
            sha: "sha",
            sizeBytes: file.source.length,
          })),
        },
      };
    },
    async readFile(input) {
      const found = existing.find((file) => file.path === input.path);
      if (!found) throw new Error("missing fixture");
      return {
        success: true,
        data: {
          file: {
            path: found.path,
            kind: "post" as const,
            content: found.source,
            encoding: "utf8" as const,
            sha: "sha",
            sizeBytes: found.source.length,
          },
        },
      };
    },
    async createFile(input) {
      writes.push(input);
      return {
        success: true,
        data: {
          path: input.path,
          sha: "new-sha",
          status: "created" as const,
          summary: input.intent,
        },
      };
    },
    async updateFile(input) {
      writes.push(input);
      return {
        success: true,
        data: {
          path: input.path,
          sha: "new-sha",
          status: "updated" as const,
          summary: input.intent,
        },
      };
    },
  };
  return api;
}

describe("publish workflow", () => {
  it("publishes with slug and publishedAt", async () => {
    const api = adapter();
    const result = await runPublicationOperation({
      operation: "publish",
      document: document(),
      adapter: api,
      now: new Date("2026-07-30T01:00:00.000Z"),
    });
    expect(result.ok).toBe(true);
    expect(result.slug).toBe("hello-world");
    expect(result.publishedAt).toBe("2026-07-30T01:00:00.000Z");
    expect(api.writes[0]?.intent).toBe("prepare-publish");
  });

  it("blocks duplicate slugs without writing", async () => {
    const api = adapter([
      {
        path: "content/posts/other.mdx",
        source:
          "---\ntitle: Other\nstatus: published\nslug: hello-world\nauthor: ho\npublishedAt: 2026-07-30\n---\n\nBody\n",
      },
    ]);
    const result = await runPublicationOperation({
      operation: "publish",
      document: document(),
      adapter: api,
    });
    if (result.ok) throw new Error("expected duplicate slug failure");
    expect(result.code).toBe("duplicate-slug");
    expect(api.writes).toHaveLength(0);
  });

  it("unpublishes and archives with matching intents", async () => {
    const published = document({
      sourceSha: "sha",
      frontmatter: {
        title: "Hello World",
        status: "published",
        slug: "hello-world",
        author: "ho",
        publishedAt: "2026-07-30",
      },
    });
    const unpublishAdapter = adapter();
    await runPublicationOperation({
      operation: "unpublish",
      document: published,
      adapter: unpublishAdapter,
    });
    expect(unpublishAdapter.writes[0]?.intent).toBe("prepare-unpublish");

    const archiveAdapter = adapter();
    await runPublicationOperation({
      operation: "archive",
      document: published,
      adapter: archiveAdapter,
    });
    expect(archiveAdapter.writes[0]?.intent).toBe("prepare-archive");
  });
});
