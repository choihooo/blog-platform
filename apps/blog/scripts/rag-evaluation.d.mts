export type EvaluationCase = {
  id: string;
  group: string;
  expectedUrls?: string[];
  forbiddenClaims?: string[];
  responseType?: "project-list";
  minProjectCount?: number;
  allowedProjectUrls?: string[];
};
export type EvaluationResult = {
  group: string;
  retrievalPass: boolean;
  claimsPass?: boolean;
  generationPass?: boolean;
  requiresHumanReview?: boolean;
  projectListPass?: boolean;
};
export function evaluateCase(
  item: EvaluationCase,
  result: unknown,
  status: number,
  mode?: "retrieval" | "generation",
): EvaluationResult & { id: string; status: number; urls: string[]; answer: string };
export function summarizeEvaluation(results: EvaluationResult[]): {
  total: number;
  recallAt3: number | null;
  falsePositives: number;
  failures: number;
  humanReviewPending: number;
  projectLists: { total: number; passed: number };
};
