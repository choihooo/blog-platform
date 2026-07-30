# Quickstart: Generated Outputs

## Prerequisites

- repository root에서 의존성이 설치되어 있어야 한다.
- `content/site.json`에 `siteName`과 절대 `siteUrl`이 있어야 한다.
- `content/posts/*.mdx`에 published, draft, archived 상태 fixture가 있어야 한다.

## Validation Commands

```sh
pnpm --filter @blog-platform/seo-engine typecheck
pnpm --filter @blog-platform/seo-engine lint
pnpm --filter @blog-platform/seo-engine test
pnpm --filter @blog-platform/markdown typecheck
pnpm --filter @blog-platform/markdown lint
pnpm --filter @blog-platform/markdown test
pnpm --filter @blog-platform/blog typecheck
pnpm --filter @blog-platform/blog lint
pnpm --filter @blog-platform/blog test
```

## Scenario 1: 글별 metadata와 JSON-LD

1. published 글 상세를 연다.
2. canonical URL, Open Graph metadata, Twitter metadata가 사이트 URL과 글 slug를 기준으로 생성되는지
   확인한다.
3. `BlogPosting`과 `BreadcrumbList` JSON-LD가 있고 draft/archived 글에는 생성되지 않는지 확인한다.

**Expected Outcome**: published 글 100%가 metadata, JSON-LD, OG image URL을 제공하고 draft/archived 글은
404 또는 공개 산출물 없음으로 처리된다.

## Scenario 2: RSS feed

1. `/rss.xml`을 조회한다.
2. published 글만 최신순으로 포함되는지 확인한다.
3. draft와 archived 글 제목 또는 URL이 포함되지 않는지 확인한다.
4. 발행 글이 0개인 fixture에서 유효한 RSS channel이 반환되는지 확인한다.

**Expected Outcome**: RSS는 public feed reader가 읽을 수 있는 XML이고 비공개 상태 글을 노출하지 않는다.

## Scenario 3: Sitemap과 robots

1. `/sitemap.xml`을 조회한다.
2. 홈, published 글, 공개 category, 공개 tag URL만 포함되는지 확인한다.
3. CMS, preview, draft, archived URL이 없는지 확인한다.
4. `/robots.txt`를 조회해 `Sitemap: <siteUrl>/sitemap.xml` line이 있는지 확인한다.

**Expected Outcome**: 검색 크롤러가 공개 URL만 발견하고 Sitemap 위치를 확인할 수 있다.

## Scenario 4: OG image

1. published 글의 `/og/[slug]`를 조회한다.
2. 대표 이미지가 있는 글은 해당 이미지 정보가 반영되는지 확인한다.
3. 대표 이미지가 없는 글은 fallback 이미지가 반환되는지 확인한다.
4. 긴 제목 fixture에서 제목이 이미지 경계를 넘거나 다른 텍스트와 겹치지 않는지 확인한다.
5. draft 또는 archived slug는 공개 이미지를 반환하지 않는지 확인한다.

**Expected Outcome**: 모든 published 글이 공유 가능한 OG image URL을 가지고, 비공개 상태 글은 공유 이미지
route로 노출되지 않는다.

## Scenario 5: TOC와 reading time

1. heading이 여러 개 있는 published 글 상세를 연다.
2. 목차 항목이 본문 heading과 같은 순서와 depth로 표시되는지 확인한다.
3. 목차 링크를 선택했을 때 실제 heading 위치로 이동하는지 확인한다.
4. reading time label이 본문 내용 기준으로 표시되는지 확인한다.

**Expected Outcome**: 독자는 긴 글에서 목차와 예상 읽기 시간을 안정적으로 사용할 수 있다.

## Scope Guard

이 quickstart는 generated outputs만 검증한다. SEO score, CMS SEO panel, GA4/GTM 이벤트, 외부 분석 콘솔
링크는 이 feature의 통과 조건에 포함하지 않는다.
