# Data Model: GitHub Content Adapter

## RepositoryContentFile

Repository에 저장된 CMS 편집 대상 파일이다.

**Fields**:

- `path`: repository-relative path. 승인된 content/media 경로 안에 있어야 한다.
- `kind`: `post`, `author`, `site-config`, `category-config`, `tag-config`, `media`.
- `content`: text file body for content files, binary-safe payload reference for media files.
- `encoding`: `utf8` for text content, `base64` for media payloads when remote writes require it.
- `sha`: current file change identifier for existing files.
- `sizeBytes`: file size used for media and safety validation.
- `updatedAt`: repository-reported or local filesystem modification timestamp when available.

**Validation rules**:

- Existing file update/delete requires `sha`.
- `path` must normalize under `content/` or `public/media/`; path traversal is invalid.
- Text content files must remain parseable by the relevant content validation flow.
- Media files must stay inside approved media paths; later Media Upload phase adds conversion UX.

## ContentChangeRequest

CMS가 repository에 적용하려는 단일 변경 요청이다.

**Fields**:

- `intent`: `create-draft`, `save-draft`, `prepare-publish`, `prepare-unpublish`, `prepare-archive`,
  `update-site-config`, `save-media`, `delete-file`.
- `path`: target repository path.
- `content`: submitted content or media payload.
- `expectedSha`: last-read SHA for updates/deletes.
- `summary`: human-readable repository history summary.
- `submittedAt`: CMS submission time.

**Validation rules**:

- Update/delete intents require `expectedSha`.
- Create intents must fail when the target path already exists.
- Summary must identify the operator-visible purpose of the change.
- Request payload must be returned to CMS unchanged when the write fails.

## ContentChangeResult

성공한 repository 변경 결과다.

**Fields**:

- `path`: changed path.
- `sha`: latest file change identifier after the operation.
- `commitId`: repository commit identifier when provided by the backing adapter.
- `summary`: human-readable change summary.
- `status`: `created`, `updated`, or `deleted`.

**Validation rules**:

- Create/update results must include a latest `sha`.
- Delete results must include enough repository commit information for CMS confirmation.

## ContentConflict

CMS가 마지막으로 읽은 파일 이후 repository 파일이 먼저 바뀌어 write가 거부된 상태다.

**Fields**:

- `path`: conflicted file path.
- `expectedSha`: SHA supplied by CMS.
- `actualSha`: latest known SHA when available.
- `submittedContent`: operator's unsaved content.
- `resolution`: `reload-required` for MVP.

**Validation rules**:

- Conflict must not overwrite existing repository content.
- Conflict response must preserve submitted content for retry, copy, or manual merge.

## RepositoryFailureState

Repository 작업 실패를 CMS UI가 처리할 수 있게 정규화한 상태다.

**Fields**:

- `code`: `unauthorized`, `missing-file`, `duplicate-file`, `stale-file`, `rate-limit`,
  `validation-failure`, `temporary-connectivity`, or `unknown`.
- `message`: operator-facing short message.
- `retryable`: whether retry may succeed without changing content.
- `path`: affected path when known.
- `submittedContent`: failed write payload when applicable.

**Validation rules**:

- Write failures must preserve submitted content.
- Stale writes must map to `stale-file`, not `unknown`.
- Authentication/permission failures must not be retried silently.

## State Transitions

```text
read existing file -> editable file with sha
editable file with sha -> update request with expectedSha -> updated file with new sha
editable file with stale sha -> update request -> content conflict
new draft input -> create request -> created draft with sha
new draft input for existing path -> create request -> duplicate-file failure
submitted write -> repository failure -> preserved submitted content
```
