import { Button } from "@blog-platform/design-system";

type GitHubSignInButtonProps = {
  children?: string;
  className?: string;
};

export function GitHubSignInButton({
  children = "GitHub로 로그인",
  className = "mt-6",
}: GitHubSignInButtonProps) {
  return (
    <Button asChild className={className}>
      <a href="/api/auth/start/github">{children}</a>
    </Button>
  );
}
