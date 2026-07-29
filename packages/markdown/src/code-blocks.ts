import { bundledLanguages } from "shiki";

import type { CodeBlock } from "./types.js";

const KNOWN_LANGUAGES = new Set(Object.keys(bundledLanguages));

export function extractCodeBlocks(body: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  for (const match of body.matchAll(/```([^\s`]*)[\s\S]*?```/g)) {
    const requested = match[1]?.trim().toLowerCase() || "text";
    const language = KNOWN_LANGUAGES.has(requested) ? requested : "text";
    blocks.push({ language, fallback: language !== requested });
  }
  return blocks;
}
