import matter from "gray-matter";

import { extractCodeBlocks } from "./code-blocks.js";
import { serializeFrontmatter } from "./frontmatter.js";
import { extractHeadings } from "./headings.js";
import { validateMdxSyntax } from "./mdx-ast.js";
import { validateMdxSafety } from "./mdx-safety.js";
import { calculateReadingTime } from "./reading-time.js";
import { fail, firstIssue, ok } from "./result.js";
import { generateToc } from "./toc.js";
import type {
  MdxAnalysis,
  MdxAnalysisOptions,
  MdxDocumentInput,
  ParsedMdxDocument,
  ValidationResult,
} from "./types.js";

export { serializeFrontmatter };

export function parseMdxDocument(input: MdxDocumentInput): ValidationResult<ParsedMdxDocument> {
  try {
    const parsed = matter(input.source);
    return ok({
      path: input.path,
      frontmatter: parsed.data,
      body: parsed.content.trim(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid frontmatter";
    return fail(firstIssue("mdx.frontmatter.invalid", message, [input.path, "frontmatter"]));
  }
}

export function analyzeMdx(
  input: MdxDocumentInput,
  options: MdxAnalysisOptions = {},
): ValidationResult<MdxAnalysis> {
  const parsed = parseMdxDocument(input);
  if (!parsed.success || !parsed.data) return fail(parsed.issues);

  const syntax = validateMdxSyntax(parsed.data.body, input.path);
  if (!syntax.success) return fail(syntax.issues);

  const safety = validateMdxSafety(parsed.data.body, options);
  if (!safety.success || !safety.data) return fail(safety.issues);

  const headings = extractHeadings(parsed.data.body);
  if (!headings.success || !headings.data) return fail(headings.issues);

  return ok({
    ...parsed.data,
    headings: headings.data,
    toc: generateToc(headings.data, {
      minDepth: options.tocMinDepth,
      maxDepth: options.tocMaxDepth,
    }),
    readingTime: calculateReadingTime(parsed.data.body),
    codeBlocks: extractCodeBlocks(parsed.data.body),
    warnings: safety.data.warnings,
  });
}
