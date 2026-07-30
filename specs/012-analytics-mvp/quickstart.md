# Quickstart: Analytics MVP

## Prerequisites

- `pnpm install` 완료
- `content/site.json`에 `analytics.provider`가 `ga4`, `gtm`, 또는 disabled 상태로 설정되어 있음
- GA4 검증 시 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 설정
- GTM 검증 시 `NEXT_PUBLIC_GTM_ID` 설정
- CMS 외부 링크 검증 시 GA4 property id와 Search Console property 설정을 테스트 fixture 또는 site
  config에 제공

## Validation Commands

```sh
pnpm --filter @blog-platform/analytics typecheck
pnpm --filter @blog-platform/analytics lint
pnpm --filter @blog-platform/analytics test

pnpm --filter @blog-platform/blog typecheck
pnpm --filter @blog-platform/blog lint
pnpm --filter @blog-platform/blog test

pnpm --filter @blog-platform/cms typecheck
pnpm --filter @blog-platform/cms lint
pnpm --filter @blog-platform/cms test
```

## Scenario 1: Provider activation

1. GA4 provider와 measurement id가 있는 설정으로 provider 초기화를 검증한다.
2. GTM provider와 container id가 있는 설정으로 provider 초기화를 검증한다.
3. provider id가 누락된 설정으로 disabled 결과와 reason을 검증한다.

Expected outcome:

- 설정된 provider만 `ok: true`가 된다.
- 누락된 id나 알 수 없는 provider는 공개 페이지 실패 없이 disabled로 정규화된다.

## Scenario 2: Event payload contract

1. `article_view`, `scroll_50`, `scroll_90`, `code_copy`, `toc_click`, `internal_link_click`,
   `external_link_click`, `search`, `share` 입력을 만든다.
2. GA4 payload와 GTM payload 변환을 각각 검증한다.
3. unknown event, missing slug, missing URL, 빈 검색어가 disabled 또는 invalid 결과가 되는지
   검증한다.

Expected outcome:

- MVP 이벤트 9종이 canonical name 그대로 provider payload에 들어간다.
- payload에는 공개 글 맥락만 포함된다.

## Scenario 3: Public blog interaction binding

1. 발행 글 상세를 렌더링한다.
2. page display에서 `article_view`가 한 번만 만들어지는지 확인한다.
3. 스크롤 진행률을 50%, 90%, 다시 50%, 다시 90%로 바꾸는 테스트를 실행한다.
4. 코드 복사, 목차 클릭, 내부 링크, 외부 링크, 검색, 공유 상호작용을 실행한다.

Expected outcome:

- 스크롤 milestone은 각각 최대 한 번만 전송된다.
- 내부/외부 링크가 origin 기준으로 구분된다.
- provider disabled 상태에서도 페이지와 상호작용은 실패하지 않는다.

## Scenario 4: CMS external links

1. draft 글에 대해 analytics links를 생성한다.
2. published 글과 유효한 site URL에 대해 public post URL을 생성한다.
3. GA4 property id가 있는 설정에서 GA4 URL 생성을 검증한다.
4. Search Console property가 있는 설정에서 Search Console URL 생성을 검증한다.
5. slug나 site URL이 없는 published 글에서 disabled reason을 검증한다.

Expected outcome:

- draft/archived/slug 없음 상태에서는 잘못된 public URL이 제공되지 않는다.
- 발행 글은 공개 글, GA4, Search Console 외부 이동 링크를 제공하거나 명확한 비활성 이유를 제공한다.
- 외부 API 조회나 분석 데이터 저장 없이 URL 생성만 수행한다.

## Scenario 5: Scope guard

1. 변경 diff에서 자체 분석 DB, 자체 대시보드, GA4/Search Console API 조회, 서버 측 이벤트 수집
   route가 추가되지 않았는지 확인한다.
2. 공개 analytics payload에 secret, GitHub token, CMS session, 관리자 identity가 포함되지 않는지
   fixture로 검증한다.

Expected outcome:

- MVP 범위는 GA4/GTM event emission과 CMS external links로 제한된다.
- 공개 블로그의 draft/archived 차단 정책은 변경되지 않는다.

## Validation Results

2026-07-30 실행 결과:

- `pnpm --filter @blog-platform/analytics typecheck`: 통과
- `pnpm --filter @blog-platform/analytics lint`: 통과
- `pnpm --filter @blog-platform/analytics test`: 통과, 5 files / 7 tests
- `pnpm --filter @blog-platform/blog typecheck`: 통과
- `pnpm --filter @blog-platform/blog lint`: 통과
- `pnpm --filter @blog-platform/blog test`: 통과, 8 files / 14 tests
- `pnpm --filter @blog-platform/cms typecheck`: 통과
- `pnpm --filter @blog-platform/cms lint`: 통과
- `pnpm --filter @blog-platform/cms test`: 통과, 52 files / 85 tests

Scope guard:

- 자체 분석 저장소 추가 없음
- 자체 분석 대시보드 추가 없음
- GA4 Data API 또는 Search Console API 조회 추가 없음
- 서버 측 이벤트 수집 route 추가 없음
