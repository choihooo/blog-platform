# Contract: Draft Preview Access

## Purpose

CMS에서 발급한 signed preview token으로만 public blog draft preview를 허용하는 계약이다.

## Token Payload

```ts
type PreviewTokenPayload = {
  slug: string;
  exp: number;
  contentSha: string;
  nonce: string;
};
```

## CMS Issue Flow

- 발행되지 않은 editor document에 대해 preview token을 발급한다.
- token TTL은 발급 시각 기준 최대 30분이다.
- payload는 slug, exp, contentSha, nonce를 포함한다.
- token secret은 client bundle이나 analytics payload에 포함하지 않는다.

## Blog Verify Flow

- `/preview/[slug]`는 URL slug와 token payload slug를 비교한다.
- token signature와 expiration을 검증한다.
- 현재 content identifier와 payload contentSha를 비교한다.
- invalid/expired/stale token은 draft body를 렌더링하지 않는다.
- valid token 응답은 `Cache-Control: private, no-store`를 포함한다.

## Public Boundary Rules

- `/posts/[slug]`는 계속 published-only다.
- RSS, Sitemap, robots, JSON-LD, OG image route는 preview content를 포함하지 않는다.
- analytics event는 preview page view를 public article event로 기록하지 않는다.
- MDX safety validation 실패 시 preview도 렌더링하지 않는다.

## Acceptance

- 유효 token은 30분 이내 같은 slug와 같은 contentSha에서만 preview를 허용한다.
- 30분 이후 token 성공률은 0%다.
- contentSha 변경 후 이전 token 성공률은 0%다.
- preview response의 100%가 private no-store cache policy를 가진다.
