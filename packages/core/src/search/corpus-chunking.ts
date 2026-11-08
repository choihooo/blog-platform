import type { RagChunk, RagDocument } from "./corpus-types.js";

export const EMBEDDING_MODEL = "@cf/baai/bge-m3" as const;

/** Repeat classification for every chunk, including the end of long articles. */
export function embeddingText(document: RagDocument): string {
  return [
    document.title,
    document.categories?.length ? `카테고리: ${document.categories.join(", ")}` : "",
    document.tags?.length ? `태그: ${document.tags.join(", ")}` : "",
    document.text,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function chunkDocuments(documents: RagDocument[]): Promise<RagChunk[]> {
  const chunks: RagChunk[] = [];
  for (const document of documents) {
    const text = document.text.replace(/\r\n/g, "\n").trim();
    if (text.length > 100_000) throw new Error("document_too_large");
    for (let offset = 0; offset < text.length;) {
      let end = Math.min(offset + 500, text.length);
      if (end < text.length) {
        const boundary = text.lastIndexOf("\n", end);
        if (boundary > offset + 250) end = boundary;
      }
      const part = text.slice(offset, end).trim();
      const hash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(
          JSON.stringify([
            EMBEDDING_MODEL,
            "v1",
            document.key,
            document.title,
            document.url,
            part,
            ...(document.tags || document.categories
              ? ["taxonomy-v1", document.categories ?? [], document.tags ?? []]
              : []),
          ]),
        ),
      );
      const id = Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
      chunks.push({ ...document, text: part, id });
      if (end === text.length) break;
      offset = end - 50;
    }
  }
  return [...new Map(chunks.map((c) => [c.id, c])).values()];
}
