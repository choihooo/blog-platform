import type { EditorMark, EditorNode, EditorNodeType, EditorToolbarCommand } from "./document.js";

export const SUPPORTED_BLOCKS = [
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "horizontalRule",
  "codeBlock",
  "image",
  "table",
] as const satisfies readonly EditorNodeType[];

export const SUPPORTED_MARKS = [
  "bold",
  "italic",
  "link",
  "inlineCode",
] as const satisfies readonly EditorMark[];

export const TOOLBAR_COMMANDS = [
  "heading",
  "bold",
  "italic",
  "link",
  "bulletList",
  "orderedList",
  "blockquote",
  "codeBlock",
  "image",
  "table",
  "preview",
  "save",
] as const satisfies readonly EditorToolbarCommand[];

export function isSupportedBlock(value: string): value is EditorNodeType {
  return SUPPORTED_BLOCKS.includes(value as EditorNodeType);
}

export function isSupportedMark(value: string): value is EditorMark {
  return SUPPORTED_MARKS.includes(value as EditorMark);
}

export function getSupportedToolbarState(
  active: Partial<Record<EditorToolbarCommand, boolean>> = {},
  selectedNode?: EditorNode,
) {
  return TOOLBAR_COMMANDS.map((command) => ({
    command,
    active: active[command] ?? selectedNode?.type === command,
    available: command !== "image",
    disabledReason: command === "image" ? "Media upload is handled in a later phase" : undefined,
  }));
}
