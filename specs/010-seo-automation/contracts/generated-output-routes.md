# Contract: Generated Output Routes

## Scope

`apps/blog`는 `packages/seo-engine` 결과를 HTTP 응답으로 직렬화한다. route는 public content loading,
published-only selection, content-type, status code, response serialization을 책임진다.

## Routes

### `GET /rss.xml`

**Input**: 없음

**Behavior**:

- repository content collection을 읽고 published posts만 feed item으로 포함한다.
- 발행 글이 없어도 유효한 RSS channel을 반환한다.
- XML escaping은 title, description, URL에 적용한다.

**Response**:

- `200`
- `content-type: application/rss+xml; charset=utf-8`

### `GET /sitemap.xml`

**Input**: 없음

**Behavior**:

- 홈, 발행 글, 발행 글이 연결된 category/tag URL만 포함한다.
- draft와 archived 글의 URL은 포함하지 않는다.
- category/tag는 발행 글이 하나 이상 연결될 때만 포함한다.

**Response**:

- `200`
- `content-type: application/xml; charset=utf-8`

### `GET /robots.txt`

**Input**: 없음

**Behavior**:

- public page allow policy와 sitemap URL을 반환한다.
- CMS와 preview-only route는 public indexing 대상이 아니다.

**Response**:

- `200`
- `content-type: text/plain; charset=utf-8`

### `GET /og/[slug]`

**Input**:

- `slug`: 발행 글 slug

**Behavior**:

- slug가 발행 글과 일치하면 1200x630 OG image를 반환한다.
- cover image가 없으면 fallback layout을 사용한다.
- slug가 없거나 draft/archived 글이면 `404`를 반환한다.
- 긴 제목은 이미지 영역 안에서 줄바꿈되어야 한다.

**Response**:

- `200` with image content for published post
- `404` for unknown or non-public post

## Metadata Integration

글 상세, category, tag route는 SEO engine의 page metadata와 JSON-LD 결과를 사용한다.

**Required behavior**:

- 글 상세 metadata는 canonical, Open Graph, Twitter metadata를 포함한다.
- 글 상세 HTML에는 `BlogPosting` JSON-LD와 breadcrumb JSON-LD가 포함된다.
- category/tag metadata는 해당 taxonomy의 label/description과 canonical URL을 반영한다.

## Acceptance Criteria

- 모든 generated output route는 GitHub credential, CMS session, analytics API credential 없이 동작한다.
- public generated output에서 draft/archived 콘텐츠 노출은 0건이어야 한다.
- route는 generated XML/image 파일을 repository에 쓰지 않는다.
