# Contract: Analytics Provider Normalization

GA4와 Google Search Console 원본 조회 결과를 CMS dashboard view model로 정규화하기 위한 provider 계약이다.

## Provider Input

```ts
type AnalyticsProviderRequest = {
  siteUrl: string;
  ga4PropertyId: string;
  searchConsoleProperty: string;
  dateRange: {
    startDate: string;
    endDate: string;
    previousStartDate?: string;
    previousEndDate?: string;
  };
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    canonicalUrl: string;
    status: "published" | "archived";
    publishedAt?: string;
    category?: string;
    tags?: string[];
  }>;
};
```

## Provider Output

```ts
type AnalyticsProviderResult =
  | {
      ok: true;
      generatedAt: string;
      availableThrough: string;
      summary: SitePerformanceSummary;
      postPerformance: PostPerformance[];
      publicationWindows: PublicationPerformanceWindow[];
      warnings: string[];
    }
  | {
      ok: false;
      code: "missing-config" | "unauthorized" | "quota-limited" | "temporary-failure" | "unknown";
      retryable: boolean;
      message: string;
      lastUsableSnapshot?: AnalyticsSnapshot;
    };
```

## Query Responsibilities

- GA4 방문 성과는 page path 또는 canonical URL로 글과 매칭 가능한 형태로 반환해야 한다.
- GSC 검색 성과는 page URL 기준 성과와 query 기준 대표 검색어를 분리해 반환해야 한다.
- 이전 동일 기간 비교가 가능한 경우 summary comparison을 계산해야 한다.
- provider는 quota 또는 일시 장애를 `retryable` 상태로 분류해야 한다.
- provider는 원본 응답에 개인 식별 데이터가 포함되더라도 CMS output으로 전달하지 않아야 한다.

## Error Mapping

| Source Condition | Provider Code | Retryable |
| ---------------- | ------------- | --------- |
| 필수 property 또는 credential 없음 | `missing-config` | false |
| 권한 부족, property 접근 거부 | `unauthorized` | false |
| quota 초과 또는 rate limit | `quota-limited` | true |
| 네트워크 오류, upstream 5xx | `temporary-failure` | true |
| 예상하지 못한 응답 형식 | `unknown` | false |
