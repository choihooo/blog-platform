import GithubSlugger from "github-slugger";

import type { Heading, ValidationResult } from "./types.js";
import { ok } from "./result.js";

export function extractHeadings(body: string): ValidationResult<Heading[]> {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;

  for (const line of body.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;

    const text = match[2]?.trim();
    if (!text) continue;
    headings.push({
      depth: match[1]?.length ?? 1,
      text,
      slug: slugger.slug(text),
    });
  }

  return ok(headings);
}
