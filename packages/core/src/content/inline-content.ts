import type { EditorInline } from "./document.js";

/** Text node boundaries differ between HTML and ProseMirror; formatting ranges do not. */
export function normalizeInline(content: EditorInline[]): EditorInline[] {
  const result: EditorInline[] = [];
  for (const run of content) {
    if (!run.text) continue;
    const marks = run.marks?.length ? [...new Set(run.marks)].sort() : undefined;
    const next: EditorInline = {
      text: run.text,
      ...(marks ? { marks } : {}),
      ...(run.href ? { href: run.href } : {}),
    };
    const previous = result.at(-1);
    if (
      previous &&
      previous.href === next.href &&
      JSON.stringify(previous.marks) === JSON.stringify(next.marks)
    )
      previous.text += next.text;
    else result.push(next);
  }
  return result;
}
