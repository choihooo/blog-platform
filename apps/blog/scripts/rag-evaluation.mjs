export function evaluateCase(item, result, status) {
  const sources = Array.isArray(result?.sources) ? result.sources : [];
  const valid = status === 200 && Array.isArray(result?.sources);
  const urls = sources.slice(0, 3).map((source) => source.url);
  const expected = item.expectedUrls;
  const retrievalPass =
    valid &&
    (expected?.length
      ? urls.some((url) => expected.includes(url))
      : expected
        ? urls.length === 0
        : true);
  const answer = typeof result?.answer === "string" ? result.answer : "";
  const claimsPass = !(item.forbiddenClaims ?? []).some((claim) => answer.includes(claim));
  return {
    id: item.id,
    group: item.group,
    status,
    retrievalPass,
    claimsPass,
    urls,
    scores: sources.map((s) => s.score),
    requiresHumanReview: Boolean(answer),
    answer,
  };
}

export function summarizeEvaluation(results) {
  const positive = results.filter((r) => r.group === "positive");
  return {
    total: results.length,
    recallAt3: positive.length
      ? positive.filter((r) => r.retrievalPass).length / positive.length
      : null,
    falsePositives: results.filter((r) => r.group === "negative" && !r.retrievalPass).length,
    failures: results.filter((r) => !r.retrievalPass || !r.claimsPass).length,
    humanReviewPending: results.filter((r) => r.requiresHumanReview).length,
  };
}
