import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = ["/", "/posts", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    protectedPaths.includes(pathname) &&
    !request.cookies.has("next-auth.session-token") &&
    !request.cookies.has("__Secure-next-auth.session-token")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/posts/:path*", "/settings/:path*"],
};
