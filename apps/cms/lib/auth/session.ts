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

export function toCmsSession(session: GitHubSession | null): CmsSession | null {
  if (!session?.githubLogin || !session.githubUserId || !session.expires) {
    return null;
  }

  return {
    githubLogin: session.githubLogin,
    githubUserId: session.githubUserId,
    displayName: session.user?.name ?? undefined,
    avatarUrl: session.user?.image ?? undefined,
    expiresAt: session.expires,
  };
}

export async function getCmsSession() {
  return toCmsSession((await getServerSession(authOptions)) as GitHubSession | null);
}
