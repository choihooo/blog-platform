import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { createEmptyEditorDocument } from "@blog-platform/core/content";

import { EditorScreen } from "./editor-screen";

vi.mock("../../app/actions/editor-actions", () => ({
  saveEditorDraftAction: vi.fn(),
}));

describe("EditorScreen", () => {
  it("renders title, body, toolbar, status, frontmatter, and preview", () => {
    const doc = createEmptyEditorDocument();
    doc.frontmatter.title = "Hello";
    doc.frontmatter.status = "published";
    doc.frontmatter.slug = "hello";
    doc.body = [{ type: "heading", depth: 2, text: "Intro" }];
    render(
      createElement(EditorScreen, {
        initialDocument: doc,
        siteAnalytics: {
          siteUrl: "https://example.com",
          analytics: {
            provider: "ga4",
            ga4PropertyId: "123",
            searchConsoleProperty: "sc-domain:example.com",
          },
        },
      }),
    );
    expect(screen.getByRole("heading", { name: "Editor" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Post body" }).tagName).not.toBe("TEXTAREA");
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
    expect(screen.getByLabelText("Title")).toBeTruthy();
    expect(screen.getAllByText(/headings/).length).toBeGreaterThan(0);
    expect(screen.getByText("Open public post")).toBeTruthy();
    expect(screen.getByText("Open GA4")).toBeTruthy();
    expect(screen.getByText("Open Search Console")).toBeTruthy();
  });
});
