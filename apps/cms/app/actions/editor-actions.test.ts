import { describe, expect, it } from "vitest";

import { saveEditorDraftAction, uploadEditorMediaAction } from "./editor-actions";

describe("editor actions", () => {
  it("exports the save action", () => {
    expect(typeof saveEditorDraftAction).toBe("function");
    expect(typeof uploadEditorMediaAction).toBe("function");
  });
});
