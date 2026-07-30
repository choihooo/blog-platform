# Contract: SEO Engine Generated Outputs

`packages/seo-engine`는 framework에 독립적인 순수 생성 함수를 제공한다. 모든 함수는 같은 입력에서 같은
출력을 반환해야 하며 repository에 파일을 쓰지 않는다.

## Input Boundary

- 입력은 `SeoSite`와 `SeoSubject` 또는 `SeoSubject[]`다.
- public output 생성자는 `status: published`인 subject만 공개 산출물에 포함해야 한다.
- app layer는 가능하면 이미 published-only로 필터링된 subject를 전달해야 한다.

## Required Exports

### `generatePageMetadata(subject)`

**Purpose**: 글 상세 page metadata와 공유 metadata를 생성한다.

**Required Behavior**:

- canonical URL을 제공한다.
- Open Graph title, description, URL, image URL을 제공한다.
- Twitter title, description, image URL을 제공한다.
- cover image가 없으면 fallback OG image URL을 제공한다.
- draft 또는 archived subject는 공개 metadata로 사용할 수 없도록 빈 결과 또는 실패 결과를 제공한다.

### `generateJsonLd(subject)`

**Purpose**: `BlogPosting`과 `BreadcrumbList` JSON-LD 배열을 생성한다.

**Required Behavior**:

- published 글에만 JSON-LD를 생성한다.
- `BlogPosting`에는 headline, description, url, datePublished, dateModified, author, image, keywords,
  articleSection을 가능한 범위에서 포함한다.
- `BreadcrumbList`에는 site root와 글 상세 URL을 포함한다.
- undefined 값은 JSON 직렬화 결과에서 불필요하게 노출되지 않아야 한다.

### `generateFeedOutput(site, subjects)`

**Purpose**: RSS feed 직렬화 전 중립 표현을 생성한다.

**Required Behavior**:

- published 글만 포함한다.
- 최신 published 글이 먼저 오도록 정렬한다.
- 발행 글이 없어도 channel metadata를 반환한다.
- feed item은 title, link, guid, pubDate, description을 포함한다.

### `serializeFeed(feedOutput)`

**Purpose**: feed output을 RSS XML 문자열로 직렬화한다.

**Required Behavior**:

- XML special character를 escape한다.
- 빈 item 목록도 유효한 RSS channel로 직렬화한다.

### `generateSitemapOutput(site, subjects, taxonomy?)`

**Purpose**: 공개 URL Sitemap entry 목록을 생성한다.

**Required Behavior**:

- 홈 URL과 published 글 URL을 포함한다.
- 공개 category/tag URL을 포함할 수 있다.
- draft, archived, CMS, preview URL을 포함하지 않는다.
- 중복 URL을 제거한다.

### `serializeSitemap(entries)`

**Purpose**: Sitemap entry 목록을 XML 문자열로 직렬화한다.

**Required Behavior**:

- XML special character를 escape한다.
- 빈 글 목록에서도 유효한 urlset을 반환한다.

### `generateRobotsPolicy(site)`

**Purpose**: robots 정책의 중립 표현을 생성한다.

**Required Behavior**:

- Sitemap 절대 URL을 포함한다.
- 공개 블로그 색인을 허용한다.
- CMS 또는 preview 표면은 색인하지 않도록 표현한다.

### `serializeRobots(policy)`

**Purpose**: robots 정책을 text/plain 문자열로 직렬화한다.

**Required Behavior**:

- `Sitemap: <absolute-url>` line을 포함한다.
- 사람이 읽을 수 있는 안정적인 line order를 유지한다.

### `createOgImagePayload(subject)`

**Purpose**: OG image route가 렌더링할 이미지 payload를 생성한다.

**Required Behavior**:

- published 글에 대해서만 payload를 제공한다.
- title, siteName, categoryLabel, authorName, coverImage, fallback, publicPostUrl을 포함한다.
- cover image가 없으면 fallback 상태와 fallback visual에 필요한 값을 포함한다.

## Non-Goals

- SEO score 계산 변경
- CMS SEO panel 표시
- Analytics event 발행
- GA4/Search Console 외부 링크 생성
- RSS/Sitemap/robots 파일을 repository에 쓰기
