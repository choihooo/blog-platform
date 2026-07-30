import { createHash, createHmac } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { loadDraftPreview } from "./preview";

const roots: string[] = [];

async function fixture(source: string) {
  const root = await mkdtemp(path.join(tmpdir(), "blog-preview-"));
  roots.push(root);
  await mkdir(path.join(root, "posts"), { recursive: true });
  await writeFile(path.join(root, "posts", "draft.mdx"), source);
  return root;
}

function issue(input: { slug?: string; contentSha: string; exp?: number; secret?: string }) {
  const payload = {
    slug: input.slug ?? "draft",
    contentSha: input.contentSha,
    exp: input.exp ?? 2_000_000_000,
    nonce: "nonce",
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", input.secret ?? "preview-secret")
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

afterEach(async () => {
  await Promise.all(roots.map((root) => rm(root, { recursive: true, force: true })));
  roots.length = 0;
});

describe("draft preview loader", () => {
  it("loads a valid draft preview", async () => {
    const source = "---\ntitle: Draft\nslug: draft\nstatus: draft\n---\n\n# Draft";
    const root = await fixture(source);
    const contentSha = createHash("sha256").update(source).digest("hex");
    const result = await loadDraftPreview({
      slug: "draft",
      token: issue({ contentSha }),
      secret: "preview-secret",
      contentRoot: root,
    });

    expect(result).toMatchObject({ ok: true, post: { title: "Draft", body: "# Draft" } });
  });

  it("rejects expired, slug mismatch, stale contentSha, and invalid signature states", async () => {
    const source = "---\ntitle: Draft\nslug: draft\nstatus: draft\n---\n\n# Draft";
    const root = await fixture(source);
    const contentSha = createHash("sha256").update(source).digest("hex");

    await expect(
      loadDraftPreview({
        slug: "draft",
        token: issue({ contentSha, exp: 1 }),
        secret: "preview-secret",
        contentRoot: root,
        now: new Date("2026-07-30T00:00:00.000Z"),
      }),
    ).resolves.toMatchObject({ ok: false, reason: "invalid-token" });
    await expect(
      loadDraftPreview({
        slug: "draft",
        token: issue({ slug: "other", contentSha }),
        secret: "preview-secret",
        contentRoot: root,
      }),
    ).resolves.toMatchObject({ ok: false, reason: "invalid-token" });
    await expect(
      loadDraftPreview({
        slug: "draft",
        token: issue({ contentSha: "stale" }),
        secret: "preview-secret",
        contentRoot: root,
      }),
    ).resolves.toMatchObject({ ok: false, reason: "invalid-token" });
    await expect(
      loadDraftPreview({
        slug: "draft",
        token: `${issue({ contentSha })}x`,
        secret: "preview-secret",
        contentRoot: root,
      }),
    ).resolves.toMatchObject({ ok: false, reason: "invalid-token" });
  });

  it("blocks unsafe MDX", async () => {
    const source = "---\ntitle: Draft\nslug: draft\nstatus: draft\n---\n\n<script>x</script>";
    const root = await fixture(source);
    const contentSha = createHash("sha256").update(source).digest("hex");

    await expect(
      loadDraftPreview({
        slug: "draft",
        token: issue({ contentSha }),
        secret: "preview-secret",
        contentRoot: root,
      }),
    ).resolves.toMatchObject({ ok: false, reason: "unsafe-mdx" });
  });
});
