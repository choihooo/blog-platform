# D1/R2 Type Mapping

- `uuid` / `int8` / `bigint` -> `TEXT`
- `uuid` / `text` / `varchar` -> `TEXT`
- `int2` / `int4` / `integer` / `bool` -> `INTEGER`
- `timestamptz` / `timestamp` / `date` -> `TEXT` (ISO8601 UTC, `YYYY-MM-DDTHH:mm:ss.sssZ`)
- `jsonb` / `json` -> `TEXT` (stringified JSON)

## Posts / 기본 메타

- `posts.id` : `uuid` -> `TEXT`
- `posts.published_at`, `posts.updated_at` : `timestamp` -> `TEXT`
- `posts.is_published` : `boolean` -> `INTEGER`(0/1)
- `posts.view_count` : `integer` -> `INTEGER`

## Tags / 카테고리

- `tags.id`, `categories.id`, `admins.id` : `uuid` -> `TEXT`
- `categories.depth` : `smallint` -> `INTEGER CHECK (depth IN (1,2))`
- `categories.parent_id` : `uuid` nullable -> `TEXT`
- `media_refs.width`, `media_refs.height` : `integer` -> `INTEGER`

## 매핑 규칙

- 참조 FK는 D1 에서 `TEXT`로 통일하고, 서비스 코드에서 존재성/순환 검증 수행.
- `jsonb` 필드는 `content`/`summary` 계열에서만 문자열 저장 + 파싱 실패 시 이관 실패로 기록.
- 카테고리 path: `depth=1`은 `slug`가 1개 조각, `depth=2`는 `slug=depth1/depth2` 규칙으로 보관.

## Category Depth Rule (2 depth)

- 허용 깊이: `1` 또는 `2`.
- `depth=1`이면 `parent_id`, `parent_slug`는 `NULL`.
- `depth=2`이면 `parent_id`, `parent_slug`는 `NOT NULL` 이고 `parent_id`는 동일 테이블의 `depth=1` 카테고리를 가리켜야 함.
