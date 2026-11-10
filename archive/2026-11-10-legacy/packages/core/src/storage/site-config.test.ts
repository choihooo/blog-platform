import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("site config loading across app bundles", () => {
  it("loads explicit files and uses defaults rather than bundled data for a missing explicit root", async () => {
    expect(existsSync(new URL("./site-config.ts", import.meta.url))).toBe(true);
    const { loadSiteConfig, defaultSiteConfig } = await import("./site-config.js");
    const root = await mkdtemp(path.join(tmpdir(), "core-site-"));
    try {
      expect(
        await loadSiteConfig({ root, bundled: { siteUrl: "https://bundled.example" } }),
      ).toEqual(defaultSiteConfig());
      await mkdir(path.join(root, "content"));
      await writeFile(
        path.join(root, "content/site.json"),
        JSON.stringify({ siteName: "File site", siteUrl: "https://file.example" }),
      );
      expect(await loadSiteConfig({ root, bundled: {} })).toMatchObject({
        siteName: "File site",
        siteUrl: "https://file.example",
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
