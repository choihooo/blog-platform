import { GitHubSignInButton } from "./sign-in-button";

type LoginPageViewProps = {
  state?: "denied" | "setup-error";
};

export function LoginPageView({ state }: LoginPageViewProps) {
  const message =
    state === "denied"
      ? "사이트 설정의 GitHub 관리자 identity와 로그인 계정이 일치하지 않습니다."
      : state === "setup-error"
        ? "content/site.json의 관리자 설정을 먼저 완료해야 합니다."
        : "GitHub 관리자 계정으로 로그인하세요.";

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">CMS</p>
        <h1 className="mt-2 text-2xl font-semibold">GitHub Login</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
        <GitHubSignInButton />
      </section>
    </main>
  );
}

type LoginPageProps = {
  searchParams?: Promise<{
    state?: "denied" | "setup-error";
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  return <LoginPageView state={(await searchParams)?.state} />;
}
