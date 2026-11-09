import { createEmptyEditorDocument } from "@blog-platform/core/content";
import { createEvent, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { testEditorCommands } from "../../../test-utils/editor-commands";
import { EditorScreen } from "./editor-screen";

vi.mock("../../../app/actions/editor-actions", () => ({ saveEditorDraftAction: vi.fn() }));
it("pastes Markdown as a real table and preserves multiline JSX code", async () => {
  Object.defineProperty(Range.prototype, "getClientRects", { configurable: true, value: () => [] });
  Object.defineProperty(Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }),
  });
  const doc = createEmptyEditorDocument();
  doc.frontmatter.title = "Paste";
  render(<EditorScreen commands={testEditorCommands} initialDocument={doc} />);
  const surface = screen.getByRole("textbox", { name: "Post body" });
  const paste = createEvent.paste(surface);
  Object.defineProperty(paste, "clipboardData", {
    value: {
      files: [],
      items: [],
      getData: (type: string) =>
        type === "text/plain"
          ? "| A | B |\n| --- | --- |\n| one | two |\n\n```tsx\nfunction App<T>() {\n\n  return <App />;\n}\n```"
          : "",
    },
  });
  fireEvent(surface, paste);
  await waitFor(() => expect(surface.querySelector("table")?.textContent).toContain("one"));
  expect(surface.querySelector("pre code")?.textContent).toBe(
    "function App<T>() {\n\n  return <App />;\n}",
  );
});
