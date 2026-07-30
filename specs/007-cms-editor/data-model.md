# Data Model: CMS Editor

## Entity: EditorDocument

운영자가 CMS에서 편집하는 현재 글 상태다.

**Fields**:

- `id`: 새 초안의 임시 id 또는 기존 글의 repository path 기반 id
- `path`: 기존 글의 repository-relative path, 새 초안이면 저장 전까지 없음
- `sourceSha`: 마지막으로 읽은 repository file SHA, 새 초안이면 없음
- `status`: `draft` | `published` | `archived`
- `frontmatter`: `EditorFrontmatter`
- `body`: `EditorNode[]`
- `dirty`: 마지막 load/save 이후 변경 여부
- `lastLoadedAt`: 편집 문서를 만든 시각
- `lastSavedAt`: 마지막 성공 저장 시각, 저장 전이면 없음

**Validation Rules**:

- `title`은 저장 시 비어 있을 수 없다.
- `published` 글은 기존 content model의 published 필수값을 계속 만족해야 한다.
- 새 초안은 slug 없이 임시 id로 편집 가능하지만 repository 저장 path 생성 전에는 publish 상태가 될
  수 없다.
- `body`는 지원되는 editor node와 mark만 포함해야 한다.

**Relationships**:

- `EditorDocument`는 하나의 `MdxContent`에서 load되거나 하나의 `MdxContent`로 serialize된다.
- `EditorDocument`는 0개 또는 1개의 `DraftBackup`과 연결된다.
- 기존 글의 `EditorDocument`는 하나의 `RepositoryFileRef`를 가진다.

## Entity: EditorFrontmatter

Editor가 직접 표시하고 수정할 수 있는 글 metadata subset이다.

**Fields**:

- `title`: 글 제목
- `slug`: 공개 slug, 초안에서는 없을 수 있음
- `status`: 글 상태
- `author`: 작성자 id
- `publishedAt`: published 글의 발행일
- `updatedAt`: 마지막 수정일
- `excerpt`: 요약
- `coverImage`: 기존 public path 기반 cover image
- `category`: category slug
- `tags`: tag slug 목록

**Validation Rules**:

- `status`는 content model에서 허용한 상태만 가능하다.
- `title`은 저장 가능한 초안의 필수 입력이다.
- `coverImage`와 본문 image reference는 `public/media`에서 접근 가능한 path만 저장 가능한 대상으로
  본다.
- 새 미디어 업로드, image 변환, 미사용 파일 정리는 이 model의 책임이 아니다.

## Entity: EditorNode

MVP editor가 안전하게 round-trip 가능한 본문 block 및 inline 구조다.

**Supported Blocks**:

- `paragraph`
- `heading`
- `bulletList`
- `orderedList`
- `listItem`
- `blockquote`
- `horizontalRule`
- `codeBlock`
- `image`

**Supported Marks**:

- `bold`
- `italic`
- `link`
- `inlineCode`

**Validation Rules**:

- heading depth는 공개 blog TOC 정책과 호환되는 범위 안에 있어야 한다.
- link URL은 unsafe scheme을 사용할 수 없다.
- image src는 blob URL, data URL, 외부 script성 URL을 저장 결과에 남기지 않는다.
- code block은 language가 없어도 fallback으로 보존 가능해야 한다.
- import/export, arbitrary JSX, unsafe HTML, event handler, runtime expression은
  `UnsupportedMdxState` 로 처리한다.

## Entity: MdxContent

Repository에 저장되는 canonical content representation이다.

**Fields**:

- `path`: `content/posts/*.mdx` repository-relative path
- `frontmatter`: serialized frontmatter
- `body`: MDX body
- `sha`: repository file SHA

**Validation Rules**:

- path는 content adapter의 post path boundary를 통과해야 한다.
- body는 markdown package의 MDX syntax/safety validation을 통과해야 한다.
- 저장 시 expected SHA가 있으면 repository의 최신 SHA와 일치해야 한다.

## Entity: DraftBackup

저장 전 손실 방지를 위한 로컬 임시 복구 상태다.

**Fields**:

- `backupKey`: `post:<slug-or-path>` 또는 `draft:<temporary-id>`
- `document`: `EditorDocument`
- `sourceSha`: 백업 생성 당시 원본 SHA
- `createdAt`: 최초 생성 시각
- `updatedAt`: 마지막 갱신 시각
- `expiresAt`: `updatedAt` 기준 30일 후

**Validation Rules**:

- 만료된 backup은 복구 후보로 표시하지 않는다.
- 성공 저장 후 같은 글의 backup은 정리되어야 한다.
- backup은 repository 원본보다 우선권을 갖지 않으며, 복구 전 운영자 확인을 요구한다.

## Entity: SaveAttempt

운영자가 현재 편집 문서를 repository에 저장하려는 요청이다.

**Fields**:

- `document`: 저장할 `EditorDocument`
- `intent`: `create-draft` | `save-draft`
- `expectedSha`: 기존 글 저장 시 마지막 read SHA
- `submittedContent`: serialize된 MDX content

**Validation Rules**:

- 모든 save attempt는 CMS mutation guard를 통과해야 한다.
- 기존 글 update는 expected SHA를 요구한다.
- 저장 실패 결과는 운영자의 submitted content를 보존해야 한다.

## Entity: EditorFailureState

Editor가 운영자에게 구분해서 보여줘야 하는 실패 상태다.

**Types**:

- `unsupported-mdx`
- `validation-failure`
- `auth-required`
- `forbidden`
- `session-expired`
- `stale-file`
- `temporary-connectivity`
- `unknown`

**Validation Rules**:

- `unsupported-mdx`는 자동 저장을 허용하지 않는다.
- `auth-required`와 `session-expired`는 repository 변경 없이 재인증을 요구한다.
- `stale-file`은 덮어쓰기 없이 현재 편집 내용과 원본 충돌 상태를 표시한다.
- retryable failure와 non-retryable failure를 구분해야 한다.

## State Transitions

```text
새 초안 시작
  -> editing clean
  -> editing dirty
  -> backup available
  -> save pending
  -> saved clean

기존 글 열기
  -> unsupported-mdx blocked
  -> editing clean
  -> editing dirty
  -> save pending
  -> saved clean

save pending
  -> saved clean
  -> auth recovery required
  -> conflict resolution required
  -> retryable failure
  -> validation blocked
```
