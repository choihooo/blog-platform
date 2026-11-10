type GitHubSignInButtonProps = {
  children?: string;
  className?: string;
};

export function GitHubSignInButton({
  children = "GitHub로 로그인",
  className = "mt-6",
}: GitHubSignInButtonProps) {
  return (
    <a
      className={`inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 ${className}`}
      href="/api/auth/start/github"
    >
      {children}
    </a>
  );
}
