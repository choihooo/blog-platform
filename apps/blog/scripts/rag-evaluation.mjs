export function evaluateCase(item, result, status, mode = "retrieval") {
  const sources = Array.isArray(result?.sources) ? result.sources : [];
  const valid = status === 200 && Array.isArray(result?.sources);
  const urls = sources.slice(0, 3).map((source) => source.url);
  const expected = item.expectedUrls;
  let retrievalPass =
    valid &&
    (expected?.length
      ? urls.some((url) => expected.includes(url))
      : expected
        ? urls.length === 0
        : true);
  const answer = typeof result?.answer === "string" ? result.answer : "";
  const isProjectList = item.responseType === "project-list";
  if (isProjectList) {
    const minimum = item.minProjectCount ?? 2;
    const allowed = new Set(item.allowedProjectUrls ?? []);
    const listed = sources.slice(0, 3);
    retrievalPass =
      valid &&
      Number.isInteger(minimum) &&
      minimum >= 2 &&
      minimum <= 3 &&
      answer.trim().length > 0 &&
      answer.length <= 4000 &&
      listed.length >= minimum &&
      new Set(urls).size === listed.length &&
      listed.every(
        (source) =>
          allowed.has(source.url) &&
          /^\/projects\/[a-z0-9-]+$/.test(source.url) &&
          typeof source.title === "string" &&
          source.title.trim().length > 0 &&
          typeof source.text === "string" &&
          source.text.trim().length > 0 &&
          answer.includes(source.title.trim()),
      );
  }
  const claimsPass = !(item.forbiddenClaims ?? []).some((claim) => answer.includes(claim));
  const generationPass =
    mode === "retrieval" ||
    (valid && (!sources.length || (answer.trim().length > 0 && answer.length <= 4000)));
  return {
    id: item.id,
    group: item.group,
    status,
    retrievalPass,
    ...(isProjectList ? { projectListPass: retrievalPass } : {}),
    claimsPass,
    generationPass,
    urls,
    scores: sources.map((s) => s.score),
    requiresHumanReview: Boolean(answer),
    answer,
  };
}

export function summarizeEvaluation(results) {
  const positive = results.filter((r) => r.group === "positive" && r.projectListPass === undefined);
  const projectLists = results.filter((r) => r.projectListPass !== undefined);
  return {
    total: results.length,
    recallAt3: positive.length
      ? positive.filter((r) => r.retrievalPass).length / positive.length
      : null,
    falsePositives: results.filter((r) => r.group === "negative" && !r.retrievalPass).length,
    failures: results.filter((r) => !r.retrievalPass || !r.claimsPass || r.generationPass === false)
      .length,
    humanReviewPending: results.filter((r) => r.requiresHumanReview).length,
    projectLists: {
      total: projectLists.length,
      passed: projectLists.filter((r) => r.projectListPass).length,
    },
  };
}
