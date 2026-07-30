import { describe, expect, it, vi } from "vitest";

import type { ContentAdapter } from "../content-adapter/index";
import { createProtectedContentOperations } from "./protected-content-operations";
import type { AccessDecision } from "./types";

function adapter(): ContentAdapter {
  const result = async () => ({
    success: true as const,
    data: { path: "content/site.json", sha: "next", status: "updated" as const, summary: "ok" },
  });

  return {
    listFiles: vi.fn(),
    readFile: vi.fn(),
    createFile: vi.fn(result),
    updateFile: vi.fn(result),
    deleteFile: vi.fn(result),
    commitMedia: vi.fn(result),
  };
}

const denied: AccessDecision = {
  status: "unauthenticated",
  reason: "login",
  nextAction: "sign-in",
};

describe("createProtectedContentOperations", () => {
  it("blocks create, update, delete, media, and settings operations when unauthorized", async () => {
    const content = adapter();
    const protectedContent = createProtectedContentOperations(content, () => denied);

    await protectedContent.createFile({
      path: "content/posts/a.mdx",
      content: "",
      intent: "create-draft",
    });
    await protectedContent.updateFile({
      path: "content/posts/a.mdx",
      content: "",
      intent: "save-draft",
      expectedSha: "old",
    });
    await protectedContent.deleteFile({
      path: "content/posts/a.mdx",
      intent: "delete-file",
      expectedSha: "old",
    });
    await protectedContent.commitMedia({
      path: "public/media/a.webp",
      contentBase64: "",
      intent: "save-media",
    });
    await protectedContent.updateSettings({
      path: "content/site.json",
      content: "{}",
      intent: "update-site-config",
      expectedSha: "old",
    });

    expect(content.createFile).not.toHaveBeenCalled();
    expect(content.updateFile).not.toHaveBeenCalled();
    expect(content.deleteFile).not.toHaveBeenCalled();
    expect(content.commitMedia).not.toHaveBeenCalled();
  });
});
