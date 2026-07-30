# Contract: CMS Publish Actions

## Purpose

CMS editor와 posts 화면에서 Save, Publish, Unpublish, Archive, public refresh retry를 실행할 때
사용하는 server action contract다. 호출자는 local adapter와 GitHub adapter의 차이를 알지 않고,
결과의 repository 변경 상태와 public refresh 상태를 분리해서 표시한다.

## Actions

### `saveEditorDraftAction`

작성 중인 editor document를 repository에 저장한다.

**Input**:

```ts
type SaveEditorDraftInput = EditorDocument;
```

**Success**:

```ts
type SaveEditorDraftSuccess = {
  ok: true;
  operation: "save-draft";
  path: string;
  sha: string;
  commitId?: string;
  publicRefresh: "not-required";
  backupCleared: true;
};
```

**Failure**:

```ts
type SaveEditorDraftFailure = {
  ok: false;
  operation: "save-draft";
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

### `publishPostAction`

editor document를 공개 상태로 전환하고 public refresh를 요청한다.

**Input**:

```ts
type PublishPostInput = {
  document: EditorDocument;
  nowIso?: string;
};
```

**Success**:

```ts
type PublishPostSuccess = {
  ok: true;
  operation: "publish";
  path: string;
  sha: string;
  commitId?: string;
  slug: string;
  publishedAt: string;
  repository: { ok: true; summary: string };
  publicRefresh: PublicRefreshResult;
  backupCleared: true;
};
```

**Partial Success**:

```ts
type PublishPostPartialSuccess = {
  ok: false;
  operation: "publish";
  code: "public-refresh-failed";
  retryable: true;
  message: string;
  path: string;
  sha: string;
  commitId?: string;
  slug: string;
  publishedAt: string;
  repository: { ok: true; summary: string };
  publicRefresh: PublicRefreshResult & { ok: false };
  retryToken: PublicRefreshRetryToken;
};
```

**Failure**:

```ts
type PublishPostFailure = {
  ok: false;
  operation: "publish";
  code:
    | "validation-failure"
    | "duplicate-slug"
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

### `unpublishPostAction`

발행된 글을 초안 상태로 되돌리고 public refresh를 요청한다.

**Input**:

```ts
type UnpublishPostInput = {
  document: EditorDocument;
};
```

**Success/Partial Success/Failure**: `publishPostAction`과 같은 result family를 사용하되
`operation`은 `"unpublish"`이고 `publishedAt`은 기존 값을 보존할 수 있다.

### `archivePostAction`

글을 보관 상태로 전환하고 public refresh를 요청한다.

**Input**:

```ts
type ArchivePostInput = {
  document: EditorDocument;
};
```

**Success/Partial Success/Failure**: `publishPostAction`과 같은 result family를 사용하되
`operation`은 `"archive"`이다.

### `retryPublicRefreshAction`

repository 변경은 성공했지만 public refresh가 실패한 작업의 공개 반영만 재시도한다.

**Input**:

```ts
type RetryPublicRefreshInput = {
  retryToken: PublicRefreshRetryToken;
};
```

**Success**:

```ts
type RetryPublicRefreshSuccess = {
  ok: true;
  operation: "retry-public-refresh";
  publicRefresh: PublicRefreshResult & { ok: true };
};
```

**Failure**:

```ts
type RetryPublicRefreshFailure = {
  ok: false;
  operation: "retry-public-refresh";
  code: "auth-required" | "forbidden" | "session-expired" | "public-refresh-failed" | "unknown";
  retryable: boolean;
  message: string;
  publicRefresh?: PublicRefreshResult & { ok: false };
};
```

## Auth Rules

- 모든 action은 기존 CMS 관리자 guard를 통과해야 한다.
- 인증 실패, 세션 만료, 관리자 identity 불일치에서는 repository 변경과 public refresh를 실행하지
  않는다.
- `retryPublicRefreshAction`도 관리자 guard를 통과해야 한다.

## Repository Rules

- Create와 update는 기존 content adapter의 allowed path boundary를 따른다.
- Existing file update는 `expectedSha`가 필요하다.
- Publish는 `prepare-publish`, Unpublish는 `prepare-unpublish`, Archive는 `prepare-archive` intent를
  사용한다.
- Save draft는 public refresh를 실행하지 않는다.

## UI Result Rules

- `public-refresh-failed`는 repository 변경 성공을 명확히 표시해야 한다.
- retry 가능한 실패는 Retry 동작을 노출할 수 있다.
- 실패 결과는 `submittedDocument` 또는 `submittedSource`를 포함해 로컬 draft recovery와 충돌 해결에
  사용할 수 있어야 한다.
