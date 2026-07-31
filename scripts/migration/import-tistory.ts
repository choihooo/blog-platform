#!/usr/bin/env node

import "./env";

import { createHash, createHmac } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { createD1R2ContentAdapter } from "../../apps/cms/lib/content-adapter/d1-r2-adapter";
import type {
  CategoryRecord,
  MediaReference,
  PostRecord,
  TagRecord,
} from "../../apps/cms/lib/content-adapter/content-adapter.interface";
import type { MediaMappingRecord } from "../../apps/cms/lib/migration/map-media";

const BLOG_ORIGIN = "https://hochoi.tistory.com";
const OUTPUT_DIR = resolve(process.cwd(), "scripts/migration/tistory-output");
const AUTHOR = "tistory-migration";

type TistoryPost = {
  entryId: number;
  sourceUrl: string;
  slug: string;
  title: string;
  summary: string;
  contentHtml: string;
  content: string;
  categoryName: string;
  categorySlug: string;
  publishedAt: string;
  updatedAt: string;
  tagNames: string[];
  tagSlugs: string[];
  images: TistoryImage[];
  heroImageKey: string | null;
};

type TistoryImage = {
  sourceUrl: string;
  targetR2Key: string;
  r2Url: string;
  width: number | null;
  height: number | null;
  kind: "hero" | "body";
};

type RssItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  categories: string[];
};

type ImportSummary = {
  discovered: number;
  extracted: number;
  categories: number;
  tags: number;
  media: number;
  importedPosts: number;
  uploadedMedia: number;
  dryRun: boolean;
  warnings: string[];
};

function hasFlag(name: string) {
  return process.argv.includes(name);
}

function getArg(name: string) {
  const prefix = `${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

function decodeHtml(input: string) {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&nbsp;/gi, " ")
    .replace(/&middot;/gi, "·")
    .replace(/&ndash;/gi, "-")
    .replace(/&mdash;/gi, "-")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/&lsquo;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripTags(input: string) {
  return decodeHtml(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function normalizeAsciiSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stableHash(input: string, length = 10) {
  return createHash("sha1").update(input).digest("hex").slice(0, length);
}

function slugForTag(name: string) {
  return normalizeAsciiSlug(name) || `tistory-tag-${stableHash(name, 8)}`;
}

function categoryFor(label: string | undefined) {
  const normalized = (label ?? "Tistory").trim();
  const table: Record<string, { name: string; slug: string }> = {
    개발: { name: "개발", slug: "engineering" },
    "개발/FE": { name: "FE", slug: "engineering/fe" },
    "개발/AI": { name: "AI", slug: "engineering/ai" },
    "개발/CS": { name: "CS", slug: "engineering/cs" },
    FE: { name: "FE", slug: "fe" },
    AI: { name: "AI", slug: "ai" },
    CS: { name: "CS", slug: "cs" },
    회고: { name: "회고", slug: "retrospective" },
    서평: { name: "서평", slug: "book-review" },
  };
  return (
    table[normalized] ?? {
      name: normalized,
      slug: normalizeAsciiSlug(normalized) || `tistory-${stableHash(normalized, 8)}`,
    }
  );
}

function absoluteUrl(input: string) {
  const decoded = decodeHtml(input).trim();
  if (!decoded || decoded.startsWith("data:") || decoded.startsWith("javascript:")) return "";
  if (decoded.startsWith("//")) return `https:${decoded}`;
  try {
    return new URL(decoded, BLOG_ORIGIN).toString();
  } catch {
    return "";
  }
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; blog-platform-migration/1.0; +https://hochoi.tistory.com)",
    },
  });
  if (!response.ok) throw new Error(`fetch failed ${response.status}: ${url}`);
  return response.text();
}

function extractMeta(html: string, property: string) {
  const re = new RegExp(
    `<meta\\s+[^>]*(?:property|name)=["']${escapeRegExp(property)}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  return decodeHtml(html.match(re)?.[1] ?? "");
}

function extractEntryInfo(html: string): { entryId?: number; categoryLabel?: string } {
  const raw = html.match(/window\.T\.entryInfo\s*=\s*(\{[^;]*\})/)?.[1];
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as { entryId?: number; categoryLabel?: string };
    return parsed;
  } catch {
    return {};
  }
}

function extractAssignedJson(html: string, marker: string) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return;
  const start = html.indexOf("{", markerIndex);
  if (start < 0) return;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < html.length; index += 1) {
    const char = html[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return html.slice(start, index + 1);
  }
}

function parseRssItems(xml: string): RssItem[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => {
    const item = match[1] ?? "";
    return {
      title: decodeHtml(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? ""),
      link: decodeHtml(item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ?? ""),
      description: decodeHtml(item.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ?? ""),
      pubDate: decodeHtml(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] ?? ""),
      categories: [...item.matchAll(/<category>([\s\S]*?)<\/category>/gi)].map((category) =>
        decodeHtml(category[1] ?? "").trim(),
      ),
    };
  });
}

function discoverLinksFromHtml(html: string) {
  const ids = new Set<number>();
  for (const match of html.matchAll(/href=["'](?:https:\/\/hochoi\.tistory\.com)?\/(\d+)["']/g)) {
    const id = Number(match[1]);
    if (Number.isInteger(id) && id > 0) ids.add(id);
  }
  return ids;
}

async function discoverPostIds(maxPages: number) {
  const ids = new Set<number>();
  const rss = await fetchText(`${BLOG_ORIGIN}/rss`);
  for (const item of parseRssItems(rss)) {
    const id = Number(new URL(item.link).pathname.replace("/", ""));
    if (Number.isInteger(id) && id > 0) ids.add(id);
  }

  for (let page = 1; page <= maxPages; page += 1) {
    const before = ids.size;
    const html = await fetchText(`${BLOG_ORIGIN}/category?page=${page}`);
    for (const id of discoverLinksFromHtml(html)) ids.add(id);
    if (page > 1 && ids.size === before) break;
  }

  return { ids: [...ids].sort((a, b) => b - a), rssItems: parseRssItems(rss) };
}

function extractArticleHtml(pageHtml: string) {
  const classIndex = pageHtml.search(
    /class=["'][^"']*tt_article_useless_p_margin[^"']*contents_style/i,
  );
  if (classIndex < 0) return "";
  const start = pageHtml.lastIndexOf("<div", classIndex);
  if (start < 0) return "";
  const endMarkers = [
    pageHtml.indexOf('<div class="container_postbtn', start),
    pageHtml.indexOf('<div class="another_category', start),
    pageHtml.indexOf("<script", start),
  ].filter((index) => index > start);
  const end = Math.min(...endMarkers);
  return pageHtml.slice(start, Number.isFinite(end) ? end : undefined);
}

function extractTags(pageHtml: string) {
  const raw = extractAssignedJson(pageHtml, "window.tiara");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as { entry?: { tags?: string[] } };
    return [...new Set(parsed.entry?.tags ?? [])].map((tag) => tag.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function extractImages(html: string, slug: string): TistoryImage[] {
  const images: TistoryImage[] = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0] ?? "";
    const sourceUrl = absoluteUrl(tag.match(/\ssrc=["']([^"']+)["']/i)?.[1] ?? "");
    if (!sourceUrl || seen.has(sourceUrl)) continue;
    seen.add(sourceUrl);
    const width = Number(tag.match(/\b(?:data-origin-width|width)=["'](\d+)["']/i)?.[1]);
    const height = Number(tag.match(/\b(?:data-origin-height|height)=["'](\d+)["']/i)?.[1]);
    const ext =
      new URL(sourceUrl).pathname.match(/\.(png|jpe?g|gif|webp|avif|svg)$/i)?.[1] ?? "bin";
    const targetR2Key = `blog/tistory/${slug}/${stableHash(sourceUrl, 16)}.${ext.toLowerCase()}`;
    const publicBase = (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, "");
    images.push({
      sourceUrl,
      targetR2Key,
      r2Url: publicBase ? `${publicBase}/${targetR2Key}` : targetR2Key,
      width: Number.isFinite(width) && width > 0 ? width : null,
      height: Number.isFinite(height) && height > 0 ? height : null,
      kind: images.length === 0 ? "hero" : "body",
    });
  }
  return images;
}

function htmlToMarkdown(html: string, images: TistoryImage[]) {
  const imageBySource = new Map(images.map((image) => [image.sourceUrl, image]));
  let next = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/gi, (_, caption: string) => {
      const text = stripTags(caption);
      return text ? `\n_${text}_\n` : "";
    })
    .replace(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, (_, code: string) => {
      return `\n\n\`\`\`\n${decodeHtml(code).trim()}\n\`\`\`\n\n`;
    })
    .replace(/<img\b[^>]*>/gi, (tag: string) => {
      const image = imageBySource.get(absoluteUrl(tag.match(/\ssrc=["']([^"']+)["']/i)?.[1] ?? ""));
      return image ? `\n\n![](${image.r2Url})\n\n` : "";
    });

  next = next
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n")
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n")
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n\n> $1\n\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
    .replace(/<\/?(ul|ol)[^>]*>/gi, "\n")
    .replace(
      /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_, href: string, text: string) => {
        const label = stripTags(text);
        return label ? `[${label}](${absoluteUrl(href)})` : "";
      },
    )
    .replace(
      /<code[^>]*>([\s\S]*?)<\/code>/gi,
      (_, code: string) => `\`${decodeHtml(code).trim()}\``,
    )
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, "_$2_")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<[^>]+>/g, " ");

  return decodeHtml(next)
    .split(/\n{2,}/)
    .map((block) => block.replace(/[ \t]+/g, " ").trim())
    .filter((block) => block && block !== "&nbsp;")
    .join("\n\n")
    .trim();
}

function summarize(title: string, metaSummary: string, content: string) {
  const text = (
    metaSummary || content.replace(/!\[[^\]]*\]\([^)]+\)/g, "").replace(/[#`>*_-]/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
  return (text || title).slice(0, 180);
}

async function extractPost(id: number, rssItems: RssItem[]): Promise<TistoryPost> {
  const sourceUrl = `${BLOG_ORIGIN}/${id}`;
  const pageHtml = await fetchText(sourceUrl);
  const info = extractEntryInfo(pageHtml);
  const rss = rssItems.find((item) => item.link.endsWith(`/${id}`));
  const title = extractMeta(pageHtml, "og:title") || rss?.title || `Tistory ${id}`;
  const category = categoryFor(info.categoryLabel || rss?.categories[0]);
  const publishedAt =
    extractMeta(pageHtml, "article:published_time") ||
    (rss?.pubDate ? new Date(rss.pubDate).toISOString() : new Date().toISOString());
  const updatedAt = extractMeta(pageHtml, "article:modified_time") || publishedAt;
  const contentHtml = rss?.description || extractArticleHtml(pageHtml);
  const slug = `tistory-${info.entryId ?? id}`;
  const images = extractImages(contentHtml, slug);
  const content = htmlToMarkdown(contentHtml, images);
  const tagNames = extractTags(pageHtml);
  const tagSlugs = tagNames.map(slugForTag);
  return {
    entryId: info.entryId ?? id,
    sourceUrl,
    slug,
    title,
    summary: summarize(title, extractMeta(pageHtml, "og:description"), content),
    contentHtml,
    content,
    categoryName: category.name,
    categorySlug: category.slug,
    publishedAt,
    updatedAt,
    tagNames,
    tagSlugs,
    images,
    heroImageKey: images[0]?.targetR2Key ?? null,
  };
}

function categoriesFromPosts(posts: TistoryPost[]): CategoryRecord[] {
  const categories = new Map<string, CategoryRecord>();
  for (const post of posts) {
    if (post.categorySlug.includes("/")) {
      const parentSlug = post.categorySlug.split("/")[0];
      if (parentSlug) {
        categories.set(parentSlug, {
          id: `cat_${parentSlug.replace(/[^a-z0-9]+/g, "_")}`,
          name: categoryFor("개발").name,
          slug: parentSlug,
          parentId: null,
          parentSlug: null,
          depth: 1,
          createdAt: new Date().toISOString(),
        });
      }
    }
    const parentSlug = post.categorySlug.includes("/") ? post.categorySlug.split("/")[0] : null;
    categories.set(post.categorySlug, {
      id: `cat_${post.categorySlug.replace(/[^a-z0-9]+/g, "_")}`,
      name: post.categoryName,
      slug: post.categorySlug,
      parentId: parentSlug ? `cat_${parentSlug.replace(/[^a-z0-9]+/g, "_")}` : null,
      parentSlug,
      depth: parentSlug ? 2 : 1,
      createdAt: new Date().toISOString(),
    });
  }
  return [...categories.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

function tagsFromPosts(posts: TistoryPost[]): TagRecord[] {
  const tags = new Map<string, TagRecord>();
  for (const post of posts) {
    post.tagNames.forEach((name, index) => {
      const slug = post.tagSlugs[index];
      if (slug) tags.set(slug, { id: `tag_${slug.replace(/[^a-z0-9]+/g, "_")}`, name, slug });
    });
  }
  return [...tags.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

function mediaMappingsFromPosts(posts: TistoryPost[]): MediaMappingRecord[] {
  return posts.flatMap((post) =>
    post.images.map((image) => ({
      sourceUrl: image.sourceUrl,
      canonicalPostSlug: post.slug,
      targetR2Key: image.targetR2Key,
      r2Url: image.r2Url,
      kind: image.kind,
      width: image.width,
      height: image.height,
      status: "pending",
      notes: "tistory media",
    })),
  );
}

function postsForImport(posts: TistoryPost[]): PostRecord[] {
  return posts.map((post) => ({
    id: `post_tistory_${post.entryId}`,
    slug: post.slug,
    title: post.title,
    content: post.content,
    summary: post.summary,
    categoryId: null,
    categoryPath: post.categorySlug,
    heroImageKey: post.heroImageKey,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    isPublished: 1,
    viewCount: 0,
    tags: post.tagSlugs,
  }));
}

function mediaRefsFromPosts(posts: TistoryPost[]): MediaReference[] {
  return posts.flatMap((post) =>
    post.images.map((image, index) => ({
      id: `media_tistory_${post.entryId}_${index}`,
      postId: `post_tistory_${post.entryId}`,
      r2Key: image.targetR2Key,
      r2Url: image.r2Url,
      kind: image.kind,
      width: image.width,
      height: image.height,
    })),
  );
}

function writeArtifacts(posts: TistoryPost[], summary: ImportSummary) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(
    resolve(OUTPUT_DIR, "posts.json"),
    `${JSON.stringify(postsForImport(posts), null, 2)}\n`,
  );
  writeFileSync(
    resolve(OUTPUT_DIR, "categories.json"),
    `${JSON.stringify(categoriesFromPosts(posts), null, 2)}\n`,
  );
  writeFileSync(
    resolve(OUTPUT_DIR, "tags.json"),
    `${JSON.stringify(tagsFromPosts(posts), null, 2)}\n`,
  );
  writeFileSync(
    resolve(OUTPUT_DIR, "media-mappings.json"),
    `${JSON.stringify(mediaMappingsFromPosts(posts), null, 2)}\n`,
  );
  writeFileSync(resolve(OUTPUT_DIR, "report.json"), `${JSON.stringify(summary, null, 2)}\n`);
}

function encodeR2Key(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function signingKey(secret: string, date: string) {
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, "auto");
  const kService = hmac(kRegion, "s3");
  return hmac(kService, "aws4_request");
}

async function uploadToR2(key: string, body: ArrayBuffer, contentType: string) {
  const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("R2 credentials are not configured");
  }

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = amzDate.slice(0, 8);
  const payload = Buffer.from(body);
  const payloadHash = createHash("sha256").update(payload).digest("hex");
  const canonicalUri = `/${bucket}/${encodeR2Key(key)}`;
  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
  ].join("\n");
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    `${canonicalHeaders}\n`,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const credentialScope = `${date}/auto/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");
  const signature = createHmac("sha256", signingKey(secretAccessKey, date))
    .update(stringToSign)
    .digest("hex");
  const response = await fetch(`https://${host}${canonicalUri}`, {
    method: "PUT",
    headers: {
      authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      "content-type": contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
    body: payload,
  });
  if (!response.ok) throw new Error(`R2 PUT failed: ${response.status} ${await response.text()}`);
}

async function uploadMedia(mappings: MediaMappingRecord[]) {
  let uploaded = 0;
  for (const mapping of mappings) {
    const response = await fetch(mapping.sourceUrl);
    if (!response.ok)
      throw new Error(`media fetch failed ${response.status}: ${mapping.sourceUrl}`);
    await uploadToR2(
      mapping.targetR2Key,
      await response.arrayBuffer(),
      response.headers.get("content-type") ?? "application/octet-stream",
    );
    uploaded += 1;
  }
  return uploaded;
}

async function importToD1(posts: TistoryPost[]) {
  const adapter = createD1R2ContentAdapter();
  let importedPosts = 0;

  for (const category of categoriesFromPosts(posts)) {
    const result = await adapter.createCategory({ category, authorIdentity: AUTHOR });
    if (!result.ok) throw new Error(`category import failed: ${result.error.message}`);
  }
  for (const tag of tagsFromPosts(posts)) {
    const result = await adapter.createTag({ tag, authorIdentity: AUTHOR });
    if (!result.ok) throw new Error(`tag import failed: ${result.error.message}`);
  }
  for (const post of postsForImport(posts)) {
    const result = await adapter.createPost({ post, authorIdentity: AUTHOR });
    if (!result.ok) throw new Error(`post import failed (${post.slug}): ${result.error.message}`);
    importedPosts += 1;
  }
  for (const mediaRef of mediaRefsFromPosts(posts)) {
    const result = await adapter.upsertMediaRef({ mediaRef, authorIdentity: AUTHOR });
    if (!result.ok)
      throw new Error(`media ref import failed (${mediaRef.id}): ${result.error.message}`);
  }

  return importedPosts;
}

async function main() {
  const dryRun = !hasFlag("--commit");
  const shouldUploadMedia = hasFlag("--upload-media");
  const maxPages = Number(getArg("--max-pages") ?? "20");
  const warnings: string[] = [];
  const { ids, rssItems } = await discoverPostIds(maxPages);
  const limit = Number(getArg("--limit") ?? ids.length);
  const targetIds = ids.slice(0, Number.isFinite(limit) ? limit : ids.length);
  const posts: TistoryPost[] = [];

  for (const id of targetIds) {
    const post = await extractPost(id, rssItems);
    if (!post.content) warnings.push(`${post.sourceUrl}: content is empty`);
    posts.push(post);
  }

  let uploadedMedia = 0;
  if (!dryRun && shouldUploadMedia) {
    uploadedMedia = await uploadMedia(mediaMappingsFromPosts(posts));
  }

  const importedPosts = dryRun ? 0 : await importToD1(posts);
  const summary: ImportSummary = {
    discovered: ids.length,
    extracted: posts.length,
    categories: categoriesFromPosts(posts).length,
    tags: tagsFromPosts(posts).length,
    media: mediaMappingsFromPosts(posts).length,
    importedPosts,
    uploadedMedia,
    dryRun,
    warnings,
  };
  writeArtifacts(posts, summary);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exit(1);
});
