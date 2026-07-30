# Data Model: SEO 자동화

## SEO Subject

SEO 점검과 공개 산출물 생성의 입력이 되는 글 단위 표현이다.

**Fields**:

- `path`: repository 안의 글 파일 위치
- `status`: `draft`, `published`, `archived`
- `title`: 글 제목
- `slug`: 공개 URL slug
- `excerpt`: 검색/공유 설명의 기본 입력
- `seoTitle`: 선택적 검색 제목 override
- `seoDescription`: 선택적 검색 설명 override
- `canonicalUrl`: 선택적 canonical override
- `author`: 작성자 식별자
- `publishedAt`: 최초 발행 시각
- `updatedAt`: 수정 시각
- `category`: category slug
- `tags`: tag slug 목록
- `coverImage`: 대표 이미지 URL 또는 media path
- `body`: MDX 본문
- `headings`: 분석된 heading 목록
- `toc`: Table of Contents
- `readingTime`: 읽기 시간
- `imageAltTexts`: 본문과 대표 이미지의 alt 텍스트 상태
- `internalLinks`: 본문 안 공개 내부 링크 목록

**Validation Rules**:

- `published` 글은 `title`, `slug`, `author`, `publishedAt`, 본문을 가져야 한다.
- 공개 산출물 입력은 `published` 글만 허용한다.
- `canonicalUrl`이 있을 경우 절대 URL이어야 하며, 없으면 사이트 URL과 slug로 생성한다.
- title과 description 길이는 SEO report에서 적정/경고 상태로 평가한다.
- body가 비어 있거나 MDX 분석에 실패하면 발행 차단 오류로 분류한다.

## SEO Report

CMS가 운영자에게 보여주는 글별 SEO 점검 결과다.

**Fields**:

- `score`: 0-100 결정적 점수
- `status`: `blocking`, `warning`, `pass`
- `blockingIssues`: 발행 전 해결해야 하는 문제
- `warnings`: 발행은 가능하지만 개선이 필요한 문제
- `passedChecks`: 통과한 검사
- `searchPreview`: 검색 결과 미리보기
- `socialPreview`: 공유 미리보기
- `jsonLdPreview`: 구조화 데이터 미리보기
- `generatedUrls`: canonical, OG image, public URL
- `evaluatedAt`: 점검 시각

**Validation Rules**:

- `score`는 항상 0 이상 100 이하 정수다.
- `blockingIssues`가 하나 이상이면 `status`는 `blocking`이다.
- `blockingIssues`가 없고 `warnings`가 하나 이상이면 `status`는 `warning`이다.
- 모든 issue는 code, severity, message, target field를 포함한다.
- report는 같은 입력에 대해 같은 score와 issue set을 반환해야 한다.

## Generated SEO Output

공개 블로그가 발행 콘텐츠에서 요청 시 생성하는 산출물이다.

**Fields**:

- `pageMetadata`: title, description, canonical, Open Graph, Twitter metadata
- `blogPostingJsonLd`: 글 상세 구조화 데이터
- `breadcrumbJsonLd`: 글/분류 탐색 구조화 데이터
- `rssChannel`: 사이트 feed metadata와 최신 발행 글 item
- `sitemapEntries`: 홈, 글, category, tag 공개 URL entry
- `robotsPolicy`: 공개 색인 정책과 Sitemap 위치
- `ogImagePayload`: 1200x630 공유 이미지 생성을 위한 제목, category, author, cover image, fallback 정보

**Validation Rules**:

- 초안과 보관 글은 어떤 public output collection에도 포함되지 않는다.
- RSS item과 Sitemap entry는 공개 URL을 가져야 한다.
- OG image payload는 cover image가 없어도 fallback layout 정보를 가져야 한다.
- 모든 XML/HTML-facing string은 serialization 시 안전하게 escape되어야 한다.

## Analytics Event

공개 독자 행동을 외부 분석 provider로 보내기 위한 이벤트 표현이다.

**Fields**:

- `name`: `page_view`, `post_read`, `heading_navigate`, `external_link_click`, `share_attempt`
- `slug`: 관련 글 slug
- `url`: 공개 URL
- `category`: 글 category slug
- `tags`: tag slug 목록
- `occurredAt`: 이벤트 발생 시각
- `provider`: `ga4`, `gtm`, `disabled`

**Validation Rules**:

- 개인 식별 정보, CMS session, GitHub login/user id는 포함하지 않는다.
- `disabled` provider에서는 이벤트 전송 payload를 만들지 않는다.
- draft/archived/preview-only 콘텐츠에 대한 analytics event는 만들지 않는다.

## External Console Link

CMS에서 발행 글 성과를 외부 도구에서 확인하기 위한 링크 묶음이다.

**Fields**:

- `publicPostUrl`: 공개 글 URL
- `ga4Url`: GA4 페이지 보고서 링크
- `searchConsoleUrl`: Search Console URL inspection 또는 페이지 성과 링크
- `disabledReasons`: provider/site 설정 부족 시 비활성 이유

**Validation Rules**:

- 발행 글과 유효한 site URL이 있을 때만 `publicPostUrl`을 활성화한다.
- GA4/Search Console 링크는 설정값이 부족하면 비활성 상태와 이유를 반환한다.
- 외부 링크 생성은 분석 API 호출이나 인증 credential을 요구하지 않는다.

## State Transitions

```text
Editor Document
  -> SEO Subject
  -> SEO Report
  -> CMS SEO Panel

Published Content Collection
  -> Published SEO Subject[]
  -> Generated SEO Output
  -> Public route response

Published Public Page Interaction
  -> Analytics Event
  -> Provider payload or disabled state

Published Post
  -> External Console Link
  -> CMS link group
```
