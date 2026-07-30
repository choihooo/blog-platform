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
    jwt({ token, profile }) {
      const githubProfile = profile as GitHubProfile | undefined;

      if (githubProfile?.login && githubProfile.id !== undefined) {
        token.githubLogin = githubProfile.login;
        token.githubUserId = String(githubProfile.id);
      }

      return token;
    },
    session({ session, token }) {
      const source = token as TokenWithGitHub;
      const target = session as SessionWithGitHub;
      target.githubLogin = source.githubLogin;
      target.githubUserId = source.githubUserId;
      return target;
    },
  },
};
