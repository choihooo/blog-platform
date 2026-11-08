import { refreshPublicPath } from "./refresh-service";
import { NextResponse } from "next/server";

type RevalidateRequest = {
  path?: unknown;
  secret?: unknown;
};

function isPublicPath(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}

export async function POST(request: Request) {
  const secret = process.env.BLOG_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, message: "Revalidate secret is not configured." },
      { status: 500 },
    );
  }

  let body: RevalidateRequest;
  try {
    body = (await request.json()) as RevalidateRequest;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  if (body.secret !== secret) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  if (!isPublicPath(body.path)) {
    return NextResponse.json({ ok: false, message: "A public path is required." }, { status: 400 });
  }

  const result = await refreshPublicPath(body.path);
  if (result.ragSyncFailed) {
    return NextResponse.json(
      {
        ok: false,
        revalidated: true,
        message: "Page refreshed, but RAG sync failed. Retry refresh.",
      },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, path: body.path, revalidatedAt: new Date().toISOString() });
}
