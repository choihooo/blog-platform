import { createEmptyEditorDocument } from "@blog-platform/core/content";
import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";
import { useEditorSession } from "./use-editor-session";
it("keeps the latest dirty document and body together", () => {
  const document = createEmptyEditorDocument();
  const { result } = renderHook(() => useEditorSession(document));
  act(() =>
    result.current.markDirty(
      { ...document, frontmatter: { ...document.frontmatter, title: "Changed" } },
      [{ type: "paragraph", text: "New body" }],
    ),
  );
  expect(result.current.document.frontmatter.title).toBe("Changed");
  expect(result.current.documentRef.current.body).toEqual([
    { type: "paragraph", text: "New body" },
  ]);
  expect(result.current.status).toBe("dirty");
});
