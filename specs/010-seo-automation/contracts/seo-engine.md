# Contract: SEO Engine

## Scope

`packages/seo-engine`는 콘텐츠와 사이트 metadata를 입력으로 받아 SEO report와 공개 generated output
계산 결과를 반환한다. 이 package는 파일을 읽거나 쓰지 않고, route response를 직접 만들지 않는다.

## Public API

### `createSeoSubject(input)`

Editor document, published post, MDX analysis 결과를 SEO 계산 입력으로 정규화한다.

**Input**:

- `post`: 글 metadata와 body
- `site`: 사이트 이름, URL, 기본 작성자
- `author`: 작성자 profile
- `category`: category label
- `tags`: tag label 목록
- `analysis`: headings, toc, reading time, code/image/link 분석 결과

**Output**:

- `ok: true`, `subject`
- `ok: false`, `issues`

**Failure codes**:

- `missing-title`
- `missing-slug`
- `missing-body`
- `invalid-canonical-url`
- `mdx-analysis-failed`

### `evaluateSeo(subject)`

글 하나의 SEO 점수와 issue 목록을 반환한다.

**Required behavior**:

- score는 0-100 정수다.
- blocking issue가 있어도 가능한 항목의 점수는 계산한다.
- 검사 항목은 H1 존재, H2 2개 이상, meta description 존재, Open Graph metadata 존재, canonical URL
  존재, title 길이 적정, 이미지 alt 텍스트, internal link 1개 이상을 포함한다.
- issue severity는 `blocking`, `warning`, `passed` 중 하나다.

### `generatePageMetadata(subject)`

공개 page metadata를 반환한다.

**Required behavior**:

- title, description, canonical URL, Open Graph, Twitter metadata를 포함한다.
- description fallback은 SEO description, excerpt, site description 순서로 선택한다.
- OG image URL은 발행 글 slug 기준으로 안정적으로 생성한다.

### `generateJsonLd(subject)`

구조화 데이터 미리보기와 공개 출력을 반환한다.

**Required behavior**:

- 글 상세에는 `BlogPosting` 표현을 포함한다.
- 글/분류 탐색에는 `BreadcrumbList` 표현을 포함한다.
- 초안/보관 글 입력은 public output 생성에서 실패해야 한다.

### `generateFeedOutput(site, publishedSubjects)`

RSS channel과 item 목록을 반환한다.

**Required behavior**:

- 입력 subject는 모두 `published` 상태여야 한다.
- item은 title, link, guid, publication date, description을 포함한다.
- 발행 글 0개도 유효한 빈 feed 상태로 반환한다.

### `generateSitemapOutput(site, publishedSubjects, taxonomy)`

Sitemap entry 목록을 반환한다.

**Required behavior**:

- 홈, 발행 글, 발행 글이 연결된 category/tag URL만 포함한다.
- draft/archived/preview-only URL은 포함하지 않는다.
- 각 entry는 loc와 optional last modified 값을 제공한다.

### `generateRobotsPolicy(site)`

robots 정책을 반환한다.

**Required behavior**:

- 기본 정책은 공개 페이지 허용과 sitemap URL을 포함한다.
- CMS, preview-only route, 비공개 route는 색인 대상이 아니다.

### `createOgImagePayload(subject)`

OG image route가 사용할 payload를 반환한다.

**Required behavior**:

- 크기 기준은 1200x630이다.
- title, category, author, site name, cover image/fallback 상태를 포함한다.
- cover image가 없어도 fallback payload를 반환한다.

## Acceptance Criteria

- 같은 입력은 같은 report와 generated output을 반환한다.
- public output API는 non-published subject를 거부하거나 필터링한다.
- API는 repository write, network request, analytics API call을 수행하지 않는다.
