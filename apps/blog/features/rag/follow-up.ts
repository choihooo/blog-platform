export type SearchContext = { query: string; titles: string[] };

export function isSearchContext(value: unknown): value is SearchContext {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.query === "string" &&
    v.query.length > 0 &&
    v.query.length <= 600 &&
    Array.isArray(v.titles) &&
    v.titles.length <= 3 &&
    v.titles.every((t) => typeof t === "string" && t.length > 0 && t.length <= 200)
  );
}

/** Never carry assistant-generated prose into evidence or the next search. */
export function resolveFollowUp(
  query: string,
  context?: SearchContext,
): { query: string; clarification?: string } {
  const follow =
    /^(그거|그건|그건요|그게|그\s*(프로젝트|글)|이거|첫\s*번째|두\s*번째|세\s*번째|[123]번|더\s*자세|관련\s*글|관련\s*프로젝트)/.test(
      query.trim(),
    );
  if (!follow) return { query };
  if (!context) return { query, clarification: "어떤 프로젝트나 글을 말하는지 이름을 알려주세요." };
  const ordinal = /^(첫\s*번째|1번)/.test(query)
    ? 0
    : /^(두\s*번째|2번)/.test(query)
      ? 1
      : /^(세\s*번째|3번)/.test(query)
        ? 2
        : null;
  if (
    (ordinal !== null && !context.titles[ordinal]) ||
    (ordinal === null && context.titles.length > 1)
  ) {
    return {
      query,
      clarification: `어느 항목이 궁금한가요?${context.titles.length ? "\n" + context.titles.map((t, i) => `${i + 1}. ${t}`).join("\n") : " 프로젝트나 글 이름을 알려주세요."}`,
    };
  }
  const topic = ordinal !== null ? context.titles[ordinal]! : (context.titles[0] ?? context.query);
  const detail = query.replace(
    /^(그거|그건요?|그게|그\s*(?:프로젝트|글)|이거|첫\s*번째|두\s*번째|세\s*번째|[123]번)(?:는|은|를|을)?\s*/,
    "",
  );
  return { query: `${topic} ${detail || "자세히 설명"}`.slice(0, 600) };
}
