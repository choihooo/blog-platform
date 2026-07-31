import { loadAdminIdentity } from "./admin-identity";
import type { AccessDecision, AdminIdentity, CmsSession } from "./types";

export function isDevAuthBypassEnabled() {
  return process.env.NODE_ENV === "development" && process.env.CMS_DEV_BYPASS_AUTH === "1";
}

function devAccess(): AccessDecision {
  const session: CmsSession = {
    githubLogin: "dev-admin",
    githubUserId: "dev",
    displayName: "Dev Admin",
    expiresAt: "2099-01-01T00:00:00.000Z",
  };

  return {
    status: "authorized",
    session,
    adminIdentity: {
      githubLogin: session.githubLogin,
      githubUserId: session.githubUserId,
      sourcePath: "development bypass",
    },
    nextAction: "continue",
  };
}

export function isExpired(session: CmsSession, now = new Date()) {
  return Number.isNaN(Date.parse(session.expiresAt)) || new Date(session.expiresAt) <= now;
}

export function decideAccess(input: {
  session?: CmsSession | null;
  adminIdentity?: AdminIdentity;
  adminError?: string;
  now?: Date;
}): AccessDecision {
  if (!input.session) {
    return { status: "unauthenticated", reason: "GitHub login is required", nextAction: "sign-in" };
  }

  if (isExpired(input.session, input.now)) {
    return {
      status: "expired",
      reason: "Session expired",
      session: input.session,
      nextAction: "sign-in",
    };
  }

  if (!input.adminIdentity) {
    return {
      status: "misconfigured",
      reason: input.adminError ?? "Admin identity is not configured",
      session: input.session,
      nextAction: "fix-site-config",
    };
  }

  if (
    input.session.githubLogin !== input.adminIdentity.githubLogin ||
    input.session.githubUserId !== input.adminIdentity.githubUserId
  ) {
    return {
      status: "forbidden",
      reason: "GitHub login and immutable user id must both match",
      session: input.session,
      adminIdentity: input.adminIdentity,
      nextAction: "sign-out-and-retry",
    };
  }

  return {
    status: "authorized",
    session: input.session,
    adminIdentity: input.adminIdentity,
    nextAction: "continue",
  };
}

export async function evaluateAccess(session?: CmsSession | null, root?: string) {
  if (isDevAuthBypassEnabled()) {
    return devAccess();
  }

  const admin = await loadAdminIdentity(root);

  return decideAccess({
    session,
    adminIdentity: admin.success ? admin.identity : undefined,
    adminError: admin.success ? undefined : admin.reason,
  });
}
