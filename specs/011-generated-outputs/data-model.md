# Data Model: Generated Outputs

## Seo Site

사이트 단위 generated outputs의 기준 metadata.

**Fields**:

- `siteName`: RSS channel, OG image, breadcrumb에 표시되는 사이트 이름
- `siteUrl`: canonical URL, Sitemap URL, robots Sitemap link의 기준 URL
- `defaultAuthor`: 작성자 fallback 식별자

**Validation Rules**:

- `siteUrl`은 절대 URL이어야 한다.
- trailing slash 유무와 관계없이 생성 URL은 중복 slash 없이 안정적으로 만들어져야 한다.

## Seo Subject

발행 글 하나를 generated outputs에 사용할 수 있도록 정규화한 표현.

**Fields**:

- `status`: `published`, `draft`, `archived` 중 하나
- `slug`: 공개 글 URL에 쓰이는 slug
- `title`: metadata, RSS, OG image, JSON-LD headline에 쓰이는 제목
- `excerpt`: description, RSS description, JSON-LD description에 쓰이는 요약
- `canonicalUrl`: 글별 canonical URL
- `coverImage`: 대표 이미지 public path 또는 절대 URL
- `author`: 작성자 이름과 avatar
- `publishedAt`: 게시일
- `updatedAt`: 수정일
- `category`: 카테고리 slug와 label
- `tags`: 태그 slug와 label 목록
- `toc`: heading anchor와 label 목록
- `readingTime`: 예상 읽기 시간 표현

**Validation Rules**:

- public output 입력에는 `status: published`인 subject만 사용해야 한다.
- `draft`와 `archived` subject는 metadata, RSS, Sitemap, JSON-LD, OG image URL에 포함되면 안 된다.
- `slug`, `title`, `site.siteUrl`이 유효하지 않은 경우 잘못된 public URL을 생성하지 않아야 한다.

## Generated Metadata

글 상세 페이지와 공유 표면에 노출되는 metadata 표현.

**Fields**:

- `title`
- `description`
- `canonicalUrl`
- `openGraphTitle`
- `openGraphDescription`
- `openGraphUrl`
- `openGraphImageUrl`
- `twitterTitle`
- `twitterDescription`
- `twitterImageUrl`

**Validation Rules**:

- published 글은 100% canonical URL과 OG image URL을 가져야 한다.
- cover image가 없으면 fallback OG image URL을 사용해야 한다.
- metadata는 초안 preview URL이나 CMS URL을 포함하면 안 된다.

## Structured Data

검색 엔진이 글과 breadcrumb를 이해하도록 제공되는 JSON-LD 표현.

**Fields**:

- `BlogPosting`: headline, description, url, datePublished, dateModified, author, image, keywords,
  articleSection
- `BreadcrumbList`: site root와 글 상세 URL을 잇는 breadcrumb item 목록

**Validation Rules**:

- `BlogPosting`은 published 글에만 생성한다.
- `BreadcrumbList` item URL은 공개 URL이어야 하며 CMS 또는 preview URL을 포함하지 않는다.

## Feed Output

RSS feed 전체 표현.

**Fields**:

- `title`: 사이트 이름
- `link`: 사이트 URL
- `items`: 최신순 published feed item 목록

**Feed Item Fields**:

- `title`
- `link`
- `guid`
- `pubDate`
- `description`

**Validation Rules**:

- items는 published 글만 포함한다.
- 발행 글이 0개여도 유효한 RSS channel을 반환한다.
- item order는 `publishedAt` 최신순이어야 한다.

## Sitemap Output

검색 크롤러가 발견할 공개 URL 목록.

**Fields**:

- `loc`: 공개 URL
- `lastmod`: 가능한 경우 수정일 또는 게시일
- `changefreq`: 공개 표면별 갱신 힌트
- `priority`: 공개 표면별 중요도 힌트

**Validation Rules**:

- 홈, published 글, 공개 category, 공개 tag URL만 포함한다.
- CMS, draft preview, archived 글 URL은 포함하지 않는다.
- 중복 URL을 포함하지 않는다.

## Robots Policy

크롤러 색인 정책과 Sitemap 위치 표현.

**Fields**:

- `userAgent`
- `allow`
- `disallow`
- `sitemapUrl`

**Validation Rules**:

- `sitemapUrl`은 `siteUrl` 기준의 `/sitemap.xml` 절대 URL이어야 한다.
- 비공개 CMS surface는 disallow 대상에 포함되어야 한다.

## OG Image Representation

소셜 공유 이미지 route가 렌더링할 글별 표현 데이터.

**Fields**:

- `title`
- `siteName`
- `categoryLabel`
- `authorName`
- `coverImage`
- `fallback`
- `publicPostUrl`

**Validation Rules**:

- published 글에 대해서만 생성한다.
- 긴 제목, 긴 카테고리, 긴 작성자 이름은 이미지 경계를 넘거나 서로 겹치지 않아야 한다.
- cover image가 없으면 fallback 상태를 명시한다.

## Reading Aid

글 상세에서 독자가 사용하는 본문 보조 정보.

**Fields**:

- `toc`: heading label, depth, anchor 목록
- `readingTimeLabel`: 예상 읽기 시간 표시 문자열

**Validation Rules**:

- TOC anchor는 실제 heading anchor와 일치해야 한다.
- 같은 heading 텍스트가 반복되어도 anchor가 충돌하면 안 된다.
