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

/** Never carry assistant-generated prose into evidence or the next search. */
export function resolveFollowUp(
  query: string,
  context?: SearchContext,
): { query: string; clarification?: string } {
  if (/^(방금\s*말한\s*수치\s*진짜야|모르면서\s*지어낸\s*거\s*아니야)[?.!\s]*$/.test(query))
    return resolveFollowUp("근거 링크 줘", context);
  if (
    /^(왜 그 기술을 선택했어|다른 방법은 검토 안 했어|이 글 핵심만 요약해줘)[?.!\s]*$/.test(query)
  ) {
    if (!context || context.titles.length !== 1)
      return {
        query,
        clarification:
          "어떤 프로젝트나 글인지 먼저 골라주세요. 원문에서 확인되는 내용만 설명할게요.",
      };
    return { query: `${context.titles[0]} ${query}`.slice(0, 600) };
  }
  if (/^아까/.test(query)) {
    const previous = [...(context?.history ?? []), ...(context ? [context] : [])]
      .reverse()
      .find((s) => s.titles.length > 1);
    if (!previous)
      return {
        query,
        clarification:
          "이 대화에서 이전 목록을 찾지 못했어요. 프로젝트나 글 목록을 다시 요청해 주세요.",
      };
    return resolveFollowUp(
      query.replace(/^아까\s*(?:말한\s*)?/, "").replace(/\s*다시\s*보여줘[?.!]*$/, ""),
      previous,
    );
  }
  // Filters operate on the previous search, not an arbitrarily selected result.
  if (
    /^(회사\s*거\s*말고|혼자\s*만든\s*걸로|더\s*최근\s*거|AI\s*말고\s*React)[?.!\s]*$/i.test(query)
  ) {
    if (!context) return { query, clarification: "프로젝트와 블로그 글 중 무엇을 찾고 있나요?" };
    const domain = /글|블로그|포스트/.test(context.query) ? "글" : "프로젝트";
    return {
      query: /회사/.test(query)
        ? "개인 프로젝트"
        : /혼자/.test(query)
          ? "혼자 만든 프로젝트"
          : /React/i.test(query)
            ? `React ${domain} AI 제외`
            : `최근 ${/React|리액트/i.test(context.query) ? "React " : /AI/i.test(context.query) ? "AI " : ""}${domain}${/AI 제외/.test(context.query) ? " AI 제외" : ""}`,
    };
  }
  const shortDetail =
    /^(본인이\s*한\s*(?:건|일|부분)|성과는|그래서\s*결과는|기술\s*스택은|링크\s*줘|코드도|출처\s*어디야|근거\s*링크\s*줘|그건\s*왜|어떻게\s*했는데|쉽게\s*설명해줘|좀\s*짧게|표로\s*비교해줘|더\s*최근\s*거|다른\s*것도\s*있어)[?.!\s]*$/.test(
      query,
    );
  const follow =
    /^(그거|그건|그건요|그게|그\s*(프로젝트|글)|이거|첫\s*번째|두\s*번째|세\s*번째|[123]번|더\s*자세|관련\s*글|관련\s*프로젝트)/.test(
      query.trim(),
    );
  if (!follow && !shortDetail) return { query };
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
