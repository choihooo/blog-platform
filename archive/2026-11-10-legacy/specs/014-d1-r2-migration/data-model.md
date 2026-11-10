# Data Model: d1-r2-migration

## Entity: Post

한 게시글의 핵심 메타데이터와 본문 데이터를 보관한다.

### Fields

- `id`: string (텍스트, 고유키)
- `slug`: string (필수, unique)
- `title`: string
- `content`: string
- `summary`: string (요약)
- `category_id`: string (nullable)
- `hero_image_key`: string (nullable)
- `published_at`: string (ISO8601, nullable)
- `updated_at`: string (ISO8601)
- `is_published`: integer (0/1)
- `view_count`: integer

### Validation Rules

- `id`와 `slug`는 공백, 제어문자 없이 저장.
- `slug`는 영문/숫자/하이픈 위주로 slug 정책을 따른다.
- `is_published`는 0 또는 1만 허용한다.
- `published_at`은 `is_published=1`일 때만 필수이다.
- `updated_at`은 항상 최신값으로 갱신된다.
- `view_count`는 음수가 될 수 없다.
- `category_id`는 null이거나 존재하는 Category.id여야 한다.

## Entity: Tag

글 분류 태그 정보를 보관한다.

### Fields

- `id`: string (텍스트, 고유키)
- `name`: string (unique)
- `slug`: string (unique)

### Validation Rules

- `name`은 공백 trim 후 1자 이상이어야 한다.
- `slug`는 slug 정책을 따른다.
- `name`, `slug` 중복은 허용하지 않는다.

## Entity: Category

1차/2차 카테고리 계층을 보존한다.

### Fields

- `id`: string (텍스트, 고유키)
- `name`: string
- `slug`: string
- `parent_id`: string (nullable)
- `parent_slug`: string (nullable)
- `depth`: integer (1 또는 2)
- `created_at`: string (ISO8601)

### Validation Rules

- `name`은 공백 trim 후 1자 이상이어야 한다.
- `slug`는 slug 정책을 따른다.
- `depth`는 1 또는 2만 허용한다.
- `depth=1`이면 `parent_id`와 `parent_slug`는 null이다.
- `depth=2`이면 `parent_id`와 `parent_slug`가 모두 있어야 하고, `parent_id`는 depth=1 카테고리를
  가리켜야 한다.
- `parent_id`는 동일 테이블의 Category.id만 허용한다.

## Entity: PostTag

`Post`와 `Tag`의 다대다 관계를 나타낸다.

### Fields

- `post_id`: string
- `tag_id`: string

### Validation Rules

- `(post_id, tag_id)`는 복합 PK로 중복을 허용하지 않는다.
- `post_id`와 `tag_id`는 각각 `Post.id`, `Tag.id` 존재해야 한다.
- 참조 대상 삭제 시 정합성 정책을 따르되, post 삭제 시 관계도 함께 제거한다.

## Entity: MediaReference

썸네일/본문 이미지/OG 이미지 참조를 추적한다.

### Fields

- `id`: string (텍스트, 고유키)
- `post_id`: string
- `r2_key`: string
- `kind`: string (`hero`, `body`, `og`, `pdf`, `attachment` 등)
- `width`: integer (nullable)
- `height`: integer (nullable)
- `created_at`: string (ISO8601)

### Validation Rules

- `kind`는 등록된 enum 중 하나여야 한다.
- `r2_key`는 `blog/<year>/<month>/<post-slug>/<uuid>.webp` 규칙을 따라야 한다.
- `width`, `height`는 양의 정수로 들어오거나 null이다.
- `post_id`는 존재하는 글이어야 한다.

## Entity: Admin

콘텐츠 mutation을 수행하는 최소 관리자 정보이다.

### Fields

- `id`: string
- `github_identity`: string
- `display_name`: string
- `is_active`: integer (0/1)

### Validation Rules

- `github_identity`와 `id`는 시스템에서 검증된 값만 허용한다.
- 비활성(`is_active=0`) 관리자는 공개/쓰기 mutation을 수행할 수 없다.

## Entity: MigrationRun

이관 작업 실행 상태와 결과를 추적한다.

### Fields

- `id`: string
- `phase`: string (`extract`, `upload`, `import`, `verify`, `complete`, `rollback`)
- `status`: string (`running`, `succeeded`, `failed`, `cancelled`)
- `start_at`: string
- `end_at`: string (nullable)
- `summary`: string (JSON 문자열)

### Validation Rules

- `phase`는 정해진 열거값만 허용한다.
- 상태 전이는 `running`에서 `succeeded|failed|cancelled`로만 이동한다.
- `summary`는 JSON 문자열 형식이어야 한다.

## Entity Relationship Summary

- Post N:1 Category
- Category 1:N Post
- Post 1:N MediaReference
- Post N:M Tag (through PostTag)
- Category 1:N Category (self-relation: depth1 -> depth2)
- Admin 1:N MigrationRun

## State Transitions

- `Post`: Draft(`is_published=0`) <-> Published(`is_published=1`)
- `Category`: depth=1 (생성/수정) -> 유지, depth=2 생성 시 parent가 depth=1이어야 함
- `MigrationRun`: `extract` -> `upload` -> `import` -> `verify` -> `complete` or `failed`
