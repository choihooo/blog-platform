# Data Model: Blog Rendering

## Public Blog Content Collection

공개 블로그 route가 사용할 repository content 묶음이다.

### Fields

- `posts`: parsed post 목록
- `authors`: author profile 목록
- `categories`: category registry
- `tags`: tag registry
- `site`: public site configuration

### Relationships

- `posts[].author`는 `authors[].id`를 참조한다.
- `posts[].category`는 `categories[].slug`를 참조한다.
- `posts[].tags[]`는 `tags[].slug`를 참조한다.
- `site.defaultAuthor`는 `authors[].id`를 참조한다.

### Validation Rules

- 기존 content collection validation을 통과해야 public route 생성에 사용할 수 있다.
- duplicate published slug가 있으면 public rendering은 실패해야 한다.
- category, tag, author reference가 깨진 post는 public output에 포함되면 안 된다.

## Public Post View

방문자에게 노출되는 하나의 published 글 view model이다.

### Fields

- `slug`: public URL segment
- `title`: post title
- `excerpt`: optional summary
- `author`: resolved author profile
- `publishedAt`: published date
- `updatedAt`: optional updated date
- `category`: optional resolved category
- `tags`: resolved tag 목록
- `readingTime`: generated reading time
- `toc`: generated table of contents
- `body`: validated MDX body
- `coverImage`: optional public media path

### Validation Rules

- `status`는 반드시 `published`여야 한다.
- `title`, `slug`, `author`, `publishedAt`, non-empty `body`가 있어야 한다.
- `body`는 MDX syntax와 safety validation을 통과해야 한다.
- `readingTime`과 `toc`는 같은 input에서 deterministic해야 한다.

## Public Route

방문자가 접근하는 공개 blog URL이다.

### Fields

- `path`: route pattern 또는 concrete path
- `kind`: `home`, `post`, `category`, `tag`, `not-found`
- `params`: route parameter map
- `items`: route가 표시하는 public post view 목록 또는 단일 post

### Validation Rules

- `/`는 published post 목록만 표시한다.
- `/posts/[slug]`는 matching published post가 없으면 not found로 처리한다.
- `/categories/[slug]`는 등록된 category만 표시하고 matching published post만 포함한다.
- `/tags/[slug]`는 등록된 tag만 표시하고 matching published post만 포함한다.

## Taxonomy Listing

category 또는 tag별 published post 목록이다.

### Fields

- `taxonomyType`: `category` 또는 `tag`
- `slug`: registry slug
- `label`: display label
- `description`: optional description
- `posts`: matching public post view 목록

### Validation Rules

- registry에 없는 taxonomy slug는 not found로 처리한다.
- `posts`는 published post만 포함해야 한다.
- empty listing은 등록된 taxonomy라면 빈 상태로 표시할 수 있다.

## Render Metadata

글 목록과 상세 화면에 함께 표시되는 생성 metadata다.

### Fields

- `readingTime`
- `toc`
- `headings`
- `codeBlocks`
- `warnings`

### Validation Rules

- `readingTime`, `toc`, `headings`는 `packages/markdown` 분석 결과를 사용해야 한다.
- blocking issue가 있으면 public post view를 만들면 안 된다.
- warning은 공개 렌더링을 막지 않지만 운영자가 확인할 수 있게 유지되어야 한다.

## Public Rendering Failure

공개 출력 전에 발견된 차단 오류다.

### Fields

- `code`
- `message`
- `path`
- `route`

### Validation Rules

- content validation failure는 build 또는 route generation 실패로 드러나야 한다.
- unknown, draft, archived slug는 post detail route에서 not found로 처리한다.
- unsafe MDX는 rendered body를 만들기 전에 실패해야 한다.
