import type { Heading, TocItem } from "./types.js";

export function generateToc(
  headings: Heading[],
  options: { minDepth?: number; maxDepth?: number } = {},
): TocItem[] {
  const minDepth = options.minDepth ?? 2;
  const maxDepth = options.maxDepth ?? 3;
  return headings
    .filter((heading) => heading.depth >= minDepth && heading.depth <= maxDepth)
    .map(({ depth, text, slug }) => ({ depth, text, slug }));
}
