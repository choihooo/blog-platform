import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getPosts } from "@/lib/posts";
import { getSiteConfig } from "@/lib/site";
import { PostOgImage } from "@/lib/og-image";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPosts()).map(({ slug }) => ({ slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = (await getPosts()).find((item) => item.slug === slug);
  if (!post) return new Response("Not found", { status: 404 });

  const font = await readFile(join(process.cwd(), "app/fonts/suit/SUIT-Bold.otf"));
  return new ImageResponse(<PostOgImage post={post} hostname={getSiteConfig().url.hostname} />, {
    width: 1200,
    height: 630,
    fonts: [{ name: "SUIT", data: font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength) as ArrayBuffer, weight: 700, style: "normal" }],
  });
}
