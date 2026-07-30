import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createLocalContentAdapter } from "./local-adapter.js";

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "cms-adapter-"));
  await mkdir(path.join(root, "content/posts"), { recursive: true });
  await mkdir(path.join(root, "content/authors"), { recursive: true });
  await writeFile(
    path.join(root, "content/posts/hello-world.mdx"),
    "---\ntitle: Hello\n---\n# Hello",
  );
  await writeFile(path.join(root, "content/authors/ho.md"), "---\nid: ho\n---");
  await writeFile(path.join(root, "content/site.json"), "{}");
  await writeFile(path.join(root, "content/categories.json"), "[]");
  await writeFile(path.join(root, "content/tags.json"), "[]");
  return root;
}

describe("local adapter read", () => {
  it("lists and reads content files", async () => {
    const adapter = createLocalContentAdapter(await fixture());
    const posts = await adapter.listFiles({ root: "posts" });
    expect(posts.success && posts.data.files[0]?.path).toBe("content/posts/hello-world.mdx");

    const file = await adapter.readFile({ path: "content/posts/hello-world.mdx" });
    expect(file.success && file.data.file.kind).toBe("post");
    expect(file.success && file.data.file.sha.length).toBeGreaterThan(10);

    const config = await adapter.listFiles({ root: "config" });
    expect(config.success && config.data.files.map((item) => item.kind).sort()).toEqual([
      "category-config",
      "site-config",
      "tag-config",
    ]);
  });
});
