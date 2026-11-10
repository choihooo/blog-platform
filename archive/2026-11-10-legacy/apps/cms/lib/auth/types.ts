export type AdminIdentity = {
  githubLogin: string;
  githubUserId: string;
  sourcePath: string;
};

export type CmsSession = {
  githubLogin: string;
  githubUserId: string;
  displayName?: string;
  avatarUrl?: string;
  expiresAt: string;
};

export type AccessDecision =
  | {
      status: "authorized";
      session: CmsSession;
      adminIdentity: AdminIdentity;
      nextAction: "continue";
    }
  | {
      status: "unauthenticated" | "forbidden" | "misconfigured" | "expired";
      reason: string;
      session?: CmsSession;
      adminIdentity?: AdminIdentity;
      nextAction: "sign-in" | "sign-out-and-retry" | "fix-site-config" | "retry";
    };

export type AuthFailureCode =
  "auth-required" | "forbidden" | "auth-misconfigured" | "session-expired";

export type GuardedMutationResult<TSuccess> =
  | { ok: true; value: TSuccess }
  | {
      ok: false;
      code: AuthFailureCode;
      message: string;
      retryable: boolean;
    };
