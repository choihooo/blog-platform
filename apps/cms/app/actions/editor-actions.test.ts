import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("../../lib/auth/session", () => ({
  getCmsSession: async () => ({
    githubLogin: "fixture-admin",
    githubUserId: "123",
    expiresAt: "2099-01-01T00:00:00Z",
  }),
}));
vi.mock("../../lib/auth/admin-identity", async (original) => ({
  ...(await original<object>()),
  loadAdminIdentity: async () => ({
    success: true,
    identity: {
      githubLogin: "fixture-admin",
      githubUserId: "123",
      sourcePath: "content/site.json",
    },
  }),
}));
vi.mock("@blog-platform/core/storage", async (original) => ({
  ...(await original<object>()),
  createContentAdapter: () => ({
    getPostBySlug: async () => ({ ok: true, data: null }),
    createPost: async ({ post }: { post: unknown }) => ({ ok: true, data: post }),
  }),
}));
afterEach(() => vi.unstubAllEnvs());

import {
  archivePostAction,
  createPreviewTokenAction,
  publishPostAction,
  retryPublicRefreshAction,
  saveEditorDraftAction,
  unpublishPostAction,
  uploadEditorMediaAction,
} from "./editor-actions";
import { createEmptyEditorDocument } from "@blog-platform/core/content";

describe("editor actions", () => {
  it("exports the save action", () => {
    expect(typeof saveEditorDraftAction).toBe("function");
    expect(typeof uploadEditorMediaAction).toBe("function");
    expect(typeof publishPostAction).toBe("function");
    expect(typeof unpublishPostAction).toBe("function");
    expect(typeof archivePostAction).toBe("function");
    expect(typeof retryPublicRefreshAction).toBe("function");
    expect(typeof createPreviewTokenAction).toBe("function");
  });

  it("issues preview URLs without exposing the preview secret", async () => {
    vi.stubEnv("PREVIEW_TOKEN_SECRET", "preview-secret");
    const document = {
      ...createEmptyEditorDocument(new Date("2026-07-30T00:00:00.000Z")),
      id: "draft",
      frontmatter: {
        ...createEmptyEditorDocument().frontmatter,
        title: "Draft",
        slug: "draft",
        status: "draft" as const,
      },
      body: [{ type: "paragraph" as const, text: "Draft body" }],
    };

    const result = await createPreviewTokenAction({ document });

    expect(result.ok).toBe(true);
    expect(JSON.stringify(result)).not.toContain("preview-secret");
  });
});
