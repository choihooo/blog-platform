import { createElement } from "react";
import { ImageResponse } from "next/og";
import { createOgImagePayload } from "@blog-platform/seo-engine";

import { postToSeoSubject, siteForSeo } from "@/features/blog/lib/seo";
import { getPostBySlug, getSiteConfig } from "@/features/blog/server/content-source";

export const revalidate = 900;

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, site] = await Promise.all([
    getPostBySlug(slug, { analyzeBody: false }),
    getSiteConfig(),
  ]);
  if (!post) return new Response("Not found", { status: 404 });

  if (post.coverImage) {
    return Response.redirect(new URL(post.coverImage, `${site.siteUrl}/`), 307);
  }

  const payload = createOgImagePayload(postToSeoSubject(post, siteForSeo(site)));
  const image = createElement(
    "div",
    {
      style: {
        alignItems: "stretch",
        background: "#111827",
        color: "#f9fafb",
        display: "flex",
        height: "100%",
        position: "relative",
        width: "100%",
      },
    },
    createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          padding: "76px 80px 66px",
          position: "relative",
          width: "100%",
        },
      },
      createElement(
        "div",
        { style: { color: "#93c5fd", display: "flex", fontSize: 32 } },
        payload.category ?? "",
      ),
      createElement(
        "div",
        {
          style: {
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.2,
            marginTop: 74,
            overflow: "hidden",
          },
        },
        payload.title,
      ),
      createElement(
        "div",
        {
          style: {
            color: "#d1d5db",
            display: "flex",
            fontSize: 34,
            marginTop: "auto",
          },
        },
        payload.siteName,
      ),
    ),
  );

  return new ImageResponse(image, {
    width: payload.width,
    height: payload.height,
    headers: {
      "cache-control": "public, s-maxage=900, stale-while-revalidate=86400",
    },
  });
}
