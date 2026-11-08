import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import {
  htmlToEditorNodes,
  isSafeContentUrl,
  parseInlineMarkdown,
  type EditorInline,
} from "@blog-platform/core/content";

const CaptionImage = Image.extend({
  parseHTML() {
    return [
      {
        tag: "figure",
        getAttrs: (element) => {
          if (element.querySelectorAll("img").length !== 1) return false;
          const image = htmlToEditorNodes(element.outerHTML).find((node) => node.type === "image");
          return image?.type === "image" ? { ...image } : false;
        },
      },
      ...(this.parent?.() ?? []),
    ];
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        rendered: false,
        parseHTML: (element: HTMLElement) =>
          element.closest("figure")?.querySelector("figcaption")?.textContent ?? null,
      },
      captionContent: {
        default: null,
        rendered: false,
        parseHTML: (element: HTMLElement) => {
          const figure = element.closest("figure");
          const image = figure
            ? htmlToEditorNodes(figure.outerHTML).find((node) => node.type === "image")
            : undefined;
          return image?.type === "image" ? (image.captionContent ?? null) : null;
        },
      },
      href: {
        default: null,
        rendered: false,
        parseHTML: (element: HTMLElement) =>
          element.closest("a")?.getAttribute("href") ??
          element.querySelector("a")?.getAttribute("href") ??
          null,
      },
    };
  },
  renderHTML({ HTMLAttributes, node }) {
    const img = document.createElement("img");
    for (const key of ["src", "alt", "title", "width", "height"])
      if (HTMLAttributes[key] != null) img.setAttribute(key, String(HTMLAttributes[key]));
    let media: HTMLElement = img;
    if (node.attrs.href && isSafeContentUrl(String(node.attrs.href))) {
      const link = document.createElement("a");
      link.setAttribute("href", String(node.attrs.href));
      link.append(img);
      media = link;
    }
    if (!node.attrs.caption) return media;
    const figure = document.createElement("figure"),
      caption = document.createElement("figcaption");
    figure.append(media, caption);
    const runs: EditorInline[] =
      node.attrs.captionContent ?? parseInlineMarkdown(String(node.attrs.caption));
    for (const run of runs) {
      const span = document.createElement("span");
      run.text.split("\n").forEach((part, i) => {
        if (i) span.append(document.createElement("br"));
        span.append(document.createTextNode(part));
      });
      let child: Node = span;
      for (const mark of run.marks ?? []) {
        if (mark === "link") continue;
        const el = document.createElement(
          mark === "bold" ? "strong" : mark === "italic" ? "em" : "code",
        );
        el.append(child);
        child = el;
      }
      if (run.href && isSafeContentUrl(run.href)) {
        const link = document.createElement("a");
        link.href = run.href;
        link.append(child);
        child = link;
      }
      caption.append(child);
    }
    return figure;
  },
});

export const contentExtensions = [
  StarterKit.configure({ link: false, strike: false, underline: false }),
  Link.configure({ openOnClick: false }),
  CaptionImage.configure({ allowBase64: false }),
  TableKit.configure({ table: { resizable: false } }),
];
