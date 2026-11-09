import type { EditorCommands } from "../../features/editor/model/commands";
import {
  archivePostAction,
  createPreviewTokenAction,
  publishPostAction,
  retryPublicRefreshAction,
  saveEditorDraftAction,
  unpublishPostAction,
  uploadEditorMediaAction,
} from "./editor-actions";
export const editorCommands: EditorCommands = {
  save: saveEditorDraftAction,
  publish: publishPostAction,
  unpublish: unpublishPostAction,
  archive: archivePostAction,
  retry: retryPublicRefreshAction,
  upload: uploadEditorMediaAction,
  preview: createPreviewTokenAction,
};
