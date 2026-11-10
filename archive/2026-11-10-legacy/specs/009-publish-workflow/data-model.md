# Data Model: Publish Workflow

## Entity: PublishablePost

CMS에서 Save, Publish, Unpublish, Archive 대상이 되는 글이다. canonical source는 repository의
`content/posts/*.mdx` 파일이다.

### Fields

- `id`: editor에서 사용하는 글 식별자
- `path`: repository-relative MDX 경로
- `sourceSha`: 마지막으로 읽은 repository file SHA
- `title`: 글 제목
- `slug`: 공개 URL 식별자
- `status`: `draft`, `published`, `archived`
- `author`: 작성자 식별자
- `publishedAt`: 최초 공개 발행일
- `updatedAt`: 마지막 저장 또는 상태 변경 시각
- `excerpt`: 선택 요약
- `coverImage`: 선택 커버 이미지 공개 경로
- `category`: 선택 category slug
- `tags`: 선택 tag slug 목록
- `body`: editor document body 또는 MDX 본문

### Validation Rules

- `status`는 `draft`, `published`, `archived` 중 하나여야 한다.
- Publish 대상은 `title`, `slug`, `author`, `publishedAt`, 비어 있지 않은 `body`가 있어야 한다.
- Publish 시 `publishedAt`이 비어 있으면 현재 발행 시각으로 설정한다.
- Publish 시 `slug`가 비어 있으면 제목 기반 slug 후보를 생성한다.
- Publish 전 slug는 전체 post collection에서 자기 자신을 제외하고 중복될 수 없다.
- `publishedAt`이 이미 있는 published post는 명시적 변경 없이 덮어쓰지 않는다.

## Entity: PublicationOperation

운영자가 CMS에서 실행하는 상태 변경 또는 저장 작업이다.

### Fields

- `type`: `save-draft`, `publish`, `unpublish`, `archive`, `retry-public-refresh`
- `postId`: 대상 글 식별자
- `path`: 대상 repository path
- `expectedSha`: optimistic locking에 사용할 마지막 repository SHA
- `submittedDocument`: 작업 시점의 editor document
- `previousMetadata`: 작업 전 공개 반영 대상 계산에 필요한 이전 metadata
- `nextMetadata`: 작업 후 공개 반영 대상 계산에 필요한 다음 metadata
- `requestedAt`: 작업 요청 시각

### Validation Rules

- `save-draft`, `publish`, `unpublish`, `archive`는 인증된 관리자만 실행할 수 있다.
- `retry-public-refresh`는 이미 repository 변경이 성공한 작업의 refresh target이 있을 때만 실행할 수
  있다.
- `publish`는 published 검증과 duplicate slug 검증을 통과해야 repository 변경을 요청할 수 있다.
- `unpublish`는 target status를 `draft`로 만든다.
- `archive`는 target status를 `archived`로 만든다.
- `save-draft`는 public refresh target을 만들지 않는다.

## Entity: PublicationState

글의 공개 노출 상태를 결정하는 상태값이다.

### States

- `draft`: CMS와 preview 전용. 공개 목록과 generated public output에서 제외된다.
- `published`: 공개 블로그와 generated public output에 포함될 수 있다.
- `archived`: repository에는 남지만 공개 노출에서 제외된다.

### State Transitions

```text
draft -> draft
draft -> published
published -> published
published -> draft
published -> archived
archived -> archived
archived -> published
```

### Transition Rules

- `draft -> published`: published 필수값, slug 중복, body 검증을 통과해야 한다.
- `published -> draft`: 공개 노출에서 제외되며 public refresh가 필요하다.
- `published -> archived`: 공개 노출에서 제외되며 public refresh가 필요하다.
- `archived -> published`: 현재 published 요구사항과 slug 중복 검사를 다시 통과해야 한다.

## Entity: PublicRefreshTarget

상태 변경 후 최신 콘텐츠가 반영되어야 하는 공개 표면이다.

### Fields

- `paths`: 공개 route path 목록
- `postSlug`: 현재 또는 이전 post slug
- `categories`: 이전 및 현재 category slug 목록
- `tags`: 이전 및 현재 tag slug 목록
- `reason`: `publish`, `unpublish`, `archive`, `retry`

### Validation Rules

- Publish, Unpublish, Archive는 항상 `/`, `/rss.xml`, `/sitemap.xml`, `/robots.txt`를 포함한다.
- slug가 있으면 `/posts/<slug>`와 `/og/<slug>`를 포함한다.
- 이전 또는 현재 category가 있으면 `/categories/<slug>`를 포함한다.
- 이전 또는 현재 tag가 있으면 `/tags/<slug>`를 포함한다.
- 중복 target은 한 번만 요청한다.

## Entity: OperationResult

CMS가 운영자에게 표시하는 작업 결과다.

### Fields

- `ok`: 전체 작업이 운영자 관점에서 완료되었는지 여부
- `repository`: repository 변경 결과
- `publicRefresh`: public refresh 결과. Save draft에는 없음
- `code`: 실패 코드
- `retryable`: 사용자가 같은 작업 또는 public refresh를 재시도할 수 있는지 여부
- `message`: 운영자에게 표시할 결과 메시지
- `submittedDocument`: 실패 시 보존할 editor document
- `submittedSource`: 실패 시 보존할 MDX source

### Failure Codes

- `validation-failure`: published 필수값, slug, body, unsupported document 실패
- `duplicate-slug`: 다른 post와 slug 충돌
- `auth-required`: 인증 없음
- `forbidden`: 관리자 identity 불일치 또는 권한 없음
- `session-expired`: 세션 만료
- `stale-file`: repository SHA conflict
- `temporary-connectivity`: 일시적 network, provider, rate limit 실패
- `public-refresh-failed`: repository 변경 성공 후 공개 반영 실패
- `unknown`: 분류되지 않은 실패

### Invariants

- repository 변경이 실패하면 public refresh를 실행하지 않는다.
- public refresh 실패는 성공한 repository 변경을 되돌리지 않는다.
- 실패 결과는 운영자의 현재 편집 내용을 잃지 않도록 submitted document 또는 source를 보존한다.
