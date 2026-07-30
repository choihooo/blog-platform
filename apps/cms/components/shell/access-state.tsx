import { Button } from "@blog-platform/design-system";

import type { AccessDecision } from "../../lib/auth/index";
import { GitHubSignInButton } from "../auth/index";

type AccessStateProps = {
  decision: Exclude<AccessDecision, { status: "authorized" }>;
};

const copy = {
  unauthenticated: {
    title: "로그인이 필요합니다",
    description: "GitHub 관리자 계정으로 로그인한 뒤 CMS에 접근할 수 있습니다.",
    action: "GitHub로 로그인",
  },
  expired: {
    title: "세션이 만료되었습니다",
    description: "다시 로그인하면 CMS 작업을 계속할 수 있습니다.",
    action: "다시 로그인",
  },
  forbidden: {
    title: "CMS 접근 권한이 없습니다",
    description: "사이트 설정의 GitHub login과 user id가 모두 일치해야 합니다.",
    action: "다른 계정으로 로그인",
    href: "/api/auth/signout",
  },
  misconfigured: {
    title: "관리자 설정이 필요합니다",
    description: "content/site.json의 adminGithubLogin과 adminGithubUserId를 확인하세요.",
    action: "로그인 페이지로 이동",
    href: "/login",
  },
} as const;

export function AccessState({ decision }: AccessStateProps) {
  const state = copy[decision.status];
  const shouldSignIn = decision.status === "unauthenticated" || decision.status === "expired";
  const href = decision.status === "forbidden" ? "/api/auth/signout" : "/login";

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <p className="mb-2 text-sm text-muted-foreground">{decision.reason}</p>
        <h1 className="text-2xl font-semibold">{state.title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{state.description}</p>
        {shouldSignIn ? (
          <GitHubSignInButton>{state.action}</GitHubSignInButton>
        ) : (
          <Button asChild className="mt-6">
            <a href={href}>{state.action}</a>
          </Button>
        )}
      </section>
    </main>
  );
}
