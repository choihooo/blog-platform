import { createHmac, timingSafeEqual } from "node:crypto";

export const PREVIEW_TOKEN_TTL_SECONDS = 30 * 60;

export type PreviewTokenPayload = {
  slug: string;
  contentSha: string;
  exp: number;
  nonce: string;
};

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function equalSignature(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyPreviewToken(
  token: string,
  input: { slug: string; contentSha: string; secret: string; now?: Date },
):
  | { ok: true; payload: PreviewTokenPayload }
  | { ok: false; reason: "invalid" | "expired" | "slug-mismatch" | "stale-content" } {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || !input.secret) return { ok: false, reason: "invalid" };
  if (!equalSignature(signature, sign(encoded, input.secret)))
    return { ok: false, reason: "invalid" };

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as PreviewTokenPayload;
    const now = Math.floor((input.now ?? new Date()).getTime() / 1000);
    if (payload.exp < now) return { ok: false, reason: "expired" };
    if (payload.slug !== input.slug) return { ok: false, reason: "slug-mismatch" };
    if (payload.contentSha !== input.contentSha) return { ok: false, reason: "stale-content" };
    return { ok: true, payload };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
