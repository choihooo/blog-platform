import { timingSafeEqual } from "node:crypto";

export function authorized(request: Request, secret: string | undefined) {
  if (!secret) return false;
  const actual = new TextEncoder().encode(request.headers.get("authorization") ?? "");
  const expected = new TextEncoder().encode(`Bearer ${secret}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function isLocalRequest(request: Request) {
  const hostname = new URL(request.url).hostname;
  return hostname === "127.0.0.1" || hostname === "localhost";
}
