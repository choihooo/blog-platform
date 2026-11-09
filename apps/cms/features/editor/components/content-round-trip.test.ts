import {
  editorNodesToTiptap,
  htmlToEditorNodes,
  tiptapToEditorNodes,
} from "@blog-platform/core/content";
import { Editor } from "@tiptap/react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import { contentExtensions } from "../hooks/content-extensions";

it("preserves tables, partial marks, nested lists and image captions through the real editor schema", () => {
  const nodes = htmlToEditorNodes(
    '<p>Plain <strong>bold</strong> and <a href="https://example.com">link</a></p><ol start="3"><li>First<ul><li>Nested</li></ul></li><li>Second</li></ol><table><tr><th>Heading</th></tr><tr><td>Cell</td></tr></table><figure><img src="/media/a.webp" alt="Alt"><figcaption><em>Caption</em></figcaption></figure>',
  );
  const editor = new Editor({ extensions: contentExtensions, content: editorNodesToTiptap(nodes) });
  try {
    const stored = tiptapToEditorNodes(editor.getJSON());
    expect(stored).toEqual(nodes);
    editor.commands.setContent(editorNodesToTiptap(stored));
    expect(tiptapToEditorNodes(editor.getJSON())).toEqual(nodes);
  } finally {
    editor.destroy();
  }
});

const manifestPath = process.env.CONTENT_RECOVERY_MANIFEST;
it("preserves linked images and rich captions through HTML copy and paste without duplicate paragraphs", () => {
  const nodes = htmlToEditorNodes(
    '<figure><a href="https://example.com"><img src="/media/a.webp" alt="Alt"></a><figcaption><strong>Bold</strong> caption</figcaption></figure>',
  );
  const editor = new Editor({ extensions: contentExtensions, content: editorNodesToTiptap(nodes) });
  try {
    const html = editor.getHTML();
    editor.commands.setContent(html);
    expect(tiptapToEditorNodes(editor.getJSON())).toEqual(nodes);
  } finally {
    editor.destroy();
  }
});
it.skipIf(!manifestPath || !existsSync(manifestPath))(
  "preserves every proposed recovered article through the real editor",
  () => {
    const manifest = JSON.parse(readFileSync(resolve(manifestPath!), "utf8")) as {
      entries: { slug: string; after: string }[];
    };
    for (const entry of manifest.entries) {
      const nodes = JSON.parse(entry.after).nodes;
      const editor = new Editor({
        extensions: contentExtensions,
        content: editorNodesToTiptap(nodes),
      });
      try {
        expect(tiptapToEditorNodes(editor.getJSON()), entry.slug).toEqual(nodes);
      } finally {
        editor.destroy();
      }
    }
  },
);
