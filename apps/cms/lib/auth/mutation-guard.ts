import type { AccessDecision, AuthFailureCode, GuardedMutationResult } from "./types";

function failureCode(status: Exclude<AccessDecision["status"], "authorized">): AuthFailureCode {
  if (status === "unauthenticated") return "auth-required";
  if (status === "expired") return "session-expired";
  if (status === "misconfigured") return "auth-misconfigured";
  return "forbidden";
}

export function authFailure(
  decision: Exclude<AccessDecision, { status: "authorized" }>,
): GuardedMutationResult<never> {
  return {
    ok: false,
    code: failureCode(decision.status),
    message: decision.reason,
    retryable: decision.status === "unauthenticated" || decision.status === "expired",
  };
}

export async function guardMutation<T>(
  decision: AccessDecision,
  operation: () => Promise<T>,
): Promise<GuardedMutationResult<T>> {
  if (decision.status !== "authorized") {
    return authFailure(decision);
  }

  return { ok: true, value: await operation() };
}
