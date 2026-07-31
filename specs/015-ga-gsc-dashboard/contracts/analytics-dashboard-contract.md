# Contract: CMS Analytics Dashboard

CMS 분석 화면이 loader에서 받아 표시해야 하는 view model 계약이다.

## Dashboard Input

| Field      | Required | Description                                                                                                    |
| ---------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `range`    | No       | `7d` 또는 `28d`. 기본값은 `28d`                                                                                |
| `status`   | No       | `published` 또는 `archived`. 기본값은 `published`                                                              |
| `category` | No       | 카테고리 slug 필터                                                                                             |
| `tag`      | No       | 태그 slug 필터                                                                                                 |
| `sort`     | No       | `pageViews`, `activeUsers`, `searchClicks`, `searchImpressions`, `searchCtr`, `averagePosition`, `publishedAt` |

## Dashboard Output

```ts
type AnalyticsDashboardView = {
  connection: {
    status: "connected" | "missing-config" | "unauthorized" | "error";
    lastCheckedAt?: string;
    message?: string;
  };
  range: "7d" | "28d";
  generatedAt?: string;
  availableThrough?: string;
  summary: {
    pageViews: number;
    activeUsers: number;
    searchClicks: number;
    searchImpressions: number;
    searchCtr: number;
    averagePosition: number;
    comparison: Array<{
      metric: string;
      current: number;
      previous: number;
      delta: number;
      direction: "up" | "down" | "flat";
    }>;
  };
  posts: Array<{
    postId: string;
    title: string;
    slug: string;
    canonicalUrl: string;
    status: "published" | "archived";
    publishedAt?: string;
    pageViews: number;
    activeUsers: number;
    searchClicks: number;
    searchImpressions: number;
    searchCtr: number;
    averagePosition: number;
    matchState: "matched" | "partial" | "unmatched";
    topQueries: Array<{
      query: string;
      clicks: number;
      impressions: number;
      ctr: number;
      averagePosition: number;
    }>;
  }>;
  publicationWindows: Array<{
    postId: string;
    window: "1d" | "7d" | "28d";
    state: "complete" | "pending" | "insufficient-data";
    pageViews: number;
    activeUsers: number;
    searchClicks: number;
    searchImpressions: number;
    needsReview: boolean;
  }>;
  externalLinks: {
    ga4?: string;
    searchConsole?: string;
  };
  warnings: string[];
};
```

## Acceptance Rules

- `connection.status !== "connected"`이면 `summary`, `posts`, `publicationWindows`는 빈 값 또는
  마지막 성공 snapshot이어야 한다.
- `warnings`에는 quota, 권한, 날짜 지연, URL 매칭 실패를 사용자에게 설명할 수 있는 문구가 포함되어야
  한다.
- 초안 글은 output에 포함되면 안 된다.
- 모든 수치는 방문자 개인을 식별할 수 없는 집계값이어야 한다.
