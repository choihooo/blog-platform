const element = (tagName, properties, children) => ({ type: "element", tagName, properties, children });
const text = (value) => ({ type: "text", value });
const headingText = (node) => node.type === "text" ? node.value : (node.children ?? []).map(headingText).join("");

// Operates on compiled Markdown only; React demo internals never enter this tree.
export function enhanceArticle(tree) {
  const headings = [];
  const occupied = new Set();
  function visit(node, inDemo = false) {
    const classes = node.properties?.className ?? [];
    const excluded = inDemo || classes.includes("not-prose");
    if (!excluded && node.type === "element" && /^h[23]$/.test(node.tagName)) {
      headings.push(node);
    } else if (node.properties?.id) {
      occupied.add(String(node.properties.id));
    }
    for (const child of node.children ?? []) visit(child, excluded);
  }
  visit(tree);

  for (const node of headings) {
    const title = headingText(node).trim();
    const slug = title.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, "").trim().replace(/\s+/g, "-") || "section";
    const base = String(node.properties.id || slug);
    let id = base;
    for (let suffix = 1; occupied.has(id); suffix++) id = `${base}-${suffix}`;
    occupied.add(id);
    node.properties.id = id;
  }

  if (headings.length < 2) return;
  const items = headings.map(node => element("li", {
    className: node.tagName === "h3" ? ["article-toc-subitem"] : [],
  }, [element("a", { href: `#${encodeURIComponent(node.properties.id)}` }, [text(headingText(node).trim())])]));
  const nav = element("nav", { className: ["not-prose", "article-toc"], ariaLabel: "글 목차" }, [
    element("details", {}, [
      element("summary", {}, [text("목차")]),
      element("ol", {}, items),
    ]),
  ]);
  const header = tree.children.findIndex(node => node.type === "mdxJsxFlowElement" && node.name === "PostHeader");
  tree.children.splice(header >= 0 ? header + 1 : 0, 0, nav);
}

export default function articleTools() {
  return enhanceArticle;
}
