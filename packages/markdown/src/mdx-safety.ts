import { fail, ok, issue, mergeIssues } from "./result.js";
import { isAllowedComponent } from "./mdx-components.js";
import type { MdxAnalysisOptions, ValidationIssue, ValidationResult } from "./types.js";

function stripCodeFences(body: string): string {
  return body.replace(/```[\s\S]*?```/g, "");
}

function isSafeUrl(value: string): boolean {
  return !/^\s*(javascript|data):/i.test(value);
}

export function validateMdxSafety(
  body: string,
  options: Pick<MdxAnalysisOptions, "allowedComponents"> = {},
): ValidationResult<{ warnings: ValidationIssue[] }> {
  const scan = stripCodeFences(body);
  const issues: ValidationIssue[] = [];

  if (/^\s*(import|export)\s/m.test(scan)) {
    issues.push(
      issue("mdx.import-export.disallowed", "MDX import/export is not allowed", ["body"]),
    );
  }
  if (/<\s*script\b/i.test(scan)) {
    issues.push(issue("mdx.script.disallowed", "Script tags are not allowed", ["body"]));
  }
  if (/\son[A-Z][\w-]*\s*=/.test(scan)) {
    issues.push(issue("mdx.event-handler.disallowed", "Event handlers are not allowed", ["body"]));
  }
  if (/dangerouslySetInnerHTML\s*=/.test(scan)) {
    issues.push(issue("mdx.html.unsafe", "Raw HTML injection props are not allowed", ["body"]));
  }

  for (const match of scan.matchAll(/<(https?:\/\/|[A-Z][A-Za-z0-9.]*)\b/g)) {
    const name = match[1];
    if (name && !name.startsWith("http") && !isAllowedComponent(name, options.allowedComponents)) {
      issues.push(
        issue("mdx.component.unsupported", `Unsupported MDX component: ${name}`, ["body", name]),
      );
    }
  }

  for (const match of scan.matchAll(/\]\(([^)]+)\)|(?:href|src)\s*=\s*["']([^"']+)["']/g)) {
    const url = match[1] ?? match[2] ?? "";
    if (!isSafeUrl(url)) {
      issues.push(issue("mdx.url.unsafe", "Unsafe URL scheme is not allowed", ["body"]));
    }
  }

  if (/{\s*[^}]+(?:\(|=>|;)\s*[^}]*}/.test(scan)) {
    issues.push(
      issue("mdx.runtime-evaluation.disallowed", "Runtime JavaScript expressions are not allowed", [
        "body",
      ]),
    );
  }

  const merged = mergeIssues(issues);
  if (merged.length > 0) return fail(merged);
  return ok({ warnings: [] });
}
