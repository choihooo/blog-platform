# Research: Blog Rendering

## Decision: 공개 blog rendering은 local repository file만 읽는다

**Rationale**: 헌법의 파일 기반 콘텐츠 권위 원칙에 따라 GitHub repository가 콘텐츠 원본이고 공개
블로그는 runtime에 GitHub API credential을 요구하면 안 된다. `content/` 파일을 직접 읽으면 local
development, static generation, Vercel deployment에서 같은 입력을 사용할 수 있다.

**Alternatives considered**:

- GitHub Contents API read: public runtime credential과 network dependency가 필요해 MVP 공개 경계를
  복잡하게 만든다.
- CMS API read: 별도 CMS 서버나 database contract가 생겨 MVP 범위를 벗어난다.

## Decision: route 생성 전 full content collection validation을 실행한다

**Rationale**: published-only filtering은 post file 하나만으로 충분하지 않다. author, category, tag,
site defaultAuthor reference integrity와 duplicate slug는 collection 수준에서 검증해야 한다. 공개
route 생성 전에 실패시키면 invalid content가 조용히 노출되는 일을 막을 수 있다.

**Alternatives considered**:

- route별 lazy validation: 특정 route 방문 전까지 오류를 발견하지 못하고 목록과 상세가 서로 다른
  상태를 보여줄 수 있다.
- validation 없는 rendering: draft/archived/invalid post가 공개 route에 섞일 위험이 있다.

## Decision: Blog app은 app-local content loader를 두고 domain validation은 공유 package에 위임한다

**Rationale**: 파일 읽기와 route별 view model 조립은 `apps/blog`의 책임이다. status schema,
reference validation, slug uniqueness, MDX safety, heading, TOC, reading time은 이미
`packages/markdown`가 소유하므로 app에서 중복 구현하지 않는다.

**Alternatives considered**:

- 모든 loader를 `packages/markdown`로 이동: Next.js app runtime 경로와 filesystem root 결정을 shared
  package에 밀어 넣어 package boundary가 흐려진다.
- app 내부에서 parser와 validation 재구현: 블로그와 CMS preview 사이 drift가 발생한다.

## Decision: MVP public routes는 홈, post detail, category, tag로 제한한다

**Rationale**: spec의 핵심 사용 흐름은 published 글 발견, 글 읽기, taxonomy 탐색이다. RSS, sitemap,
robots.txt, JSON-LD, OG image, SEO score, analytics event는 로드맵의 이후 phase 산출물이므로 현재
phase에 넣지 않는다.

**Alternatives considered**:

- generated SEO outputs까지 포함: Phase 10 범위를 앞당겨 Blog Rendering 구현과 validation 범위가
  커진다.
- 검색, archive, pagination 포함: MVP 초기 content set에는 필수 discoverability가 아니며 별도 UX
  요구사항이 필요하다.

## Decision: unsafe, invalid, draft, archived, unknown slug는 public output 전에 차단한다

**Rationale**: 안전한 발행 경계 원칙에 따라 공개 route는 오직 published이며 MDX safety validation을
통과한 글만 렌더링해야 한다. 직접 slug 접근도 목록과 같은 공개 정책을 따라야 한다.

**Alternatives considered**:

- 목록에서만 숨기고 direct route 허용: draft 또는 archived 글이 URL 공유로 노출된다.
- unsafe MDX를 sanitizer에만 의존: import/export, event handler, runtime expression 같은 정책 위반을
  명확한 실패로 다루기 어렵다.

## Decision: TOC anchor는 MDX rendering output의 heading id와 일치시킨다

**Rationale**: `packages/markdown`의 heading slug와 렌더링된 heading id가 다르면 TOC가 시각적으로만
존재하고 실제 탐색이 깨진다. app route는 shared analysis 결과의 TOC를 표시하면서 rendering
pipeline에도 같은 slug 정책을 적용해야 한다.

**Alternatives considered**:

- TOC 표시만 하고 anchor 이동 생략: post reading page의 탐색 가치가 떨어진다.
- heading id를 수동 JSX component로 모두 재작성: MDX renderer와의 중복이 늘고 향후 component
  allowlist와 충돌할 수 있다.
