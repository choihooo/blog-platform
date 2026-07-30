import { describe, expect, it } from "vitest";
import sharp from "sharp";

import { MAX_MEDIA_BYTES, prepareMediaFile } from "./media-file";

describe("prepareMediaFile", () => {
  it("normalizes a small image to webp", async () => {
    const png = await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 3,
        background: "#ffffff",
      },
    })
      .png()
      .toBuffer();
    const file = new File([png], "pixel.png", { type: "image/png" });
    const result = await prepareMediaFile(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.extension).toBe("webp");
      expect(result.hash).toHaveLength(12);
      expect(result.sizeBytes).toBeGreaterThan(0);
    }
  });

  it("rejects invalid type and large files", async () => {
    await expect(prepareMediaFile(new File(["x"], "x.txt"))).resolves.toMatchObject({ ok: false });
    await expect(
      prepareMediaFile(new File([new Uint8Array(MAX_MEDIA_BYTES + 1)], "x.png")),
    ).resolves.toMatchObject({ ok: false });
  });
});
