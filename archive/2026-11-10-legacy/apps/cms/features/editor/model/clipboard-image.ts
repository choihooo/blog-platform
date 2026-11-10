"use client";

const MIME_EXTENSIONS = new Map([
  ["image/webp", "webp"],
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
]);
const CANVAS_MEDIA_TYPE = "image/webp";

function extensionFromImageType(type: string) {
  return MIME_EXTENSIONS.get(type.toLowerCase()) ?? "png";
}

function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "clipboard-image";
}

export function normalizedImageFile(data: DataTransfer | null): File | undefined {
  const file =
    Array.from(data?.files ?? []).find((entry) => entry.type.startsWith("image/")) ??
    Array.from(data?.items ?? [])
      .find((entry) => entry.kind === "file" && entry.type.startsWith("image/"))
      ?.getAsFile() ??
    undefined;

  if (!file) return;
  if (/\.(webp|png|jpe?g)$/i.test(file.name)) return file;

  const extension = extensionFromImageType(file.type);
  return new File([file], `clipboard-image.${extension}`, {
    type: file.type || "image/png",
    lastModified: file.lastModified,
  });
}

export function hasAttachmentImage(data: DataTransfer | null): boolean {
  if (!data) return false;
  const text = ["text/html", "text/uri-list", "text/plain"]
    .map((type) => {
      try {
        return data.getData(type);
      } catch {
        return "";
      }
    })
    .join("\n");
  return /attachment:[^\s"'<>)]*image/i.test(text);
}

export async function prepareClientImageFile(
  file: File,
): Promise<{ ok: true; file: File } | { ok: false; message: string }> {
  if (typeof document === "undefined" || typeof createImageBitmap !== "function") {
    return { ok: true, file };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { ok: false, message: "File could not be decoded as an image" };
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) return { ok: false, message: "File could not be decoded as an image" };
    context.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, CANVAS_MEDIA_TYPE, 0.86),
    );
    if (!blob || blob.size === 0) {
      return { ok: false, message: "File could not be decoded as an image" };
    }
    return {
      ok: true,
      file: new File([blob], `${baseName(file.name)}.webp`, {
        type: blob.type || CANVAS_MEDIA_TYPE,
        lastModified: file.lastModified,
      }),
    };
  } finally {
    bitmap.close();
  }
}
