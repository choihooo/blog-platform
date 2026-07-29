# Contract: Markdown Package Content Model API

## 목적

`packages/markdown`는 콘텐츠 파일을 읽고 검증하는 공유 계약을 제공한다. 이 API는 이후 `apps/blog`,
`apps/cms`, `packages/seo-engine`이 중복 없이 재사용할 수 있어야 한다.

## Public Types

```ts
type PostStatus = "draft" | "published" | "archived";

interface ValidationIssue {
  code: string;
  message: string;
  path: string[];
}

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  issues: ValidationIssue[];
}
```

## Public Functions

### `parsePostFile(input)`

```ts
parsePostFile(input: { path: string; source: string }): ValidationResult<Post>
```

### Contract

- frontmatter와 body를 분리한다.
- `status`에 따라 `Draft Post`, `Published Post`, `Archived Post` 중 하나로 검증한다.
- 실패 시 field 경로와 사람이 이해할 수 있는 message를 포함한다.

### `validateContentCollection(input)`

```ts
validateContentCollection(input: {
  posts: Array<{ path: string; source: string }>;
  authors: Array<{ path: string; source: string }>;
  categoriesJson: string;
  tagsJson: string;
  siteJson: string;
}): ValidationResult<ContentCollection>
```

### Contract

- authors, categories, tags, site config, posts를 함께 검증한다.
- author 참조, category 참조, tag 참조, defaultAuthor 참조를 확인한다.
- 전체 post set 기준 slug 중복을 확인한다.

### `getPublishedPosts(collection)`

```ts
getPublishedPosts(collection: ContentCollection): PublishedPost[]
```

### Contract

- `status: "published"` 글만 반환한다.
- 반환 결과에는 `draft`와 `archived`가 포함되면 안 된다.

### `createSlugCandidate(title)`

```ts
createSlugCandidate(title: string): ValidationResult<string>
```

### Contract

- 사람이 읽을 수 있고 URL segment로 사용할 수 있는 slug 후보를 만든다.
- 변환 가능한 문자가 없으면 validation failure를 반환한다.
- uniqueness는 이 함수가 아니라 `validateUniqueSlug` 또는 collection validation에서 확인한다.

### `validateUniqueSlug(input)`

```ts
validateUniqueSlug(input: {
  candidate: string;
  existingPosts: Array<{ path: string; slug?: string }>;
  currentPath?: string;
}): ValidationResult<string>
```

### Contract

- `candidate`가 다른 post의 slug와 충돌하면 실패한다.
- 같은 파일을 갱신하는 경우 `currentPath`는 중복 대상에서 제외한다.

## Required Error Codes

- `post.status.invalid`
- `post.title.required`
- `post.slug.required`
- `post.slug.duplicate`
- `post.slug.unusable-title`
- `post.author.required`
- `post.author.unknown`
- `post.publishedAt.required`
- `post.publishedAt.invalid`
- `post.body.required`
- `post.category.unknown`
- `post.tags.unknown`
- `author.id.required`
- `category.slug.duplicate`
- `tag.slug.duplicate`
- `site.defaultAuthor.unknown`

## Non-Goals

- MDX rendering
- syntax highlighting
- unsafe HTML sanitization
- CMS authentication
- GitHub write mutation
- SEO scoring or generated output creation
