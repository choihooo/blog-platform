# Research: CMS Editor

## Decision: `packages/editor`가 편집 문서 모델과 MDX round-trip 규칙을 소유한다

**Rationale**: CMS와 공개 preview는 같은 콘텐츠 의미를 공유해야 한다. Editor 변환 규칙을 CMS page
안에 두면 이후 preview, publish, SEO phase에서 같은 MDX subset 판단을 중복하게 된다.
`packages/editor`는 이미 이 목적의 package boundary로 존재하므로, 편집 가능한 document shape, 지원
서식, 변환 validation을 여기에 둔다.

**Alternatives considered**:

- CMS app 내부 구현: 초기 구현은 빠르지만 blog/CMS drift와 테스트 중복이 커진다.
- `packages/markdown`에 editor 모델까지 추가: Markdown package가 parser/analysis와 editor UI state를
  동시에 소유하게 되어 책임이 넓어진다.

## Decision: MVP editor는 지원 가능한 MDX subset만 편집 가능하게 한다

**Rationale**: 헌법은 unsafe MDX, arbitrary runtime evaluation, 미지원 interactive component를
차단한다. Editor가 import/export/JSX/raw HTML을 자동 변환하면 콘텐츠 손상이나 공개 노출 위험이
생긴다. 따라서 지원 서식은 paragraph, heading, list, blockquote, horizontal rule, link, image
reference, inline code, code block, bold, italic으로 제한하고, 미지원 문법은 편집 불가 상태로
안내한다.

**Alternatives considered**:

- 모든 MDX를 raw text fallback으로 편집: 운영자는 저장할 수 있지만 rich editor의 round-trip 보장이
  무너지고 unsafe content를 실수로 유지할 수 있다.
- 미지원 노드를 placeholder로 보존: UX와 serialization 복잡도가 MVP 범위를 넘는다.

## Decision: MDX 파일은 기존 frontmatter와 body 경계를 유지한다

**Rationale**: `packages/markdown`는 frontmatter parse/serialize, post validation, MDX safety,
heading, TOC, reading time을 이미 제공한다. Editor phase는 이 기반 위에서 editor document와 MDX
문자열 사이의 변환만 추가하고, content schema와 published-only 정책은 기존 package에 맡긴다.

**Alternatives considered**:

- Editor 전용 metadata schema 생성: 콘텐츠 원본과 중복 schema가 생긴다.
- JSON document를 repository 원본으로 저장: 파일 기반 MDX 권위 원칙과 공개 블로그 렌더링 흐름을
  깬다.

## Decision: 저장은 기존 protected content operation과 SHA optimistic locking을 사용한다

**Rationale**: `005-github-content-adapter`와 `006-cms-auth-shell`은 repository path boundary,
expected SHA, mutation guard를 이미 정의했다. Editor save는 이 contract를 재사용해야 비관리자 저장,
stale overwrite, path traversal을 같은 방식으로 차단할 수 있다.

**Alternatives considered**:

- Editor 전용 save adapter 생성: 보안/충돌/오류 mapping을 중복 구현하게 된다.
- Page-level guard만 신뢰: mutation boundary 보호 원칙에 어긋난다.

## Decision: 임시 편집 백업은 브라우저 로컬에 30일 TTL로 둔다

**Rationale**: 단일 운영자 MVP에서는 저장 전 손실 방지가 필요하지만 별도 CMS database는 헌법상
금지다. 브라우저 로컬 백업은 repository 원본을 대체하지 않으면서 새로고침, 네트워크 실패, 세션 만료
시 작성 중인 내용을 복구할 수 있다. 성공 저장 후에는 해당 백업을 정리한다.

**Alternatives considered**:

- Repository에 자동 저장: 불완전한 draft commit이 과도하게 늘고 충돌 처리가 복잡해진다.
- 서버 세션 저장: 별도 state 저장소가 필요해 MVP 제약을 위반한다.
- 백업 없음: 긴 글 작성 중 손실 위험이 너무 크다.

## Decision: Preview는 public blog와 동일한 의미 검증을 우선한다

**Rationale**: 운영자가 보는 preview와 공개 렌더링 결과가 크게 다르면 editor의 신뢰성이 떨어진다.
Editor preview는 compile/render 구현 세부보다 같은 heading, code block, link, image reference,
safety validation 결과를 보여주는 것을 우선한다.

**Alternatives considered**:

- Editor DOM을 그대로 preview로 간주: 공개 블로그 결과와 drift가 커질 수 있다.
- 완전한 publish preview token 구현: 별도 phase의 preview/publish 범위에 해당한다.

## Decision: UI는 shell 안의 작업형 화면으로 구성한다

**Rationale**: CMS는 반복 작업 도구이므로 Posts list, editor surface, toolbar, frontmatter panel,
preview, status/recovery messaging을 밀도 있게 배치해야 한다. 기존 shell과 design-system primitive를
사용하고, 마케팅형 hero나 독립 랜딩 구성을 만들지 않는다.

**Alternatives considered**:

- 별도 full-screen editor app: shell navigation과 account/access state가 분리된다.
- 카드 중심 대시보드: 장문 작성/비교/상태 판단에 필요한 작업 밀도가 낮다.
