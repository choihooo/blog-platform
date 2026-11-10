import { createHash, randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

function csrfSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
}

function createCsrfToken(secret: string) {
  const token = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(`${token}${secret}`).digest("hex");
  return { cookie: `${token}|${hash}`, token };
}

function html(input: { callbackUrl: string; csrfToken: string }) {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Signing in...</title>
  </head>
  <body>
    <form id="signin" action="/api/auth/signin/github" method="post">
      <input type="hidden" name="csrfToken" value="${input.csrfToken}" />
      <input type="hidden" name="callbackUrl" value="${input.callbackUrl}" />
      <button type="submit">GitHub로 로그인</button>
    </form>
    <script>document.getElementById("signin").submit();</script>
  </body>
</html>`;
}

export function GET(request: Request) {
  const secret = csrfSecret();
  if (!secret) {
    return new NextResponse("AUTH_SECRET is not configured.", { status: 500 });
  }

  const origin = new URL(request.url).origin;
  const callbackUrl = new URL("/", origin).toString();
  const csrf = createCsrfToken(secret);
  const response = new NextResponse(html({ callbackUrl, csrfToken: csrf.token }), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });

  response.cookies.set("__Host-next-auth.csrf-token", csrf.cookie, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
  response.cookies.set("__Secure-next-auth.callback-url", callbackUrl, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
  });

  return response;
}
