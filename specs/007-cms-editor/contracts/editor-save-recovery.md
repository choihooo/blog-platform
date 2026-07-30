# Contract: Editor Save & Recovery

## Purpose

CMS editor 저장, 충돌, 실패, 임시 복구 상태가 기존 auth guard와 content adapter contract를 일관되게
사용하도록 정의한다.

## Save Draft

```ts
type SaveEditorDraftInput = {
  document: EditorDocument;
  expectedSha?: string;
};

type SaveEditorDraftResult =
  | {
      ok: true;
      path: string;
      sha: string;
      commitId?: string;
      backupCleared: true;
    }
  | {
      ok: false;
      code:
        | "validation-failure"
        | "unsupported-mdx"
        | "auth-required"
        | "forbidden"
        | "session-expired"
        | "stale-file"
        | "temporary-connectivity"
        | "unknown";
      retryable: boolean;
      message: string;
      submittedDocument: EditorDocument;
      submittedSource?: string;
    };
```

## Required Save Behavior

- New draft save uses content adapter `createFile` with intent `create-draft`.
- Existing draft save uses content adapter `updateFile` with intent `save-draft` and required
  `expectedSha`.
- Every save operation must pass through the existing mutation guard before repository mutation.
- A stale SHA result must not overwrite repository content.
- Failed save results must keep the submitted editor document available for UI recovery.
- Successful save clears the matching local backup.

## Backup Contract

```ts
type DraftBackupRecord = {
  backupKey: string;
  document: EditorDocument;
  sourceSha?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};
```

## Required Backup Behavior

- Dirty editor documents are persisted to local backup under a stable post or temporary draft key.
- Backup TTL is 30 days from the last update.
- Expired backup records are ignored and may be removed.
- When opening a post with a newer local backup than the loaded repository document, CMS prompts the
  operator to restore or discard.
- Repository content remains canonical; backup restore requires an explicit operator action before
  it replaces the current editor view.

## Failure Mapping

| Source failure               | Editor result code       | Retryable | Repository change |
| ---------------------------- | ------------------------ | --------- | ----------------- |
| Empty title/invalid format   | `validation-failure`     | No        | blocked           |
| Unsupported or unsafe MDX    | `unsupported-mdx`        | No        | blocked           |
| No session                   | `auth-required`          | Yes       | blocked           |
| Session expired              | `session-expired`        | Yes       | blocked           |
| Non-admin session            | `forbidden`              | No        | blocked           |
| Stale expected SHA           | `stale-file`             | No        | blocked           |
| Temporary connectivity issue | `temporary-connectivity` | Yes       | blocked           |
| Unknown adapter failure      | `unknown`                | Depends   | blocked or failed |
