export type EvaluationCase = {
  id: string;
  group: string;
  expectedUrls?: string[];
  forbiddenClaims?: string[];
};
export type EvaluationResult = {
  group: string;
  retrievalPass: boolean;
  claimsPass?: boolean;
  requiresHumanReview?: boolean;
};
export function evaluateCase(
  item: EvaluationCase,
  result: unknown,
  status: number,
): EvaluationResult & { id: string; status: number; urls: string[]; answer: string };
export function summarizeEvaluation(results: EvaluationResult[]): {
  total: number;
  recallAt3: number | null;
  falsePositives: number;
  failures: number;
  humanReviewPending: number;
};
