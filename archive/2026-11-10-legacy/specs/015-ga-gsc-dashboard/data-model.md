# Data Model: GA/GSC 성과 대시보드

## AnalyticsConnection

분석 데이터 연결 상태와 권한 검증 결과를 나타낸다.

| Field                   | Type                                                         | Description                    | Validation                    |
| ----------------------- | ------------------------------------------------------------ | ------------------------------ | ----------------------------- |
| `id`                    | string                                                       | 연결 식별자                    | 필수                          |
| `provider`              | `ga4-gsc`                                                    | 연결 provider                  | 필수                          |
| `ga4PropertyId`         | string                                                       | GA4 property 식별자            | 설정된 경우 비어 있으면 안 됨 |
| `searchConsoleProperty` | string                                                       | Search Console property 식별자 | 설정된 경우 비어 있으면 안 됨 |
| `status`                | `connected` \| `missing-config` \| `unauthorized` \| `error` | 연결 상태                      | 필수                          |
| `lastCheckedAt`         | ISO datetime                                                 | 마지막 권한/연결 확인 시각     | 선택                          |
| `message`               | string                                                       | 운영자에게 보여줄 상태 설명    | 오류 시 필수                  |

## AnalyticsSnapshot

대시보드 표시용으로 정규화된 마지막 성공 분석 결과다.

| Field                | Type                           | Description                                   | Validation   |
| -------------------- | ------------------------------ | --------------------------------------------- | ------------ |
| `id`                 | string                         | snapshot 식별자                               | 필수         |
| `range`              | `7d` \| `28d`                  | 조회 기간                                     | 필수         |
| `generatedAt`        | ISO datetime                   | snapshot 생성 시각                            | 필수         |
| `availableThrough`   | ISO date                       | 원본 데이터가 완전하다고 판단되는 마지막 날짜 | 필수         |
| `summary`            | SitePerformanceSummary         | 사이트 전체 요약                              | 필수         |
| `posts`              | PostPerformance[]              | 글별 성과 목록                                | 기본 빈 배열 |
| `publicationWindows` | PublicationPerformanceWindow[] | 발행 후 기간 성과                             | 기본 빈 배열 |
| `warnings`           | string[]                       | quota, 지연, 매칭 문제 경고                   | 기본 빈 배열 |

## SitePerformanceSummary

선택 기간의 사이트 전체 방문/검색 성과다.

| Field               | Type               | Description              | Validation    |
| ------------------- | ------------------ | ------------------------ | ------------- |
| `pageViews`         | number             | 페이지 조회 수           | 0 이상 정수   |
| `activeUsers`       | number             | 활성 사용자 수           | 0 이상 정수   |
| `searchClicks`      | number             | 검색 클릭 수             | 0 이상 정수   |
| `searchImpressions` | number             | 검색 노출 수             | 0 이상 정수   |
| `searchCtr`         | number             | 검색 CTR                 | 0 이상 1 이하 |
| `averagePosition`   | number             | 평균 게재 순위           | 0 이상        |
| `comparison`        | MetricComparison[] | 직전 동일 기간 대비 변화 | 기본 빈 배열  |

## MetricComparison

이전 기간 대비 변화 정보다.

| Field       | Type                     | Description    | Validation |
| ----------- | ------------------------ | -------------- | ---------- |
| `metric`    | string                   | 비교 지표 이름 | 필수       |
| `current`   | number                   | 현재 기간 값   | 필수       |
| `previous`  | number                   | 이전 기간 값   | 필수       |
| `delta`     | number                   | 변화량         | 필수       |
| `direction` | `up` \| `down` \| `flat` | 변화 방향      | 필수       |

## PostPerformance

발행 글 하나에 매칭된 방문/검색 성과다.

| Field               | Type                                  | Description          | Validation          |
| ------------------- | ------------------------------------- | -------------------- | ------------------- |
| `postId`            | string                                | CMS 글 식별자        | 필수                |
| `title`             | string                                | 글 제목              | 필수                |
| `slug`              | string                                | canonical slug       | 필수                |
| `canonicalUrl`      | string                                | 분석 데이터 매칭 URL | 필수                |
| `status`            | `published` \| `archived`             | 분석 표시 대상 상태  | 초안 불가           |
| `publishedAt`       | ISO datetime                          | 발행 시각            | published 글은 필수 |
| `category`          | string                                | 카테고리             | 선택                |
| `tags`              | string[]                              | 태그                 | 기본 빈 배열        |
| `pageViews`         | number                                | 페이지 조회 수       | 0 이상 정수         |
| `activeUsers`       | number                                | 활성 사용자 수       | 0 이상 정수         |
| `searchClicks`      | number                                | 검색 클릭 수         | 0 이상 정수         |
| `searchImpressions` | number                                | 검색 노출 수         | 0 이상 정수         |
| `searchCtr`         | number                                | 검색 CTR             | 0 이상 1 이하       |
| `averagePosition`   | number                                | 평균 게재 순위       | 0 이상              |
| `matchState`        | `matched` \| `partial` \| `unmatched` | 분석 URL 매칭 상태   | 필수                |
| `topQueries`        | SearchQueryPerformance[]              | 대표 검색어          | 기본 빈 배열        |

## SearchQueryPerformance

글 또는 사이트에 연결된 검색어 성과다.

| Field             | Type   | Description    | Validation     |
| ----------------- | ------ | -------------- | -------------- |
| `query`           | string | 검색어         | 빈 문자열 불가 |
| `clicks`          | number | 클릭 수        | 0 이상 정수    |
| `impressions`     | number | 노출 수        | 0 이상 정수    |
| `ctr`             | number | CTR            | 0 이상 1 이하  |
| `averagePosition` | number | 평균 게재 순위 | 0 이상         |

## PublicationPerformanceWindow

발행 후 고정 기간 누적 성과다.

| Field               | Type                                           | Description         | Validation  |
| ------------------- | ---------------------------------------------- | ------------------- | ----------- |
| `postId`            | string                                         | 글 식별자           | 필수        |
| `window`            | `1d` \| `7d` \| `28d`                          | 발행 후 기간        | 필수        |
| `state`             | `complete` \| `pending` \| `insufficient-data` | 기간 상태           | 필수        |
| `pageViews`         | number                                         | 누적 페이지 조회 수 | 0 이상 정수 |
| `activeUsers`       | number                                         | 누적 활성 사용자 수 | 0 이상 정수 |
| `searchClicks`      | number                                         | 누적 검색 클릭 수   | 0 이상 정수 |
| `searchImpressions` | number                                         | 누적 검색 노출 수   | 0 이상 정수 |
| `needsReview`       | boolean                                        | 개선 검토 후보 여부 | 필수        |

## State Rules

- `AnalyticsConnection.status`가 `missing-config`, `unauthorized`, `error`이면 대시보드는 원본 조회
  대신 빈 상태 또는 마지막 성공 snapshot을 표시한다.
- `PostPerformance.status`는 기본 조회에서 `published`만 포함한다. `archived`는 운영자가 필터를
  선택한 경우에만 포함한다.
- `PublicationPerformanceWindow.state`는 발행 후 해당 기간이 지나지 않았으면 `pending`, 데이터
  표본이 부족하면 `insufficient-data`, 계산 가능한 상태면 `complete`다.
- `matchState`가 `unmatched`인 글은 순위/정렬 계산에는 포함하되 매칭 경고 목록에도 표시한다.
