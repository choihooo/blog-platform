import * as actions from "../app/actions/editor-actions";
import type { EditorCommands } from "../features/editor/model/commands";
export const testEditorCommands: EditorCommands = {
  save: (...args) => actions.saveEditorDraftAction(...args),
  publish: (...args) => actions.publishPostAction(...args),
  unpublish: (...args) => actions.unpublishPostAction(...args),
  archive: (...args) => actions.archivePostAction(...args),
  retry: (...args) => actions.retryPublicRefreshAction(...args),
  upload: (...args) => actions.uploadEditorMediaAction(...args),
  preview: (...args) => actions.createPreviewTokenAction(...args),
};
