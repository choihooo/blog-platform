export type SearchSnapshot = { query: string; titles: string[] };
export type SearchContext = SearchSnapshot & { history?: SearchSnapshot[] };

export function isSearchContext(value: unknown): value is SearchContext {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.query === "string" &&
    v.query.length > 0 &&
    v.query.length <= 600 &&
    Array.isArray(v.titles) &&
    v.titles.length <= 3 &&
    v.titles.every((t) => typeof t === "string" && t.length > 0 && t.length <= 200) &&
    (v.history === undefined ||
      (Array.isArray(v.history) &&
        v.history.length <= 5 &&
        v.history.every(
          (s) => s && typeof s === "object" && !("history" in s) && isSearchContext(s),
        )))
  );
}
