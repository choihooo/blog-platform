export type RolloutInputs = {
  matchedRows: number;
  comparedRows: number;
  imageExposed: number;
  imageExpected: number;
  responses5xx: number;
  totalResponses: number;
  dualRunMismatches: number;
  dualRunComparisons: number;
  categoryPathMatch?: number;
  categoryPathExpected?: number;
};

export type RolloutStatus = {
  readableMode: "ok" | "warn" | "critical";
  metrics: {
    matchRate: number;
    imageExposureRate: number;
    errorRateP5xx: number;
    dualRunDiffRate: number;
    categoryPageMatchRate?: number;
  };
  actions: string[];
};

const DEFAULT_THRESHOLDS = {
  matchRate: 0.995,
  imageExposureRate: 0.98,
  errorRateP5xx: 0.01,
  dualRunDiffRate: 0.005,
  categoryPageMatchRate: 0.98,
};

function safeRate(numerator: number, denominator: number) {
  if (denominator <= 0) return 1;
  return numerator / denominator;
}

export function assessRollout(input: RolloutInputs): RolloutStatus {
  const matchRate = safeRate(input.matchedRows, input.comparedRows);
  const imageExposureRate = safeRate(input.imageExposed, input.imageExpected);
  const errorRateP5xx = safeRate(input.responses5xx, input.totalResponses);
  const dualRunDiffRate = safeRate(input.dualRunMismatches, input.dualRunComparisons);
  const categoryPageMatchRate =
    input.categoryPathMatch === undefined || input.categoryPathExpected === undefined
      ? undefined
      : safeRate(input.categoryPathMatch, input.categoryPathExpected);

  const violations: string[] = [];
  if (matchRate < DEFAULT_THRESHOLDS.matchRate) {
    violations.push("조회 일치율이 임계치 아래로 하락했습니다.");
  }
  if (imageExposureRate < DEFAULT_THRESHOLDS.imageExposureRate) {
    violations.push("이미지 노출율이 임계치 아래입니다.");
  }
  if (errorRateP5xx > DEFAULT_THRESHOLDS.errorRateP5xx) {
    violations.push("5xx 오류율이 허용치 초과입니다.");
  }
  if (dualRunDiffRate > DEFAULT_THRESHOLDS.dualRunDiffRate) {
    violations.push("dual-run 차이율이 임계치 초과입니다.");
  }
  if (
    categoryPageMatchRate !== undefined &&
    categoryPageMatchRate < DEFAULT_THRESHOLDS.categoryPageMatchRate
  ) {
    violations.push("카테고리 페이지 일치율이 임계치 아래입니다.");
  }

  const readableMode = violations.length === 0 ? "ok" : violations.length > 1 ? "critical" : "warn";
  const actions = violations;

  if (readableMode === "critical") {
    actions.unshift("즉시 legacy 모드로 롤백 검토가 필요합니다.");
  } else if (readableMode === "warn") {
    actions.push("보완 조치를 반영한 후 메트릭 추적을 계속합니다.");
  }

  return {
    readableMode,
    metrics: {
      matchRate,
      imageExposureRate,
      errorRateP5xx,
      dualRunDiffRate,
      categoryPageMatchRate,
    },
    actions,
  };
}

export function formatRolloutSummary(input: RolloutInputs) {
  const status = assessRollout(input);
  return {
    generatedAt: new Date().toISOString(),
    status,
    thresholds: DEFAULT_THRESHOLDS,
  };
}
