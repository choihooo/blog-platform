"use client";

import { Button } from "@blog-platform/design-system";
import { signIn } from "next-auth/react";

export function GitHubSignInButton() {
  return (
    <Button className="mt-6" type="button" onClick={() => signIn("github", { callbackUrl: "/" })}>
      GitHub로 로그인
    </Button>
  );
}
