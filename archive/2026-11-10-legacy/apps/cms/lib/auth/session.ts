import { getServerSession } from "next-auth";

import { authOptions } from "./config";
import type { CmsSession } from "./types";

type GitHubSession = {
  githubLogin?: string;
  githubUserId?: string;
  expires?: string;
  user?: {
    name?: string | null;
    image?: string | null;
  };
};

export function toCmsSession(session: GitHubSession | null, now = new Date()): CmsSession | null {
  if (!session?.githubLogin || !session.githubUserId) {
    return null;
  }

  return {
    githubLogin: session.githubLogin,
    githubUserId: session.githubUserId,
    displayName: session.user?.name ?? undefined,
    avatarUrl: session.user?.image ?? undefined,
    // getServerSession can omit `expires` while rendering a Server Component.
    // At this point NextAuth has already validated the JWT, so a short-lived
    // fallback is sufficient for the synchronous CMS access decision.
    expiresAt: session.expires ?? new Date(now.getTime() + 60_000).toISOString(),
  };
}

export async function getCmsSession() {
  const session = (await getServerSession(authOptions)) as GitHubSession | null;
  const cmsSession = toCmsSession(session);

  if (session && !cmsSession) {
    console.warn("[cms-auth] NextAuth session could not be converted to a CMS session", {
      hasGithubLogin: Boolean(session.githubLogin),
      hasGithubUserId: Boolean(session.githubUserId),
    });
  }

  return cmsSession;
}
