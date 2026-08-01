import { loadDraftPreview, previewCacheControl } from "../../../lib/preview";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMarkdown(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function markdownToHtml(source: string): string {
  return source
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
      if (heading?.[1] && heading[2]) {
        const level = Math.min(heading[1].length, 3);
        return `<h${level}>${inlineMarkdown(heading[2])}</h${level}>`;
      }
      if (/^```/.test(trimmed)) {
        const code = trimmed.replace(/^```[^\n]*\n?/, "").replace(/\n?```$/, "");
        return `<pre><code>${escapeHtml(code)}</code></pre>`;
      }
      if (trimmed.startsWith("- ")) {
        const items = trimmed
          .split("\n")
          .filter((line) => line.startsWith("- "))
          .map((line) => `<li>${inlineMarkdown(line.slice(2))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        const items = trimmed
          .split("\n")
          .filter((line) => /^\d+\.\s+/.test(line))
          .map((line) => `<li>${inlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</li>`)
          .join("");
        return `<ol>${items}</ol>`;
      }
      if (trimmed.startsWith("> ")) {
        return `<blockquote>${inlineMarkdown(trimmed.slice(2))}</blockquote>`;
      }
      return `<p>${inlineMarkdown(trimmed).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const result = await loadDraftPreview({ slug, token });
  const headers = {
    "cache-control": previewCacheControl(),
    "content-type": "text/html; charset=utf-8",
  };

  if (!result.ok) {
    return new Response("<h1>Preview unavailable</h1>", { status: 404, headers });
  }

  return new Response(
    `<!doctype html><html><head><title>${escapeHtml(result.post.title)}</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css"><style>
      body{margin:0;background:#fbfbf7;color:#17211b;font-family:"SUIT Variable",SUIT,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      main{max-width:880px;margin:0 auto;padding:48px 24px 72px}
      h1{font-size:52px;line-height:1.05;margin:0 0 32px;font-weight:700}
      article{color:#213029;font-size:18px;line-height:1.85}
      article h1,article h2,article h3{margin:34px 0 12px;color:#17211b;font-weight:700;line-height:1.2}
      article h1{font-size:36px} article h2{font-size:28px} article h3{font-size:22px}
      article p{margin:0 0 18px} article pre{overflow-x:auto;border-radius:8px;padding:16px;background:#17211b;color:#f5f5ef}
      article blockquote{border-left:4px solid #d9ded2;margin:24px 0;padding-left:16px;color:#607067}
      article ul,article ol{padding-left:24px}
    </style></head><body><main><h1>${escapeHtml(result.post.title)}</h1><article>${markdownToHtml(
      result.post.body,
    )}</article></main></body></html>`,
    { headers },
  );
}
