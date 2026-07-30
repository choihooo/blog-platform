import { mediaHash } from "./media-path";

export const MAX_MEDIA_BYTES = 2 * 1024 * 1024;
export const MEDIA_REPLACEMENT_POLICY = {
  preservePreviousMedia: true,
  cleanupAfterDualStorageDays: 7,
  note: "Cover/body replacement writes the new media path first and keeps previous media available through the rollback window.",
} as const;
const ALLOWED_EXTENSIONS = new Set(["webp", "png", "jpg", "jpeg"]);

export type PreparedMediaFile =
  | {
      ok: true;
      buffer: Buffer;
      base64: string;
      hash: string;
      sizeBytes: number;
      extension: "webp";
    }
  | { ok: false; message: string };

export async function prepareMediaFile(file: File): Promise<PreparedMediaFile> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
    return { ok: false, message: "Only webp, png, jpg, and jpeg images are allowed" };
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return { ok: false, message: "Image must be 2MB or smaller" };
  }

  const original = Buffer.from(await file.arrayBuffer());
  try {
    const { default: sharp } = await import("sharp");
    const buffer = await sharp(original).rotate().webp({ quality: 82 }).toBuffer();
    if (buffer.byteLength > MAX_MEDIA_BYTES) {
      return { ok: false, message: "Optimized image must be 2MB or smaller" };
    }
    return {
      ok: true,
      buffer,
      base64: buffer.toString("base64"),
      hash: mediaHash(buffer),
      sizeBytes: buffer.byteLength,
      extension: "webp",
    };
  } catch {
    return { ok: false, message: "File could not be decoded as an image" };
  }
}
