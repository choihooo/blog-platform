"use client";

const MIME_EXTENSIONS = new Map([
  ["image/webp", "webp"],
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
]);

function extensionFromImageType(type: string) {
  return MIME_EXTENSIONS.get(type.toLowerCase()) ?? "png";
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
