import type { NextAuthOptions, Session } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

type GitHubProfile = {
  id?: number | string;
  login?: string;
  name?: string | null;
  avatar_url?: string | null;
};

type TokenWithGitHub = {
  githubLogin?: string;
  githubUserId?: string;
  sub?: string;
  picture?: string | null;
  name?: string | null;
};

type SessionWithGitHub = Session & {
  githubLogin?: string;
  githubUserId?: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID ?? "",
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    jwt({ token, profile, account }) {
      const githubProfile = profile as GitHubProfile | undefined;
      const source = token as TokenWithGitHub;

      if (githubProfile?.login) {
        token.githubLogin = githubProfile.login;
      }

      const githubUserId =
        account?.provider === "github"
          ? account.providerAccountId
          : githubProfile?.id !== undefined
            ? String(githubProfile.id)
            : (source.githubUserId ?? source.sub);

      if (githubUserId) {
        token.githubUserId = githubUserId;
      }

      if (account?.provider === "github" && (!token.githubLogin || !token.githubUserId)) {
        console.warn("[cms-auth] GitHub identity claims are incomplete", {
          hasGithubLogin: Boolean(token.githubLogin),
          hasGithubUserId: Boolean(token.githubUserId),
          hasProfile: Boolean(profile),
          hasProviderAccountId: Boolean(account.providerAccountId),
        });
      }

      return token;
    },
    session({ session, token }) {
      const source = token as TokenWithGitHub;
      const target = session as SessionWithGitHub;
      target.githubLogin = source.githubLogin;
      target.githubUserId = source.githubUserId ?? source.sub;

      if (!target.githubLogin || !target.githubUserId) {
        console.warn("[cms-auth] Session is missing GitHub identity claims", {
          hasGithubLogin: Boolean(target.githubLogin),
          hasGithubUserId: Boolean(target.githubUserId),
          hasTokenSubject: Boolean(source.sub),
        });
      }

      return target;
    },
  },
};
