import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("CMS media route", () => {
  it("serves repository media files for editor previews", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "cms-media-route-"));
    const filePath = path.join(root, "public/media/covers/route-test.webp");
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, Buffer.from("RIFFtestWEBP"));

    const { mediaFileResponse } = await import("./route");
    const response = await mediaFileResponse(["covers", "route-test.webp"], root);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    await expect(response.arrayBuffer()).resolves.toHaveProperty("byteLength", 12);
  });

  it("rejects traversal and unsupported extensions", async () => {
    const { GET } = await import("./route");
    const traversal = await GET(new Request("http://localhost:3001/media/secret"), {
      params: Promise.resolve({ path: ["..", "secret.webp"] }),
    });
    const unsupported = await GET(new Request("http://localhost:3001/media/file.svg"), {
      params: Promise.resolve({ path: ["file.svg"] }),
    });

    expect(traversal.status).toBe(404);
    expect(unsupported.status).toBe(404);
  });
});
