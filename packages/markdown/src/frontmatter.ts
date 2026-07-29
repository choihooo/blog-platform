import matter from "gray-matter";

import { fail, firstIssue, ok } from "./result.js";
import type { ValidationResult } from "./types.js";

export function serializeFrontmatter(metadata: Record<string, unknown>): ValidationResult<string> {
  try {
    return ok(matter.stringify("", metadata).trim());
  } catch {
    return fail(
      firstIssue("mdx.frontmatter.unsupported-value", "Frontmatter contains an unsupported value", [
        "frontmatter",
      ]),
    );
  }
}
