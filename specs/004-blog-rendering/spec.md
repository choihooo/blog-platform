# Feature Specification: Blog Rendering

**Feature Branch**: `004-blog-rendering`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "4번째 작업 해보자"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Published Post Discovery (Priority: P1)

방문자는 공개 블로그 홈에서 repository에 저장된 published 글 목록을 최신순으로 확인하고 각 글로
이동할 수 있다.

**Why this priority**: 공개 블로그의 첫 화면이 실제 콘텐츠를 보여주지 못하면 렌더링 phase의 사용자
가치가 없다.

**Independent Test**: published 샘플 글이 있는 상태에서 홈으로 접속해 글 제목, excerpt, 발행일,
reading time이 표시되고 상세 페이지 링크가 동작하는지 확인한다.

**Acceptance Scenarios**:

1. **Given** published 글이 존재한다, **When** 방문자가 홈을 연다, **Then** 홈에는 published 글만
   표시된다.
2. **Given** draft 또는 archived 글이 존재한다, **When** 방문자가 홈을 연다, **Then** 해당 글은
   목록에서 제외된다.

---

### User Story 2 - Post Reading Page (Priority: P2)

방문자는 `/posts/[slug]`에서 검증된 MDX 글 본문과 글 메타데이터, TOC를 읽을 수 있다.

**Why this priority**: 글 상세 페이지가 있어야 블로그가 콘텐츠 소비 경험을 제공한다.

**Independent Test**: published slug로 접속했을 때 제목, 작성자, 발행일, reading time, TOC, 본문이
표시되고, 존재하지 않거나 공개 불가능한 slug는 찾을 수 없음으로 처리되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** published 글 slug가 있다, **When** 방문자가 상세 URL을 연다, **Then** 검증된 MDX 본문과
   메타데이터가 표시된다.
2. **Given** 공개 대상이 아닌 slug가 있다, **When** 방문자가 상세 URL을 직접 연다, **Then** 글
   내용은 노출되지 않는다.

---

### User Story 3 - Category and Tag Browsing (Priority: P3)

방문자는 category와 tag별 페이지에서 관련 published 글만 탐색할 수 있다.

**Why this priority**: 분류 탐색은 MVP 블로그에서 글이 늘어날 때 discoverability를 높인다.

**Independent Test**: category 또는 tag URL로 접속해 해당 분류에 연결된 published 글만 표시되는지
확인한다.

**Acceptance Scenarios**:

1. **Given** category에 연결된 published 글이 있다, **When** 방문자가 category 페이지를 연다,
   **Then** 해당 category의 published 글만 표시된다.
2. **Given** 등록되지 않은 category 또는 tag slug가 있다, **When** 방문자가 해당 URL을 연다,
   **Then** 찾을 수 없음으로 처리된다.

### Edge Cases

- published 글이 하나도 없으면 홈과 taxonomy 목록은 비어 있음을 명확히 보여준다.
- 콘텐츠 collection validation이 실패하면 공개 페이지 빌드 또는 렌더링이 실패해 잘못된 콘텐츠가
  조용히 노출되지 않는다.
- unsafe MDX 분석이 실패하면 상세 페이지 렌더링 전에 차단된다.
- draft 또는 archived 글은 slug를 알고 직접 접근하더라도 공개 화면에 노출되지 않는다.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST read blog content from the repository content files.
- **FR-002**: System MUST include only `published` posts in public routes and lists.
- **FR-003**: System MUST provide a public home page listing published posts with title, excerpt,
  date, author, reading time, category, and tags when available.
- **FR-004**: System MUST provide a post detail page addressable by slug.
- **FR-005**: System MUST render validated MDX body content on the post detail page.
- **FR-006**: System MUST expose generated table of contents and reading time on post detail pages.
- **FR-007**: System MUST provide category and tag pages that list only matching published posts.
- **FR-008**: System MUST hide draft, archived, unknown, invalid, or unsafe posts from public
  output.
- **FR-009**: System MUST not require GitHub API credentials, database access, object storage, or
  CMS authentication for public blog rendering.

### Key Entities

- **Published Post**: Public article with slug, title, author, published date, body, optional
  excerpt, category, and tags.
- **Author**: Public writer profile referenced by posts.
- **Category**: Registered content grouping used for category pages.
- **Tag**: Registered content label used for tag pages.
- **Site Configuration**: Public site identity and repository-backed configuration.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A visitor can reach the published sample post from the home page in two clicks or
  fewer.
- **SC-002**: 100% of draft and archived posts are excluded from public lists and direct post
  routes.
- **SC-003**: Published post pages display title, date, reading time, and body content for every
  valid published post.
- **SC-004**: Category and tag pages display only matching published posts with no unrelated
  entries.
- **SC-005**: Public rendering works without any external service credentials.

## Assumptions

- The next roadmap phase after Markdown/MDX Engine is Blog Rendering.
- MVP styling should be production-readable but limited to the public blog surface.
- RSS, sitemap, robots, JSON-LD, OG image generation, SEO scoring, and analytics events remain later
  roadmap phases.
