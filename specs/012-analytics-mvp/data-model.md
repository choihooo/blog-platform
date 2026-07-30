# Data Model: Analytics MVP

## BlogEventName

공개 블로그에서 발행 가능한 canonical 이벤트 이름.

### Values

- `article_view`
- `scroll_50`
- `scroll_90`
- `code_copy`
- `toc_click`
- `internal_link_click`
- `external_link_click`
- `search`
- `share`

### Validation Rules

- 위 목록 밖의 이벤트 이름은 provider payload로 변환하지 않는다.
- 이벤트 이름은 GA4/GTM 모두에서 같은 canonical name을 사용한다.

## ArticleAnalyticsContext

분석 이벤트와 CMS 외부 링크에 공통으로 쓰이는 공개 글 맥락.

### Fields

- `slug`: 공개 글 slug. 발행 글에만 필수.
- `title`: 공개 글 제목.
- `url`: canonical public URL.
- `category`: 선택적 대표 category.
- `tags`: 선택적 tag 목록.
- `author`: 선택적 작성자 식별자.
- `status`: 글 상태.

### Validation Rules

- `status`가 `published`가 아니면 public analytics context를 만들지 않는다.
- `slug` 또는 `url`이 없으면 글별 이벤트와 외부 링크를 만들지 않는다.
- 개인 식별 정보, CMS session, GitHub token, 관리자 identity는 포함하지 않는다.

## BlogEvent

외부 provider로 전달되기 전의 정규화된 독자 행동 이벤트.

### Fields

- `name`: `BlogEventName`.
- `article`: `ArticleAnalyticsContext`에서 파생한 공개 글 맥락.
- `target`: 이벤트 대상. heading id, URL, code block id, search query, share target 같은 비민감 값.
- `occurredAt`: 이벤트 발생 시각.
- `provider`: `ga4`, `gtm`, `disabled` 중 하나.

### Validation Rules

- provider가 `disabled`면 외부 payload를 만들지 않는다.
- `search` 이벤트는 trim 후 빈 검색어면 만들지 않는다.
- `internal_link_click`과 `external_link_click`은 link classification 결과에 맞는 경우에만 만든다.
- `code_copy`는 복사 성공 후에만 만든다.

## AnalyticsProviderSetting

사이트 분석 provider와 공개 식별자 상태.

### Fields

- `provider`: `ga4`, `gtm`, `disabled` 또는 알 수 없는 값.
- `measurementId`: GA4 수집용 공개 id.
- `containerId`: GTM 수집용 공개 id.
- `ga4PropertyId`: CMS GA4 console link용 선택 id.
- `searchConsoleProperty`: CMS Search Console link용 선택 property id.

### Validation Rules

- provider가 `ga4`이고 `measurementId`가 있을 때만 GA4 event emission을 활성화한다.
- provider가 `gtm`이고 `containerId`가 있을 때만 GTM event emission을 활성화한다.
- 알 수 없는 provider 또는 누락된 id는 disabled 상태와 이유로 정규화한다.
- GA4와 GTM을 동시에 활성화하지 않는다.

## ScrollMilestoneState

한 글 페이지 표시 동안 스크롤 milestone 전송 여부를 나타내는 일시적 상태.

### Fields

- `articleSlug`: 현재 글 slug.
- `sent50`: 50% milestone 전송 여부.
- `sent90`: 90% milestone 전송 여부.

### State Transitions

- 새 글 context가 시작되면 `sent50=false`, `sent90=false`로 초기화한다.
- 본문 스크롤 진행률이 50% 이상이고 `sent50=false`면 `scroll_50` 이벤트를 만들고 `sent50=true`가 된다.
- 본문 스크롤 진행률이 90% 이상이고 `sent90=false`면 `scroll_90` 이벤트를 만들고 `sent90=true`가 된다.
- 같은 articleSlug 안에서는 true가 된 milestone을 false로 되돌리지 않는다.

## LinkClassification

클릭 URL이 내부 링크, 외부 링크, 무시 대상인지 나타내는 분류 결과.

### Fields

- `kind`: `internal`, `external`, `ignored`.
- `url`: 정규화된 URL 또는 원본 href.
- `reason`: ignored인 경우의 이유.

### Validation Rules

- 사이트 origin과 같은 http/https URL 또는 root-relative URL은 internal이다.
- 사이트 origin과 다른 http/https URL은 external이다.
- hash-only, mailto, tel, 빈 href, 파싱 불가능한 값은 ignored이다.

## ExternalConsoleLinks

CMS에서 발행 글 기준으로 제공하는 외부 이동 링크.

### Fields

- `publicPostUrl`: 공개 글 URL.
- `ga4Url`: GA4 페이지 성과 화면 URL.
- `searchConsoleUrl`: Search Console 검색 성과 화면 URL.
- `disabledReasons`: 만들 수 없는 링크의 이유 목록.

### Validation Rules

- 글 상태가 `published`가 아니면 글별 링크를 만들지 않는다.
- site URL 또는 slug가 없으면 publicPostUrl을 만들지 않는다.
- `ga4PropertyId`가 없으면 `ga4Url`을 만들지 않고 이유를 제공한다.
- `searchConsoleProperty`가 없으면 `searchConsoleUrl`을 만들지 않고 이유를 제공한다.
