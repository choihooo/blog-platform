# Research: Generated Outputs

## Decision: 생성 산출물은 request-time 표현으로 제공한다

**Rationale**: 로드맵과 헌법은 CMS가 `rss.xml`, `sitemap.xml`, `robots.txt`, OG image 파일을 repository에
commit하지 않아야 한다고 명시한다. 따라서 발행 콘텐츠와 사이트 metadata의 현재 상태를 읽어 공개 route와
page metadata에서 생성하는 방식이 가장 단순하고 감사 가능하다.

**Alternatives considered**:

- Repository에 생성 파일 commit: 발행 workflow가 복잡해지고 stale file, conflict, rollback 문제가 생겨
  제외한다.
- 별도 저장소나 cache에 산출물 저장: MVP 범위의 PostgreSQL/object storage 금지와 충돌하므로 제외한다.

## Decision: published-only selection을 모든 public output의 단일 입력 경계로 둔다

**Rationale**: 공개 페이지, RSS, Sitemap, JSON-LD, OG image는 모두 `status: published` 글만 사용해야
한다. `packages/markdown`와 `apps/blog/lib/content`의 기존 published filtering을 입력 경계로 삼으면
초안과 보관 글이 각 산출물에서 따로 누락되는 drift를 줄일 수 있다.

**Alternatives considered**:

- 각 route에서 status를 개별 필터링: route마다 조건이 달라질 위험이 있어 제외한다.
- SEO engine 내부에서만 filtering: app route가 잘못된 입력을 넘겨도 발견하기 어려워 public route
  contract에도 published-only 요구를 둔다.

## Decision: `packages/seo-engine`는 순수 생성 규칙을 제공하고 Next.js 연결은 `apps/blog`가 담당한다

**Rationale**: metadata, JSON-LD, RSS item, Sitemap entry, robots policy, OG image payload는 CMS preview
또는 다른 public surface에서도 재사용될 수 있는 도메인 규칙이다. 반면 route handler, page metadata,
response header는 `apps/blog`의 framework 연결 책임이다.

**Alternatives considered**:

- 모든 생성을 `apps/blog` 안에 둠: 공개 app과 CMS preview 사이의 생성 규칙 drift가 생길 수 있어 제외한다.
- Next.js 전용 타입을 `packages/seo-engine`에 노출: shared package가 특정 app runtime에 묶이므로 제외한다.

## Decision: TOC와 reading time은 Markdown/MDX 분석 결과를 재사용한다

**Rationale**: heading slug, TOC, reading time은 이미 Markdown/MDX Engine phase의 책임이다. 이번 phase는
글 상세 표시와 generated outputs 연결을 완성하는 것이므로 같은 입력에서 같은 TOC/reading time이 나오게
기존 분석 결과를 사용한다.

**Alternatives considered**:

- SEO engine에서 TOC/reading time을 다시 계산: 같은 본문을 두 package가 다르게 해석할 수 있어 제외한다.
- Page component에서 ad hoc 계산: 테스트 경계가 흐려지고 CMS preview와 drift가 생겨 제외한다.

## Decision: OG image는 글별 payload와 route visual contract를 분리한다

**Rationale**: `packages/seo-engine`는 제목, 사이트명, 카테고리, 대표 이미지, fallback 여부 같은
표현 데이터를 만들고, `apps/blog/app/og/[slug]/route.ts`가 실제 이미지 응답을 담당한다. 이렇게 하면 긴
제목 wrapping, fallback image, published-only 접근을 route test와 visual validation에서 별도로 검증할 수
있다.

**Alternatives considered**:

- 정적 OG image 파일 생성: repository file commit 금지와 충돌하므로 제외한다.
- 대표 이미지가 없는 글은 OG image 생략: 모든 published 글이 OG image URL을 가져야 한다는 명세와 맞지
  않아 제외한다.
