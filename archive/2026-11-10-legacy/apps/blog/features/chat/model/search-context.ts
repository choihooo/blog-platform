import type { RagResult } from "@blog-platform/core/search";
import type { SearchContext } from "../../rag/contracts";

export function advanceSearchContext(
  previous: SearchContext | undefined,
  query: string,
  result: RagResult,
): SearchContext | undefined {
  if (!result.sources.length) return previous;
  return {
    query: result.resolvedQuery ?? query,
    titles: [...new Set(result.sources.map((source) => source.title))].slice(0, 3),
    history: [
      ...(previous?.history ?? []),
      ...(previous ? [{ query: previous.query, titles: previous.titles }] : []),
    ].slice(-5),
  };
}
