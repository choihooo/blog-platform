# Contract: CMS Analytics Links

## Purpose

`apps/cms`가 발행 글 editor surface에서 공개 글, GA4 페이지 성과, Search Console 검색 성과 링크를 제공하는
계약이다.

## Input

```ts
type CmsAnalyticsLinkInput = {
  siteUrl: string;
  post: {
    status: "draft" | "published" | "archived" | string;
    slug?: string;
    title?: string;
  };
  analytics: {
    provider: "ga4" | "gtm" | "disabled" | string;
    ga4PropertyId?: string;
    searchConsoleProperty?: string;
  };
};
```

## Output

```ts
type ExternalConsoleLinks = {
  publicPostUrl?: string;
  ga4Url?: string;
  searchConsoleUrl?: string;
  disabledReasons: string[];
};
```

## Rules

- `post.status !== "published"`이면 글별 public/analytics links를 만들지 않는다.
- `siteUrl`이 유효하지 않거나 `post.slug`가 없으면 `publicPostUrl`을 만들지 않는다.
- `ga4PropertyId`가 없으면 `ga4Url`을 만들지 않고 disabled reason을 제공한다.
- `searchConsoleProperty`가 없으면 `searchConsoleUrl`을 만들지 않고 disabled reason을 제공한다.
- 외부 콘솔 링크 생성은 GA4/Search Console API 호출을 수행하지 않는다.
- 링크는 새 탐색 대상으로 사용할 수 있어야 하며, CMS mutation이나 저장 상태를 변경하지 않는다.

## Expected Link Semantics

- `publicPostUrl`: `<site origin>/posts/<slug>`
- `ga4Url`: GA4 property와 public post URL을 기준으로 페이지 성과를 찾기 쉬운 외부 콘솔 URL
- `searchConsoleUrl`: Search Console property와 public post URL을 기준으로 검색 성과를 찾기 쉬운 외부
  콘솔 URL
