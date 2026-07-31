# Contract: Public Output Routes

`apps/blog`는 shared package의 생성 결과를 공개 route와 글 상세 page에 연결한다. 모든 route는 공개
콘텐츠만 노출해야 하며 GitHub credential, CMS session, 별도 database를 요구하지 않는다.

## `GET /rss.xml`

**Content-Type**: `application/rss+xml; charset=utf-8`

**Input Source**:

- `content/site.json`
- `content/posts/*.mdx` 중 published 글

**Expected Behavior**:

- 최신 published 글을 최신순으로 포함한다.
- draft와 archived 글을 포함하지 않는다.
- 발행 글이 0개여도 유효한 RSS channel을 반환한다.

## `GET /sitemap.xml`

**Content-Type**: `application/xml; charset=utf-8`

**Input Source**:

- `content/site.json`
- published 글
- 공개 category/tag metadata

**Expected Behavior**:

- 홈, published 글, 공개 category, 공개 tag URL을 포함한다.
- draft, archived, CMS, preview URL을 포함하지 않는다.
- 중복 URL을 포함하지 않는다.

## `GET /robots.txt`

**Content-Type**: `text/plain; charset=utf-8`

**Input Source**:

- `content/site.json`

**Expected Behavior**:

- 공개 블로그 색인 정책을 제공한다.
- `/sitemap.xml` 절대 URL을 포함한다.
- CMS와 preview 표면을 색인하지 않도록 표현한다.

## `GET /og/[slug]`

**Content-Type**: image response

**Input Source**:

- slug와 일치하는 published 글
- `content/site.json`
- author/category/tag metadata

**Expected Behavior**:

- published 글에 대해서만 공유 이미지를 반환한다.
- draft 또는 archived slug는 공개 이미지를 반환하지 않는다.
- 대표 이미지가 있으면 이미지 payload에 반영한다.
- 대표 이미지가 없으면 fallback visual을 반환한다.
- 긴 제목은 이미지 경계 안에서 줄바꿈되고 다른 텍스트와 겹치지 않는다.

## Post Detail Metadata

**Surface**: `GET /posts/[slug]`

**Expected Behavior**:

- published 글 상세는 canonical, Open Graph, Twitter metadata, `BlogPosting`, `BreadcrumbList`
  JSON-LD를 제공한다.
- draft 또는 archived slug는 404이며 metadata/JSON-LD를 제공하지 않는다.
- 글 상세에는 TOC와 reading time이 표시된다.
- TOC link는 실제 heading anchor와 일치한다.

## Route-Level Validation

- route tests는 published/draft/archived fixture를 모두 포함해야 한다.
- RSS/Sitemap/robots response는 content type과 핵심 body line을 검증해야 한다.
- OG image route는 존재하는 published slug, 긴 제목 slug, 대표 이미지 없는 slug, draft slug를
  검증해야 한다.
- 글 상세 rendering test는 metadata/JSON-LD presence와 TOC/reading time 표시를 검증해야 한다.
