# Contract: Analytics Events and External Links

## Scope

`packages/analytics`는 public blog 이벤트 payload와 CMS external console link를 생성한다. 이 package는
분석 API에서 데이터를 조회하거나 자체 저장소에 이벤트를 저장하지 않는다.

## Event Names

- `page_view`: 공개 page 조회
- `post_read`: 글 본문 읽기 도달
- `heading_navigate`: TOC 또는 heading anchor 이동
- `external_link_click`: 외부 링크 클릭
- `share_attempt`: 공유 동작 시도

## Event Payload

**Fields**:

- `name`
- `slug`
- `url`
- `category`
- `tags`
- `occurredAt`
- `provider`

**Privacy Rules**:

- GitHub login, immutable user id, CMS session, email, IP address, raw user agent를 포함하지 않는다.
- draft/archived/preview-only 콘텐츠 이벤트를 만들지 않는다.
- provider가 `disabled`이면 전송 가능한 payload를 만들지 않고 disabled result를 반환한다.

## Provider Behavior

### GA4

- page/post event를 GA4-compatible event name과 parameters로 매핑한다.
- measurement id가 없으면 disabled result를 반환한다.

### GTM

- event를 data layer compatible payload로 매핑한다.
- container id가 없으면 disabled result를 반환한다.

### Disabled

- public blog UI와 route 동작은 유지한다.
- 이벤트 전송은 생략한다.
- CMS에는 설정 부족 이유를 제공한다.

## External Console Links

### `createExternalConsoleLinks(input)`

**Input**:

- `siteUrl`
- `postSlug`
- `provider`
- optional GA4 measurement/property hint
- optional Search Console site property hint

**Output**:

- `publicPostUrl`
- `ga4Url` 또는 disabled reason
- `searchConsoleUrl` 또는 disabled reason

**Required behavior**:

- 링크 생성은 외부 API 호출을 수행하지 않는다.
- 발행 글 URL이 유효하지 않으면 모든 글별 링크를 비활성화한다.
- GA4/Search Console 설정이 부족해도 public post link는 제공할 수 있다.

## Acceptance Criteria

- 정상 설정에서 합의된 이벤트의 95% 이상이 slug와 public URL을 포함한 payload로 변환된다.
- 개인 식별 정보가 payload에 포함되는 테스트 사례는 모두 실패해야 한다.
- CMS link group은 외부 콘솔 API credential 없이 생성된다.
