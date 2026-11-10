import { createHash } from "node:crypto";

export type MediaTarget = "body" | "cover";

export function mediaHash(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 12);
}

export function slugForMedia(input: string): string | null {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || null;
}

export function mediaPath(input: {
  target: MediaTarget;
  slug: string;
  hash: string;
  extension?: "webp" | "png" | "jpg" | "jpeg";
}): string {
  const extension = input.extension ?? "webp";
  return input.target === "cover"
    ? `public/media/covers/${input.slug}-${input.hash}.${extension}`
    : `public/media/posts/${input.slug}/${input.hash}.${extension}`;
}

export function publicPath(repoPath: string): string {
  return repoPath.startsWith("public/") ? `/${repoPath.slice("public/".length)}` : repoPath;
}
