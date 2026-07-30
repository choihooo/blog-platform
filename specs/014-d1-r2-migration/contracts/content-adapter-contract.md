# Contract: Content Adapter

## Purpose

`apps/blog`와 `apps/cms`가 동일한 데이터 인터페이스를 사용해 D1/R2/legacy source를 전환하되
각 기능이 동일 동작을 유지하도록 하기 위한 계약이다.

## Scope

게시글 조회, 목록 조회, 태그 조회, 작성/수정/삭제, 미디어 참조 조회, 카테고리 조회를 다룬다.
관리자 write 경로와 공개 read 경로는 모두 동일한 인터페이스를 통해 접근한다.
카테고리 1차/2차 경로(`depth1`, `depth1/depth2`) 기반 조회도 같은 계약 하에서 처리한다.

## API: Content Source Adapter

### Inputs

| Use Case | Method | Parameters | Required |
| --- | --- | --- | --- |
| 공개 목록 조회 | `listPosts` | `publishedOnly`, `page`, `limit`, `tagSlug`, `categoryPath` | `publishedOnly` |
| slug로 글 조회 | `getPostBySlug` | `slug`, `includeUnpublished` | `slug` |
| 태그 기반 조회 | `getPostsByTag` | `tagSlug`, `publishedOnly`, `page`, `limit` | `tagSlug` |
| 카테고리 기반 조회 | `getPostsByCategoryPath` | `categoryPath`, `publishedOnly`, `page`, `limit` | `categoryPath`, `publishedOnly` |
| 카테고리 목록 조회 | `listCategories` | `depth`, `parentSlug` | `depth` |
| 글 생성 | `createPost` | `post`, `authorIdentity` | `post`, `authorIdentity` |
| 글 수정 | `updatePost` | `slug`, `post`, `authorIdentity` | `slug`, `post`, `authorIdentity` |
| 글 삭제 | `deletePost` | `slug`, `authorIdentity` | `slug`, `authorIdentity` |
| 미디어 참조 생성 | `upsertMediaRef` | `mediaRef`, `authorIdentity` | `mediaRef`, `authorIdentity` |
| 미디어 참조 삭제 | `deleteMediaRef` | `mediaRefId`, `authorIdentity` | `mediaRefId`, `authorIdentity` |

### Success Result

- 조회 메서드는 현재 소스 모드(legacy, d1r2)에 관계없이 동일 schema의 응답을 반환한다.
- write 메서드는 변경 결과의 canonical key, 마지막 갱신 시각, 수행 주체 identity를 반환한다.

### Failure Result

- `validation-failure`, `auth-required`, `forbidden`, `not-found`, `conflict`, `upstream-failure`,
  `storage-failure`, `retryable-failure`를 명시한다.

### Performance & Retry Contract

- Timeout: list/get 계열은 2.5초, write 계열(`create`/`update`/`delete`)은 5초, media 업로드 계열은 15초.
- Read/write 실패는 3회 재시도 후 실패로 판정하며, 재시도 간격은 지수 backoff.
- `retryable-failure`는 재시도 대상, `storage-failure`는 수동 개입 대상, `upstream-failure`는 dual-run 비교 대상으로 분류한다.

## Behavioral Rules

- `getPostBySlug`는 동일 slug에서 공개 모드(`publishedOnly=true`)일 때 draft를 제외한다.
- `createPost`/`updatePost`는 slug 중복/형식 위반을 선제 검증한다.
- `getPostsByCategoryPath`는 `categoryPath`가 1단계 또는 2단계(최대)일 때만 허용한다.
- `listCategories`는 `depth=1`에서 depth1 전용 목록, `depth=2`에서 특정 `parentSlug` 기준 하위 목록을 반환한다.
- `deletePost`는 soft delete와 hard delete 정책 중 하나를 구현하되, 같은 운영 모드 내에서 일관성 있게
  동작해야 한다.
- `createPost`와 `updatePost`는 기존 관리자 guard와 동일한 실패 코드를 반환해야 한다.
- 소스 전환은 런타임 설정으로 수행되며 코드 분기로 혼재하지 않는다.
- `listPosts`는 page당 기본 정렬을 `published_at desc`로 유지하고, `getPostBySlug`는 slug 정합성 우선 검색 후 카테고리 경로를 함께 반환할 수 있다.

## Runtime Switch

- `contentSourceMode=legacy|d1r2`로 전환한다.
- dual-run이 필요할 때는 동일 요청을 양쪽 모드로 조회해 비교 로그를 남긴다.
- 롤백은 동일 설정 키를 변경해 1분 내 새 모드로 복귀할 수 있어야 한다.
