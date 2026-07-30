import type { RepositoryFailureCode, RepositoryFailureState } from "./types.js";

const retryable = new Set<RepositoryFailureCode>([
  "rate-limit",
  "temporary-connectivity",
  "unknown",
]);

const messages: Record<RepositoryFailureCode, string> = {
  unauthorized: "Repository access is not authorized.",
  "missing-file": "The target file no longer exists.",
  "duplicate-file": "A file already exists at this path.",
  "stale-file": "The file changed after it was loaded.",
  "rate-limit": "Repository requests are rate limited.",
  "validation-failure": "The repository request is invalid.",
  "temporary-connectivity": "Repository connection failed temporarily.",
  unknown: "Repository operation failed.",
};

export function repositoryFailure(
  code: RepositoryFailureCode,
  options: { path?: string; submittedContent?: string; message?: string } = {},
): RepositoryFailureState {
  return {
    code,
    message: options.message ?? messages[code],
    retryable: retryable.has(code),
    path: options.path,
    submittedContent: options.submittedContent,
  };
}

export function normalizeHttpFailure(
  status: number,
  options: { path?: string; submittedContent?: string; message?: string } = {},
): RepositoryFailureState {
  if (status === 401 || status === 403) {
    const code = options.message?.toLowerCase().includes("rate limit")
      ? "rate-limit"
      : "unauthorized";
    return repositoryFailure(code, options);
  }
  if (status === 404) return repositoryFailure("missing-file", options);
  if (status === 409 || status === 412) return repositoryFailure("stale-file", options);
  if (status === 422) return repositoryFailure("validation-failure", options);
  if (status === 429) return repositoryFailure("rate-limit", options);
  if (status >= 500) return repositoryFailure("temporary-connectivity", options);
  return repositoryFailure("unknown", options);
}
