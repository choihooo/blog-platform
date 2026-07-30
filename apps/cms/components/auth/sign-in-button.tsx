"use client";

import { Button } from "@blog-platform/design-system";
import { signIn } from "next-auth/react";

type GitHubSignInButtonProps = {
  children?: string;
  className?: string;
};

export function GitHubSignInButton({
  children = "GitHub로 로그인",
  className = "mt-6",
}: GitHubSignInButtonProps) {
  return (
    <Button
      className={className}
      type="button"
      onClick={() => signIn("github", { callbackUrl: "/" })}
    >
      {children}
    </Button>
  );
}
