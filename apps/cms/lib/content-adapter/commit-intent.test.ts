import { describe, expect, it } from "vitest";
import { commitSummary } from "./commit-intent.js";

describe("commitSummary", () => {
  it("formats all content intents", () => {
    const file = "content/posts/hello-world.mdx";
    expect(commitSummary("create-draft", file)).toBe("post(hello-world): create draft");
    expect(commitSummary("save-draft", file)).toBe("post(hello-world): save draft");
    expect(commitSummary("prepare-publish", file)).toBe("post(hello-world): publish");
    expect(commitSummary("prepare-unpublish", file)).toBe("post(hello-world): unpublish");
    expect(commitSummary("prepare-archive", file)).toBe("post(hello-world): archive");
    expect(commitSummary("update-site-config", "content/site.json")).toBe(
      "settings: update site config",
    );
    expect(commitSummary("delete-file", file)).toBe("file(hello-world): delete");
  });

  it("formats media uploads", () => {
    expect(commitSummary("save-media", "public/media/posts/hello/file.webp")).toBe(
      "media(hello): upload file.webp",
    );
  });
});
