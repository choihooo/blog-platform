import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const roots: string[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});
async function store() {
  expect(existsSync(new URL("./media-store.ts", import.meta.url))).toBe(true);
  const root = await mkdtemp(path.join(tmpdir(), "core-media-"));
  roots.push(root);
  const { createMediaStore } = await import("./media-store.js");
  return { root, media: createMediaStore(root) };
}
const image = {
  path: "public/media/covers/hello.webp",
  contentBase64: Buffer.from("image").toString("base64"),
};

describe("media storage", () => {
  it("preserves local bytes, public paths, duplicate writes and optimistic conflicts", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { root, media } = await store();
    const saved = await media.put(image);
    expect(saved).toMatchObject({
      ok: true,
      data: {
        path: image.path,
        publicPath: "/media/covers/hello.webp",
        sha: createHash("sha256").update("image").digest("hex"),
        sizeBytes: 5,
      },
    });
    expect(await readFile(path.join(root, image.path), "utf8")).toBe("image");
    expect((await media.put(image)).ok).toBe(true);
    expect(
      await media.put({
        ...image,
        expectedSha: "stale",
        contentBase64: Buffer.from("changed").toString("base64"),
      }),
    ).toMatchObject({ ok: false, error: { code: "conflict", retryable: false } });
    expect(await readFile(path.join(root, image.path), "utf8")).toBe("image");
    for (const invalid of [
      "public/media/../../outside.webp",
      "/tmp/out.webp",
      "content/site.json",
      "public/media\\..\\outside.webp",
    ]) {
      expect(await media.put({ ...image, path: invalid })).toMatchObject({
        ok: false,
        error: { code: "validation-failure" },
      });
    }
  });

  it("preserves R2 key encoding, signing, bytes and public URL without querying D1", async () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const [key, value] of Object.entries({
      R2_ACCOUNT_ID: "account",
      R2_ACCESS_KEY_ID: "fixture-key",
      R2_SECRET_ACCESS_KEY: "fixture-secret",
      R2_BUCKET: "bucket",
      R2_PUBLIC_URL: "https://assets.example.com/",
    }))
      vi.stubEnv(key, value);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-08T00:00:00Z"));
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      requests.push({ url, init });
      return new Response(null, { status: 200 });
    });
    const { media } = await store();
    expect(await media.put(image)).toMatchObject({
      ok: true,
      data: { publicPath: "https://assets.example.com/media/covers/hello.webp" },
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]!.url).toBe(
      "https://account.r2.cloudflarestorage.com/bucket/media/covers/hello.webp",
    );
    const init = requests[0]!.init!;
    expect(init.method).toBe("PUT");
    expect(Buffer.from(init.body as Uint8Array).toString()).toBe("image");
    expect(new Headers(init.headers).get("x-amz-date")).toBe("20261108T000000Z");
    expect(new Headers(init.headers).get("authorization")).toMatch(
      /^AWS4-HMAC-SHA256 Credential=fixture-key\/20261108\/auto\/s3\/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=[a-f0-9]{64}$/,
    );
  });

  it("fails closed without production R2 configuration", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { root, media } = await store();
    expect(await media.put(image)).toMatchObject({
      ok: false,
      error: {
        code: "upstream-failure",
        retryable: false,
        message: "D1/R2 editor media uploads must use the R2 upload pipeline",
      },
    });
    expect(existsSync(path.join(root, image.path))).toBe(false);
  });

  it("redacts R2 credentials from upstream errors", async () => {
    for (const [key, value] of Object.entries({
      R2_ACCOUNT_ID: "account",
      R2_ACCESS_KEY_ID: "fixture-key",
      R2_SECRET_ACCESS_KEY: "fixture-secret",
      R2_BUCKET: "bucket",
      R2_PUBLIC_URL: "https://assets.example.com",
    }))
      vi.stubEnv(key, value);
    vi.stubGlobal("fetch", async () => new Response("fixture-secret fixture-key", { status: 503 }));
    const { media } = await store();
    const result = await media.put(image);
    expect(result).toMatchObject({
      ok: false,
      error: { code: "retryable-failure", retryable: true },
    });
    expect(JSON.stringify(result)).not.toContain("fixture-secret");
    expect(JSON.stringify(result)).not.toContain("fixture-key");
  });
});
