# Quickstart: Content Model Validation

## 목적

이 문서는 Content Model 구현 후 end-to-end로 검증해야 할 시나리오를 정의한다. 구현 세부 코드는
`$speckit-tasks`와 implementation phase에서 작성한다.

## Prerequisites

- Repository dependency 설치가 완료되어 있어야 한다.
- `content/` 파일 구조가 [content-files.md](./contracts/content-files.md)를 따라 존재해야 한다.
- `packages/markdown`가 [markdown-package.md](./contracts/markdown-package.md)의 public API를
  제공해야 한다.

## Setup

```sh
pnpm install
```

## Validation Commands

```sh
pnpm --filter @blog-platform/markdown typecheck
pnpm --filter @blog-platform/markdown lint
pnpm --filter @blog-platform/markdown test
pnpm build
```

## Scenario 1: 샘플 콘텐츠 구조 확인

1. `content/posts/hello-world.mdx`가 존재한다.
2. `content/authors/ho.md`가 존재한다.
3. `content/categories.json`, `content/tags.json`, `content/site.json`이 존재한다.

**Expected Result**: 모든 파일이 계약상 위치에 존재하고, 샘플 published post가 validation을
통과한다.

## Scenario 2: Published post 필수 field 검증

1. `published` post에서 `title`, `slug`, `author`, `publishedAt`, body 중 하나를 제거한 fixture를
   검증한다.
2. 각 fixture에 대해 `validateContentCollection`을 실행한다.

**Expected Result**: 각 누락 field는 구분 가능한 error code로 실패한다.

## Scenario 3: Draft post slug 허용 정책

1. `status: "draft"`이고 slug가 없는 post fixture를 검증한다.
2. 같은 fixture에 title을 제공하고 `createSlugCandidate`를 실행한다.

**Expected Result**: draft post는 slug 없이 유효하고, title이 있으면 slug 후보가 생성된다.

## Scenario 4: Slug 중복 거부

1. 서로 다른 두 post fixture에 같은 slug를 부여한다.
2. `validateContentCollection`을 실행한다.

**Expected Result**: validation은 `post.slug.duplicate` issue로 실패한다.

## Scenario 5: Published-only filtering

1. `draft`, `published`, `archived` post를 포함한 collection을 만든다.
2. `getPublishedPosts`를 실행한다.

**Expected Result**: 반환 결과에는 `published` post만 포함된다.

## Scenario 6: 참조 무결성 검증

1. 존재하지 않는 author, category, tag를 참조하는 post fixture를 만든다.
2. 존재하지 않는 defaultAuthor를 가진 site config fixture를 만든다.
3. `validateContentCollection`을 실행한다.

**Expected Result**: 참조 오류는 각각 `post.author.unknown`, `post.category.unknown`,
`post.tags.unknown`, `site.defaultAuthor.unknown`으로 구분된다.

## Completion Criteria

- 위 validation commands가 모두 성공한다.
- 필수 negative fixture가 모두 기대한 error code로 실패한다.
- 공개 콘텐츠 대상 목록에는 `published` post만 포함된다.
- MVP 제외 항목인 database, object storage, 예약 발행, 다중 작성자 권한은 도입되지 않는다.
