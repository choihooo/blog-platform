# Quickstart: Blog Rendering

## 목적

이 문서는 Blog Rendering 구현 후 public route가 repository content만 사용해 expected output을
만드는지 검증하는 절차다.

## Prerequisites

- repository root에서 `pnpm install`이 완료되어 있어야 한다.
- `content/posts/hello-world.mdx`가 `status: published` 상태로 존재해야 한다.
- `packages/markdown` package validation과 build가 통과해야 한다.

## Validation Commands

```sh
pnpm --filter @blog-platform/blog typecheck
pnpm --filter @blog-platform/blog lint
pnpm --filter @blog-platform/blog build
pnpm build
```

## Scenario 1: Home lists published posts

1. `pnpm dev:blog`를 실행한다.
2. `http://localhost:3000/`을 연다.

Expected outcome:

- site name이 표시된다.
- `Hello World` published 글이 목록에 표시된다.
- 목록 item에는 title, excerpt, published date, author, reading time, category, tag가 가능한
  범위에서 표시된다.
- draft와 archived post는 표시되지 않는다.

## Scenario 2: Post detail renders validated MDX

1. `http://localhost:3000/posts/hello-world`를 연다.

Expected outcome:

- post title, excerpt, author, published date, reading time, taxonomy, body가 표시된다.
- heading이 있으면 TOC가 표시되고 TOC anchor는 rendered heading으로 이동한다.
- unsafe MDX는 공개 body로 렌더링되지 않는다.

## Scenario 3: Public-only direct access

1. draft 또는 archived post fixture를 추가한다.
2. 해당 post slug로 `/posts/[slug]`에 직접 접근한다.

Expected outcome:

- draft 또는 archived content body는 노출되지 않는다.
- route는 not found로 처리된다.

## Scenario 4: Category and tag pages

1. `http://localhost:3000/categories/engineering`을 연다.
2. `http://localhost:3000/tags/mdx`를 연다.

Expected outcome:

- registered taxonomy label이 표시된다.
- matching published post만 표시된다.
- 등록되지 않은 taxonomy slug는 not found로 처리된다.

## Scenario 5: Workspace integration

```sh
pnpm typecheck
pnpm lint
pnpm build
```

Expected outcome:

- Blog Rendering 변경이 CMS app과 shared package build를 깨뜨리지 않는다.
- public blog route generation은 GitHub credential, CMS session, database, object storage 없이
  완료된다.

## 구현 메모

- Public route 구현은 `apps/blog`에 위치한다.
- Content parsing, collection validation, published-only filtering, MDX analysis, TOC, reading
  time은 `packages/markdown` API를 재사용한다.
- RSS, Sitemap, robots.txt, JSON-LD, OG image, SEO score, analytics event는 이 phase에 포함하지
  않는다.
