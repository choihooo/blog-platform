# Contract: Public Blog Routes

## 목적

`apps/blog`는 repository-backed content를 공개 방문자가 읽을 수 있는 route로 제공한다. 이 계약은
route 별 공개 노출 정책과 `packages/markdown` shared contract 사용 경계를 정의한다.

## Shared Input Contract

Public blog routes consume a validated content collection equivalent to:

```ts
interface ContentCollectionInput {
  posts: Array<{ path: string; source: string }>;
  authors: Array<{ path: string; source: string }>;
  categoriesJson: string;
  tagsJson: string;
  siteJson: string;
}
```

### Contract

- `content/posts/*.mdx`와 `content/authors/*.md` 파일은 repository-relative path와 source로 읽는다.
- `content/categories.json`, `content/tags.json`, `content/site.json`은 full JSON source로 읽는다.
- public route data를 만들기 전 `validateContentCollection`을 실행한다.
- post list와 public route는 `getPublishedPosts` 결과만 사용한다.
- MDX body는 public rendering 전에 `analyzeMdx`를 통과해야 한다.

## `GET /`

### Purpose

Published 글 발견을 위한 public home page다.

### Public Output

- Site name
- Published post list sorted by most recent `publishedAt`
- For each post when available:
  - title
  - excerpt
  - author name
  - published date
  - reading time
  - category label
  - tag labels
  - link to `/posts/[slug]`

### Public Policy

- `draft`와 `archived` post는 표시하지 않는다.
- Invalid collection은 public output을 만들지 않고 실패해야 한다.
- Published post가 없으면 empty state를 표시할 수 있다.

## `GET /posts/[slug]`

### Purpose

Published 글 본문을 읽는 detail page다.

### Public Output

- title
- excerpt when available
- author name
- published date
- reading time
- category/tag links
- table of contents when headings exist
- validated MDX body

### Public Policy

- Matching `published` post가 없으면 not found로 처리한다.
- Matching post가 `draft` 또는 `archived`이면 not found로 처리한다.
- MDX syntax, safety, unsupported component failure가 있으면 rendered body를 노출하지 않는다.
- TOC link target은 rendered heading anchor와 일치해야 한다.

## `GET /categories/[slug]`

### Purpose

Registered category별 published 글을 탐색하는 page다.

### Public Output

- Category label
- Category description when available
- Matching published post list

### Public Policy

- Registry에 없는 category slug는 not found로 처리한다.
- Matching list에는 같은 category를 참조하는 published post만 포함한다.
- Registered category에 matching published post가 없으면 empty state를 표시할 수 있다.

## `GET /tags/[slug]`

### Purpose

Registered tag별 published 글을 탐색하는 page다.

### Public Output

- Tag label
- Tag description when available
- Matching published post list

### Public Policy

- Registry에 없는 tag slug는 not found로 처리한다.
- Matching list에는 해당 tag를 참조하는 published post만 포함한다.
- Registered tag에 matching published post가 없으면 empty state를 표시할 수 있다.

## Non-Goals

- CMS authentication or preview routes
- GitHub API read/write integration
- RSS, Sitemap, robots.txt, JSON-LD, Open Graph image generation
- SEO score calculation
- Analytics event emission
- Search, archive pagination, or newsletter capture
