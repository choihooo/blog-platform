import {
  htmlToEditorNodes,
  serializePostContent,
  validateEditorDocument,
  createEmptyEditorDocument,
} from "../../packages/editor/src/index";

export function buildRecoveredContent(input: {
  html: string;
  mapImage: (src: string) => string | undefined;
}) {
  const nodes = htmlToEditorNodes(input.html, {
    rootClass: "tt_article_useless_p_margin",
    mapImage: (src) => {
      const mapped = input.mapImage(src);
      if (!mapped) throw new Error("Missing source image mapping");
      return mapped;
    },
  });
  const doc = createEmptyEditorDocument();
  doc.frontmatter.title = "Recovery validation";
  doc.body = nodes;
  const issues = validateEditorDocument(doc);
  if (issues.length)
    throw new Error(
      "Recovered content did not pass validation: " + issues.map((i) => i.code).join(","),
    );
  if (!nodes.length) throw new Error("Empty recovered article");
  return serializePostContent({ version: 1, nodes });
}
export function assertRecoveryState(current: string, before: string, after: string) {
  if (current === after) return "already-applied";
  if (current !== before) throw new Error("Content changed since recovery snapshot");
  return "apply";
}
export function contentUpdateStatement(entry: {
  id: string;
  slug: string;
  before: string;
  after: string;
  updatedAt: string;
}) {
  return {
    sql: "UPDATE posts SET content = ? WHERE id = ? AND slug = ? AND content = ? AND updated_at = ? AND is_published = 1",
    params: [entry.after, entry.id, entry.slug, entry.before, entry.updatedAt],
  };
}

/** Kakaocdn rotates signed URL tokens; the first two asset directories are stable. */
export function sourceImageIdentity(src: string) {
  const url = new URL(src, "https://hochoi.tistory.com");
  if (url.hostname === "blog.kakaocdn.net") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "dn" || parts[0] === "dna")
      return url.hostname + "/" + parts[1] + "/" + parts[2] + "/" + parts.at(-1);
  }
  return url.origin + url.pathname;
}
