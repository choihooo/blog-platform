import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = ["/", "/posts", "/settings"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(`${path}/`)),
  );

  if (
    isProtected &&
    !(process.env.NODE_ENV === "development" && process.env.CMS_DEV_BYPASS_AUTH === "1") &&
    !(await getToken({ req: request, secret: process.env.AUTH_SECRET }))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/posts/:path*", "/settings/:path*"],
};
