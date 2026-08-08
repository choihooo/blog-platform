import { mediaHash } from "./media-path";

export const MAX_MEDIA_BYTES = 2 * 1024 * 1024;
export const MEDIA_REPLACEMENT_POLICY = {
  preservePreviousMedia: true,
  cleanupAfterDualStorageDays: 7,
  note: "Cover/body replacement writes the new media path first and keeps previous media available through the rollback window.",
} as const;
const ALLOWED_EXTENSIONS = new Set(["webp", "png", "jpg", "jpeg"]);
const ALLOWED_MEDIA_TYPES = new Set(["image/webp", "image/png", "image/jpeg"]);

function extensionFromMediaType(type: string): string | undefined {
  if (type === "image/webp") return "webp";
  if (type === "image/png") return "png";
  if (type === "image/jpeg") return "jpg";
  return undefined;
}

function mediaTypeFromExtension(extension: string): string | undefined {
  if (extension === "webp") return "image/webp";
  if (extension === "png") return "image/png";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  return undefined;
}

function mediaBuffersFromUpload(buffer: Buffer): Buffer[] {
  const text = buffer.toString("utf8").trim();
  const buffers = [buffer];
  const dataUrl = /^data:image\/(?:webp|png|jpe?g);base64,([a-z0-9+/=\s]+)$/i.exec(text);
  if (dataUrl?.[1]) {
    buffers.push(Buffer.from(dataUrl[1].replace(/\s/g, ""), "base64"));
    return buffers;
  }
  if (/^[a-z0-9+/=\s]+$/i.test(text) && text.length > 32) {
    buffers.push(Buffer.from(text.replace(/\s/g, ""), "base64"));
  }
  return buffers;
}

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
  const mediaType = file.type.toLowerCase();
  const acceptedExtension =
    extension && ALLOWED_EXTENSIONS.has(extension) ? extension : extensionFromMediaType(mediaType);
  const acceptedMediaType =
    mediaType || (acceptedExtension && mediaTypeFromExtension(acceptedExtension));
  if (!acceptedExtension || !acceptedMediaType || !ALLOWED_MEDIA_TYPES.has(acceptedMediaType)) {
    return { ok: false, message: "Only webp, png, jpg, and jpeg images are allowed" };
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return { ok: false, message: "Image must be 2MB or smaller" };
  }

  const original = Buffer.from(await file.arrayBuffer());
  const { default: sharp } = await import("sharp");
  for (const uploadBuffer of mediaBuffersFromUpload(original)) {
    try {
      const buffer = await sharp(uploadBuffer).rotate().webp({ quality: 82 }).toBuffer();
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
      continue;
    }
  }
  return { ok: false, message: "File could not be decoded as an image" };
}
