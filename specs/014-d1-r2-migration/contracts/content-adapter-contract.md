# Contract: Content Adapter

> 2026-11-08 구조 단순화: 앱 3개와 `packages/core` 1개를 사용한다. 저장소 구현은
> `packages/core/src/storage/d1-content-store.ts`, 콘텐츠 모델은 `core/content`가 소유한다.
> D1/R2·remote 동작과 공개 URL은 유지한다. 아래 초기 legacy/dual switch는 이력이며 현재 runtime 복귀
> 방법이 아니다. 구조 변경은 단계별 코드 diff를 되돌리고 원격 데이터는 변경하지 않는다.

## Purpose

`apps/blog`와 `apps/cms`가 동일한 데이터 인터페이스를 사용해 D1/R2/legacy source를 전환하되 각
기능이 동일 동작을 유지하도록 하기 위한 계약이다.

## Scope

게시글 조회, 목록 조회, 태그 조회, 작성/수정/삭제, 미디어 참조 조회, 카테고리 조회를 다룬다. 관리자
write 경로와 공개 read 경로는 모두 동일한 인터페이스를 통해 접근한다. 카테고리 1차/2차
경로(`depth1`, `depth1/depth2`) 기반 조회도 같은 계약 하에서 처리한다.

## API: Content Source Adapter

### Inputs

| Use Case           | Method                   | Parameters                                                  | Required                         |
| ------------------ | ------------------------ | ----------------------------------------------------------- | -------------------------------- |
| 공개 목록 조회     | `listPosts`              | `publishedOnly`, `page`, `limit`, `tagSlug`, `categoryPath` | `publishedOnly`                  |
| slug로 글 조회     | `getPostBySlug`          | `slug`, `includeUnpublished`                                | `slug`                           |
| 태그 기반 조회     | `getPostsByTag`          | `tagSlug`, `publishedOnly`, `page`, `limit`                 | `tagSlug`                        |
| 카테고리 기반 조회 | `getPostsByCategoryPath` | `categoryPath`, `publishedOnly`, `page`, `limit`            | `categoryPath`, `publishedOnly`  |
| 카테고리 목록 조회 | `listCategories`         | `depth`, `parentSlug`                                       | `depth`                          |
| 글 생성            | `createPost`             | `post`, `authorIdentity`                                    | `post`, `authorIdentity`         |
| 글 수정            | `updatePost`             | `slug`, `post`, `authorIdentity`                            | `slug`, `post`, `authorIdentity` |
| 글 삭제            | `deletePost`             | `slug`, `authorIdentity`                                    | `slug`, `authorIdentity`         |
| 미디어 참조 생성   | `upsertMediaRef`         | `mediaRef`, `authorIdentity`                                | `mediaRef`, `authorIdentity`     |
| 미디어 참조 삭제   | `deleteMediaRef`         | `mediaRefId`, `authorIdentity`                              | `mediaRefId`, `authorIdentity`   |

### Success Result

- 조회 메서드는 현재 소스 모드(legacy, d1r2)에 관계없이 동일 schema의 응답을 반환한다.
- write 메서드는 변경 결과의 canonical key, 마지막 갱신 시각, 수행 주체 identity를 반환한다.

### Failure Result

- `validation-failure`, `auth-required`, `forbidden`, `not-found`, `conflict`, `upstream-failure`,
  `storage-failure`, `retryable-failure`를 명시한다.

### Performance & Retry Contract

- Timeout: list/get 계열은 2.5초, write 계열(`create`/`update`/`delete`)은 5초, media 업로드 계열은
  15초.
- Read/write 실패는 3회 재시도 후 실패로 판정하며, 재시도 간격은 지수 backoff.
- `retryable-failure`는 재시도 대상, `storage-failure`는 수동 개입 대상, `upstream-failure`는
  dual-run 비교 대상으로 분류한다.

## Behavioral Rules

- `getPostBySlug`는 동일 slug에서 공개 모드(`publishedOnly=true`)일 때 draft를 제외한다.
- `createPost`/`updatePost`는 slug 중복/형식 위반을 선제 검증한다.
- `getPostsByCategoryPath`는 `categoryPath`가 1단계 또는 2단계(최대)일 때만 허용한다.
- `listCategories`는 `depth=1`에서 depth1 전용 목록, `depth=2`에서 특정 `parentSlug` 기준 하위
  목록을 반환한다.
- `deletePost`는 soft delete와 hard delete 정책 중 하나를 구현하되, 같은 운영 모드 내에서 일관성
  있게 동작해야 한다.
- `createPost`와 `updatePost`는 기존 관리자 guard와 동일한 실패 코드를 반환해야 한다.
- 소스 전환은 런타임 설정으로 수행되며 코드 분기로 혼재하지 않는다.
- `listPosts`는 page당 기본 정렬을 `published_at desc`로 유지하고, `getPostBySlug`는 slug 정합성
  우선 검색 후 카테고리 경로를 함께 반환할 수 있다.

## Runtime Switch

### Rich structured content (2026-11-05)

- `PostRecord.content`는 `{ version: 1, nodes }` JSON이다. Markdown fallback은 공유 editor
  패키지에서 처리한다. remote와 d1r2는 같은 `toPublicSourcePost`로 매핑하여 구조를 보존한다.
- 텍스트의 `content` inline runs, 목록의 `items`/`start`, 인용문의 `children`, 표의 `rows`/cell
  `body`/`header`/`colspan`/`rowspan`, 이미지의 `captionContent`/`href`는 additive v1 필드다.
- `text`는 검색·SEO용 평문이며, inline runs가 있는 문장을 Markdown으로 재파싱하지 않는다.
- CMS 편집 및 저장·발행 경계는 새 필드를 round-trip하고 중첩 validation을 적용한다.
- 기존 앱은 table을 지원하지 않으므로 Blog/CMS 호환 배포가 원격 콘텐츠 복구보다 먼저다. Blog 본문
  `data-content-schema="1-rich"`는 복구 스크립트의 배포 확인 지표다.
- 복구는 content만 변경하고 id/slug/상태/표지/카테고리/태그/게시일/수정일을 보존한다. 원문·기존
  content·hash를 백업하며, 이전 content와 updated_at이 일치할 때만 쓴다. rollback은 새 content와
  일치하는 글만 복원한다. Runbook: `docs/runbooks/2026-11-05-content-recovery.md`.

- CMS의 기본 adapter는 `d1r2`다. Blog는 `BLOG_CONTENT_PROXY_URL`이 있으면 `remote`, 없으면 `d1r2`를
  사용한다. legacy 파일 모드는 현재 공개 Blog의 runtime 선택지가 아니다.

## Public Blog pagination and failure contract (2026-10-04)

- `BlogContentSource.listPostPage(input)`는 `{ items, total }`을 반환한다. `total`은 필터에 해당하는
  전체 공개 글 수이며 페이지 크기가 아니다. 기존 `listPosts`의 배열 반환 계약은 유지한다.
- CMS `GET /api/public-content` 목록 응답은 `{ posts, total, categories }`이다. `page`는 1부터,
  `limit`은 최대 100이며 `tag`, `category`, `query`를 지원한다.
- 공개 Blog의 목록은 페이지당 8개를 서버에서 조회한다. 전체 사이트맵과 태그 discovery는 100개 단위로
  마지막 페이지까지 순회한다. RSS는 최신 20개를 유지한다.
- 성공한 단건 조회의 미존재만 `undefined`/404로 변환한다. D1 설정 누락·조회 실패·remote 5xx· 잘못된
  응답은 예외로 전파한다. 사이트맵은 부분 목록으로 성공하지 않는다.
- D1 `unstable_cache`/ISR 재검증에서 예외를 삼키지 않아 성공 캐시를 오류 결과로 대체하지 않는다.
  cold request는 서버 오류로 응답한다. remote는 기존 `no-store` 정책을 유지한다.
- remote 모드는 CMS 계약을 먼저 배포하고 Blog를 배포한다. D1/R2 직접 조회 모드는 Blog를 독립 배포할
  수 있다. 원격 데이터 마이그레이션은 필요 없다.
