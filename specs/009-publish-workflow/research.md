# Research: Publish Workflow

## Decision: 기존 ContentAdapter intent를 발행 workflow의 repository 경계로 사용

**Rationale**: `ContentAdapter`는 이미 `save-draft`, `prepare-publish`, `prepare-unpublish`,
`prepare-archive` 의도와 commit summary 규칙을 제공한다. 발행 workflow가 이 contract를 사용하면
local adapter와 GitHub adapter 차이를 숨기고 SHA 기반 optimistic locking도 유지할 수 있다.

**Alternatives considered**:

- 별도 publish adapter 추가: 기존 adapter와 인증/충돌 mapping이 중복된다.
- 공개 blog 파일을 직접 수정: 파일 기반 콘텐츠 원본 원칙과 generated output 책임 분리를 위반한다.

## Decision: Publish는 editor document 직렬화 후 published post 검증을 실행

**Rationale**: 현재 editor 저장 흐름은 `editorDocumentToMdx`를 통해 MDX source를 만든다. Publish는
같은 직렬화 결과에 `status: published`, slug, `publishedAt` 보정을 적용한 뒤 `packages/markdown`의
published 검증과 collection-level duplicate slug 검증을 통과해야 한다. 이렇게 하면 CMS preview와
공개 blog가 같은 콘텐츠 정책을 공유한다.

**Alternatives considered**:

- UI field만 검사: MDX 본문, frontmatter 직렬화 오류, cross-file slug 중복을 놓칠 수 있다.
- public app에서만 검증: 잘못된 content가 repository에 먼저 commit되어 공개 build 또는 route를
  깨뜨릴 수 있다.

## Decision: 발행일은 최초 Publish 시 자동 설정하고 기존 값은 유지

**Rationale**: 명세는 `publishedAt`이 비어 있을 때 자동 설정을 요구한다. 이미 발행일이 있는 글을
다시 저장하거나 발행 상태로 유지할 때 임의로 덮어쓰면 URL 정렬, RSS 순서, 독자에게 보이는 날짜가
예기치 않게 바뀐다.

**Alternatives considered**:

- 매 Publish마다 현재 시각으로 갱신: 재발행과 최초 발행을 구분하지 못한다.
- 발행일 수동 입력만 허용: 운영자의 one-click Publish 흐름이 깨진다.

## Decision: slug가 없으면 제목 기반 후보를 생성하고 전체 post 기준 중복 검사

**Rationale**: content model phase에서 Save/Publish 시 제목 기반 slug 생성과 중복 차단을 요구했다.
Publish workflow는 새 초안과 기존 초안을 모두 다루므로 repository의 전체 `content/posts/*.mdx`
기준으로 자기 자신을 제외한 중복 slug를 확인해야 한다.

**Alternatives considered**:

- 파일 경로만 기준으로 중복 판단: frontmatter slug와 public URL 충돌을 놓친다.
- 중복 시 suffix 자동 부여: 운영자가 의도한 canonical URL을 모른 채 바꿀 수 있다. MVP에서는 명시적
  수정 유도가 더 안전하다.

## Decision: Save draft는 공개 반영을 실행하지 않고 Publish/Unpublish/Archive만 실행

**Rationale**: Save draft는 공개 표면에 영향을 주면 안 된다. Publish, Unpublish, Archive는 공개
목록, 상세 글, taxonomy, RSS, Sitemap, robots policy, OG image에 영향을 주므로 공개 반영 대상 계산이
필요하다.

**Alternatives considered**:

- 모든 Save마다 revalidation: 초안 변경이 공개 route에 불필요한 비용과 혼선을 만든다.
- public app build에만 의존: 운영자가 발행 직후 공개 반영 여부를 확인할 수 없다.

## Decision: repository 변경 결과와 public refresh 결과를 분리한 OperationResult 사용

**Rationale**: GitHub commit은 성공했지만 revalidation이 실패할 수 있다. 두 결과를 하나의 실패로
합치면 운영자는 재저장이 필요한지, 공개 반영만 재시도하면 되는지 판단할 수 없다.

**Alternatives considered**:

- revalidation 실패 시 전체 발행 실패 처리: 실제 repository 상태와 CMS 표시가 어긋난다.
- revalidation 실패를 숨김: 공개 블로그가 최신 상태인지 운영자가 알 수 없다.

## Decision: public refresh 대상은 변경 전후 metadata를 모두 반영해 계산

**Rationale**: slug, category, tag가 바뀌는 발행 또는 저장 후 발행에서는 이전 route와 새 route가
모두 영향받을 수 있다. 이전 category/tag 경로를 refresh하지 않으면 글 제거가 늦게 보일 수 있다.

**Alternatives considered**:

- 새 metadata만 refresh: 이전 taxonomy 페이지 stale 상태가 남을 수 있다.
- 전체 site rebuild만 사용: MVP 규모에는 가능하지만 실패 분리와 빠른 피드백이 약해진다.
