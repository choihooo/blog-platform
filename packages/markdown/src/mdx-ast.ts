import { compileSync } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";

import { fail, firstIssue, ok } from "./result.js";
import type { ValidationResult } from "./types.js";

export function validateMdxSyntax(body: string, path = "body"): ValidationResult<string> {
  try {
    compileSync(body, {
      jsx: false,
      outputFormat: "function-body",
      remarkPlugins: [remarkGfm],
    });
    return ok(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid MDX syntax";
    return fail(firstIssue("mdx.syntax.invalid", message, [path]));
  }
}
