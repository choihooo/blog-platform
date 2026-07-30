# Quickstart: SEO 자동화 검증

## Prerequisites

- repository root에서 실행한다.
- `content/site.json`에 `siteName`, `siteUrl`, `analytics.provider`가 존재한다.
- `content/posts/*.mdx`에는 최소 하나의 `published` 글과 draft/archived 검증용 글을 준비한다.
- 이 feature는 `packages/markdown`의 content collection validation과 published-only filtering이 동작하는
  상태를 전제로 한다.

## 1. Shared Package 검증

```sh
pnpm --filter @blog-platform/seo-engine typecheck
pnpm --filter @blog-platform/seo-engine lint
pnpm --filter @blog-platform/seo-engine test
pnpm --filter @blog-platform/analytics typecheck
pnpm --filter @blog-platform/analytics lint
pnpm --filter @blog-platform/analytics test
```

Expected outcome:

- SEO report는 같은 입력에 대해 같은 score와 issue를 반환한다.
- public output API는 non-published subject를 공개 산출물에 포함하지 않는다.
- analytics payload에는 개인 식별 정보가 포함되지 않는다.
- disabled provider는 오류 없이 disabled result를 반환한다.

## 2. Public Blog Generated Output 검증

```sh
pnpm --filter @blog-platform/blog typecheck
pnpm --filter @blog-platform/blog lint
pnpm --filter @blog-platform/blog build
```

Expected outcome:

- `/rss.xml`은 발행 글만 포함하는 RSS feed를 반환한다.
- `/sitemap.xml`은 홈, 발행 글, 발행 글이 연결된 category/tag URL만 포함한다.
- `/robots.txt`는 sitemap URL과 public indexing policy를 반환한다.
- `/og/[slug]`는 발행 글에 대해 image response를 반환하고 draft/archived/unknown slug는 `404`를 반환한다.
- 글 상세 route는 canonical, Open Graph, Twitter metadata, JSON-LD를 제공한다.

## 3. CMS SEO Panel 검증

```sh
pnpm --filter @blog-platform/cms typecheck
pnpm --filter @blog-platform/cms lint
pnpm --filter @blog-platform/cms test
```

Expected outcome:

- SEO metadata가 완성된 샘플 글은 90점 이상을 표시한다.
- 필수 metadata가 누락된 샘플 글은 blocking issue를 표시한다.
- SEO panel은 검색 미리보기, 공유 미리보기, JSON-LD preview를 보여준다.
- 발행 글은 공개 글, GA4, Search Console 외부 링크를 표시한다.
- disabled analytics provider에서는 외부 콘솔 링크의 비활성 이유를 보여준다.

## 4. End-to-End 수동 확인

```sh
pnpm dev:blog
pnpm dev:cms
```

Expected outcome:

- `http://localhost:3000/rss.xml`과 `http://localhost:3000/sitemap.xml`에서 draft/archived 글이 보이지
  않는다.
- 발행 글 상세 페이지의 page metadata와 JSON-LD가 글 metadata를 반영한다.
- CMS editor에서 글 제목, excerpt, cover image, heading, alt 텍스트를 바꾸면 SEO report가 현재 입력
  기준으로 바뀐다.
- CMS는 분석 지표 값을 직접 표시하지 않고 외부 콘솔 링크만 제공한다.

## 5. Scope Guard 확인

다음 항목은 이 feature에서 생기면 안 된다.

- `rss.xml`, `sitemap.xml`, `robots.txt`, OG image generated file commit
- GA4/Search Console API 기반 지표 dashboard
- 자체 분석 database/cache
- AI 기반 SEO 제목, 설명, 키워드 생성
- 내부 링크 자동 추천 또는 ranking 추천
