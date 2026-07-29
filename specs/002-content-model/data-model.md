# Data Model: Content Model

## Entity: Post

블로그 글 파일 하나를 나타낸다. 저장 위치는 `content/posts/*.mdx`다.

### Fields

- `title`: 사람이 읽는 글 제목. `published` 상태에서는 필수이며 비어 있을 수 없다.
- `status`: `draft`, `published`, `archived` 중 하나.
- `slug`: 공개 URL과 생성 산출물의 안정적인 식별자. `published` 상태에서는 필수다.
- `author`: `Author.id`를 참조하는 작성자 식별자. `published` 상태에서는 필수다.
- `publishedAt`: 공개 발행일. `published` 상태에서는 필수이며 날짜로 해석 가능해야 한다.
- `updatedAt`: 마지막 의미 있는 수정일. 선택 field다.
- `excerpt`: 목록, metadata, preview에 쓰는 짧은 요약. 선택 field지만 공개 품질 검증에서 권장된다.
- `coverImage`: 글 대표 이미지 경로. 선택 field이며 MVP 미디어 정책상 local public media path를
  참조해야 한다.
- `category`: `Category.slug` 참조. 선택 field지만 값이 있으면 등록된 category여야 한다.
- `tags`: `Tag.slug` 목록. 선택 field지만 값이 있으면 등록된 tag여야 한다.
- `body`: frontmatter를 제외한 MDX 본문. `published` 상태에서는 공백만 있어서는 안 된다.

### Validation Rules

- `status`는 허용된 세 값 중 하나여야 한다.
- `published`는 `title`, `slug`, `author`, `publishedAt`, non-empty `body`가 모두 필요하다.
- `draft`는 `slug`와 `publishedAt` 없이도 유효할 수 있다.
- `archived`는 repository에 남을 수 있지만 공개 콘텐츠 목록에서는 제외된다.
- `author`는 존재하는 `Author.id`를 참조해야 한다.
- `category`와 `tags`는 각각 등록된 `Category.slug`, `Tag.slug`와 대조 가능해야 한다.
- 모든 `published` post의 `slug`는 전체 `content/posts/*.mdx` 기준으로 중복될 수 없다.

### State Transitions

```text
draft -> published
published -> archived
archived -> draft
archived -> published
```

- `draft -> published`: slug, author, publishedAt, body 검증을 통과해야 한다.
- `published -> archived`: 공개 목록과 자동 산출물에서 제외되어야 한다.
- `archived -> published`: 현재 published 요구사항과 slug 중복 검사를 다시 통과해야 한다.

## Entity: Draft Post

`Post`의 상태별 variant다.

### Fields

- `status`: `draft`
- `title`: 선택 가능하지만 slug 후보 생성을 위해 권장된다.
- `slug`: 선택
- `author`: 선택
- `body`: 선택 가능하지만 편집 가능한 본문으로 보존된다.

### Validation Rules

- slug가 없어도 유효하다.
- Save/Publish 전 slug 후보 생성에는 비어 있지 않은 title이 필요하다.

## Entity: Published Post

`Post`의 공개 가능한 상태별 variant다.

### Fields

- `status`: `published`
- `title`: 필수
- `slug`: 필수
- `author`: 필수
- `publishedAt`: 필수
- `body`: 필수, non-empty

### Validation Rules

- public list, RSS, Sitemap, JSON-LD, OG image 같은 이후 산출물의 입력 대상이 될 수 있다.
- slug는 전체 post set에서 unique해야 한다.

## Entity: Archived Post

Repository에 남아 있지만 공개 대상에서 제외되는 글이다.

### Fields

- `status`: `archived`
- 기존 post metadata와 body를 보존할 수 있다.

### Validation Rules

- public list와 generated output target으로 분류되면 안 된다.
- 재발행하려면 `Published Post` validation을 다시 통과해야 한다.

## Entity: Author

글 작성자 프로필이다. MVP에서는 단일 운영자 `ho`를 기본값으로 둔다.

### Fields

- `id`: post의 `author` field가 참조하는 안정적인 식별자.
- `name`: 표시 이름.
- `bio`: 짧은 소개.
- `githubLogin`: 운영자 GitHub login.
- `githubUserId`: immutable GitHub user ID.
- `avatar`: 선택 프로필 이미지 경로 또는 URL.

### Validation Rules

- `id`는 비어 있을 수 없다.
- `published` post가 참조하는 author는 존재해야 한다.

## Entity: Site Config

사이트와 운영 설정을 담는 repository 파일이다. 저장 위치는 `content/site.json`이다.

### Fields

- `siteName`: 사이트 이름.
- `siteUrl`: canonical URL 기준.
- `defaultAuthor`: 기본 `Author.id`.
- `adminGithubLogin`: CMS 관리자 GitHub login.
- `adminGithubUserId`: CMS 관리자 immutable GitHub user ID.
- `github.owner`: 콘텐츠 repository owner.
- `github.repo`: 콘텐츠 repository name.
- `github.branch`: 콘텐츠 source branch.
- `analytics.provider`: MVP analytics provider 이름.
- `features.aiAssistant`: AI assistant enable flag.
- `features.internalLinkSuggestions`: internal link suggestion enable flag.

### Validation Rules

- `defaultAuthor`는 존재하는 author를 참조해야 한다.
- MVP에서는 AI assistant와 internal link suggestions가 기본적으로 비활성화되어야 한다.
- 별도 CMS database나 analytics API dashboard 설정을 요구하지 않아야 한다.

## Entity: Category

글의 넓은 주제 분류다. 저장 위치는 `content/categories.json`이다.

### Fields

- `slug`: stable category identifier.
- `label`: 사용자에게 표시할 이름.
- `description`: 선택 설명.

### Validation Rules

- category slug는 중복될 수 없다.
- post가 category를 참조하면 등록된 slug여야 한다.

## Entity: Tag

글의 세부 주제나 키워드 분류다. 저장 위치는 `content/tags.json`이다.

### Fields

- `slug`: stable tag identifier.
- `label`: 사용자에게 표시할 이름.
- `description`: 선택 설명.

### Validation Rules

- tag slug는 중복될 수 없다.
- post가 tags를 참조하면 모든 값이 등록된 slug여야 한다.
