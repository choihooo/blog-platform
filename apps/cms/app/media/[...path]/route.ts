import { readFile } from "node:fs/promises";
import path from "node:path";

import { repositoryRoot } from "../../../shared/server/repository-root";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const MEDIA_TYPES = new Map([
  [".webp", "image/webp"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
]);

function safeMediaPath(parts: string[], root: string) {
  if (
    parts.length === 0 ||
    parts.some((part) => !part || part === "." || part === ".." || part.includes("/"))
  ) {
    return;
  }
  const relativePath = path.join("public", "media", ...parts);
  const absolutePath = path.resolve(root, relativePath);
  const mediaRoot = path.resolve(root, "public", "media");
  if (!absolutePath.startsWith(`${mediaRoot}${path.sep}`)) return;
  return absolutePath;
}

export async function mediaFileResponse(parts: string[], root = repositoryRoot()) {
  const filePath = safeMediaPath(parts, root);
  const contentType = filePath ? MEDIA_TYPES.get(path.extname(filePath).toLowerCase()) : undefined;
  if (!filePath || !contentType) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    return new Response(file, {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
        "content-type": contentType,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const { path: mediaPath } = await context.params;
  return mediaFileResponse(mediaPath);
}
