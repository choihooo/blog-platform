# Contract: Analytics Events

## Purpose

`packages/analytics`가 소유하는 canonical event, provider 초기화, provider payload 변환 계약이다.

## Event Names

```txt
article_view
scroll_50
scroll_90
code_copy
toc_click
internal_link_click
external_link_click
search
share
```

## Provider Initialization

### Input

```ts
type AnalyticsConfig = {
  provider: "ga4" | "gtm" | "disabled" | string;
  measurementId?: string;
  containerId?: string;
  ga4PropertyId?: string;
  searchConsoleProperty?: string;
};
```

### Output

```ts
type ProviderInit =
  | { ok: true; provider: "ga4"; measurementId: string }
  | { ok: true; provider: "gtm"; containerId: string }
  | { ok: false; provider: "disabled"; reason: string };
```

### Rules

- `ga4`는 `measurementId`가 있을 때만 `ok: true`다.
- `gtm`은 `containerId`가 있을 때만 `ok: true`다.
- 그 외 provider 또는 누락된 id는 disabled 결과를 반환한다.

## Blog Event Input

```ts
type BlogEventInput = {
  name: BlogEventName;
  slug: string;
  title?: string;
  url: string;
  category?: string;
  tags?: string[];
  target?: string;
  occurredAt: string;
  provider: string;
};
```

## Provider Payload

GA4 payload:

```ts
type Ga4Payload = {
  ok: true;
  provider: "ga4";
  event: BlogEventName;
  params: {
    slug: string;
    title?: string;
    url: string;
    category?: string;
    tags: string[];
    target?: string;
  };
};
```

GTM payload:

```ts
type GtmPayload = {
  ok: true;
  provider: "gtm";
  dataLayer: {
    event: BlogEventName;
    slug: string;
    title?: string;
    url: string;
    category?: string;
    tags: string[];
    target?: string;
  };
};
```

Disabled payload:

```ts
type DisabledPayload = {
  ok: false;
  provider: "disabled";
  reason: string;
};
```

## Validation Contract

- unknown event name, missing slug, missing URL, disabled provider는 disabled payload가 된다.
- `search` 이벤트는 trim된 검색어가 있을 때만 valid하다.
- payload는 공개 글 맥락만 포함하고 개인 식별 정보, CMS session, GitHub token, secret을 포함하지 않는다.
- provider 변환은 외부 네트워크 호출 없이 순수 변환으로 검증 가능해야 한다.
