import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { testEditorCommands } from "../../../test-utils/editor-commands";

import { EditorToolbar } from "./editor-toolbar";

afterEach(cleanup);

describe("EditorToolbar publish controls", () => {
  it("renders save and publication controls", () => {
    const onPublish = vi.fn();
    render(
      createElement(EditorToolbar, {
        upload: testEditorCommands.upload,
        postSlug: "hello-world",
        onSave: vi.fn(),
        onPublish,
        onUnpublish: vi.fn(),
        onArchive: vi.fn(),
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    expect(onPublish).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Unpublish" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Archive" })).toBeTruthy();
  });

  it("disables publish controls while pending or invalid", () => {
    render(
      createElement(EditorToolbar, {
        upload: testEditorCommands.upload,
        postSlug: "hello-world",
        onPublish: vi.fn(),
        publishDisabled: true,
      }),
    );
    expect(screen.getByRole("button", { name: "Publish" })).toHaveProperty("disabled", true);
  });
});
