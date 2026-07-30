# Research: SEO 자동화

## Decision: SEO 계산은 `packages/seo-engine`의 순수 함수 계약으로 둔다

**Rationale**: 공개 블로그와 CMS가 같은 SEO score, metadata, JSON-LD, RSS/Sitemap entry, OG payload를
사용해야 한다. app 내부에 계산을 두면 공개 산출물과 CMS 미리보기 사이에 drift가 생긴다. 순수 함수
계약은 repository 콘텐츠 입력만으로 결정적인 결과를 만들 수 있고 테스트하기 쉽다.

**Alternatives considered**:

- `apps/blog` route 안에서 직접 생성: route별 중복과 CMS drift가 커진다.
- CMS에서 생성 파일을 commit: 헌법의 파일 기반 콘텐츠 권위와 generated file commit 금지에 어긋난다.
- 외부 SEO service 사용: MVP 범위를 넓히고 네트워크 의존성을 추가한다.

## Decision: rule-based SEO score는 기존 문서의 100점 가중치를 따른다

**Rationale**: `docs/blog-platform-spec.md`는 H1, H2, meta description, Open Graph, canonical, title
길이, image alt, internal link를 총 100점으로 정의한다. 이 기준은 AI나 외부 검색 데이터를 요구하지
않고, 운영자가 발행 전에 고칠 수 있는 항목과 직접 연결된다.

**Alternatives considered**:

- Search Console 기반 점수: MVP에서 API 통합 대시보드를 금지한다.
- AI 기반 키워드 점수: AI SEO 생성과 분석은 Post-MVP 범위다.
- 단순 pass/fail만 제공: 운영자가 개선 우선순위를 판단하기 어렵다.

## Decision: generated output route는 shared package 결과를 serialization만 한다

**Rationale**: `rss.xml`, `sitemap.xml`, `robots.txt`, `og/[slug]` route는 이미 app route로 존재한다.
route는 request/response와 content-type만 책임지고, entry 계산과 escaping/fallback policy는
`packages/seo-engine` 계약을 사용해야 한다.

**Alternatives considered**:

- XML/string 생성 로직을 route에 유지: 테스트와 재사용이 어렵고 route마다 escaping 규칙이 흩어진다.
- 빌드 시 파일 생성: 발행 상태 변경과 preview 경계를 관리하기 어렵고 repository churn이 생긴다.

## Decision: OG image는 MVP에서 route 기반 동적 생성 payload로 다룬다

**Rationale**: 명세는 모든 발행 글에 공유 이미지를 요구하지만 이미지 파일 저장은 금지한다. route 기반
생성은 글 제목, category, author, cover image, fallback layout을 현재 콘텐츠 상태에 맞춰 제공한다.
`packages/seo-engine`는 1200x630 payload와 fallback 결정을 만들고, `apps/blog` route가 실제 이미지
응답을 담당한다.

**Alternatives considered**:

- 이미지 파일을 미리 생성해 commit: generated file commit 금지와 충돌한다.
- cover image 없으면 404: 모든 발행 글에 안정적인 공유 이미지 요구를 만족하지 못한다.

## Decision: analytics는 `packages/analytics`에서 이벤트와 외부 콘솔 링크만 제공한다

**Rationale**: MVP는 GA4/GTM 이벤트 발행과 외부 콘솔 링크를 요구하고, 자체 분석 저장소와 API 조회를
금지한다. shared package에 이벤트 이름, payload sanitization, provider disabled 상태, GA4/Search
Console 링크 생성을 두면 public blog와 CMS가 같은 계약을 사용한다.

**Alternatives considered**:

- CMS 내부 분석 dashboard: Post-MVP 범위이며 API credential과 저장 전략이 필요하다.
- app별 hard-coded link: URL 생성 규칙과 disabled 상태 처리가 중복된다.
- 모든 이벤트를 서버에서 저장: 데이터 저장소와 개인정보 책임이 생긴다.

## Decision: CMS SEO panel은 editor document를 package 입력으로 변환한다

**Rationale**: 운영자는 발행 전 SEO 상태를 봐야 하므로 repository에 저장된 발행 글만 검사해서는 부족하다.
CMS는 현재 editor document와 MDX serialization/analysis 결과를 `SEO Report Input`으로 만들고,
published 상태일 때는 public URL과 외부 콘솔 링크도 함께 보여준다.

**Alternatives considered**:

- 저장 후에만 SEO 검사: 발행 전 피드백 가치가 낮다.
- CMS가 별도 scoring 로직 구현: shared package ownership 원칙에 어긋난다.

## Decision: 공개 노출 경계는 `packages/markdown`의 published-only selection을 기준으로 한다

**Rationale**: 기존 공개 블로그와 발행 workflow가 `draft`/`archived` 제외를 이미 `packages/markdown`
경계로 잡고 있다. SEO 산출물과 analytics도 같은 selection을 사용해야 preview token이나 비공개 편집물이
검색/피드/이벤트로 새지 않는다.

**Alternatives considered**:

- SEO package가 모든 post status를 직접 필터링: content selection 책임이 중복된다.
- route별 status check: 누락 route가 생기기 쉽다.
