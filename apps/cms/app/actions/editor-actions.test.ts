import { describe, expect, it } from "vitest";

import {
  archivePostAction,
  publishPostAction,
  retryPublicRefreshAction,
  saveEditorDraftAction,
  unpublishPostAction,
  uploadEditorMediaAction,
} from "./editor-actions";

describe("editor actions", () => {
  it("exports the save action", () => {
    expect(typeof saveEditorDraftAction).toBe("function");
    expect(typeof uploadEditorMediaAction).toBe("function");
    expect(typeof publishPostAction).toBe("function");
    expect(typeof unpublishPostAction).toBe("function");
    expect(typeof archivePostAction).toBe("function");
    expect(typeof retryPublicRefreshAction).toBe("function");
  });
});
