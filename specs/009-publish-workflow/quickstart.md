# Quickstart: Publish Workflow

## Prerequisites

- dependencies 설치 완료
- CMS 인증 설정 또는 로컬 개발 bypass 설정
- `content/site.json`에 관리자 GitHub identity와 repository 설정 존재
- 기존 CMS editor save flow와 media upload flow가 동작
- 공개 blog의 published-only route가 동작

## Setup

```sh
pnpm install
pnpm --filter @blog-platform/markdown typecheck
pnpm --filter @blog-platform/markdown lint
pnpm --filter @blog-platform/markdown test
pnpm --filter @blog-platform/editor typecheck
pnpm --filter @blog-platform/editor lint
pnpm --filter @blog-platform/editor test
pnpm --filter @blog-platform/cms typecheck
pnpm --filter @blog-platform/cms lint
pnpm --filter @blog-platform/cms test
pnpm --filter @blog-platform/blog typecheck
pnpm --filter @blog-platform/blog lint
pnpm --filter @blog-platform/blog build
```

## Scenario 1: Draft 저장

1. `CMS_DEV_BYPASS_AUTH=1 pnpm dev:cms`로 CMS를 연다.
2. `/posts/new`에서 제목과 본문을 입력한다.
3. Save를 실행한다.

Expected:

- repository의 `content/posts/*.mdx`에 draft 상태 글이 저장된다.
- Save 결과는 commit 성공과 local backup 정리를 표시한다.
- public refresh는 실행되지 않는다.
- 공개 blog 홈, RSS, Sitemap에는 새 draft가 나타나지 않는다.

## Scenario 2: Draft 발행 성공

1. 유효한 제목, 작성자, 본문을 가진 draft를 연다.
2. slug가 비어 있는 상태에서 Publish를 실행한다.
3. 공개 blog 홈과 `/posts/<slug>`를 확인한다.

Expected:

- CMS가 제목 기반 slug를 생성한다.
- `publishedAt`이 비어 있으면 현재 발행 시각으로 채워진다.
- 글 status는 `published`가 된다.
- 공개 홈, 상세 페이지, 관련 category/tag route, RSS, Sitemap이 published 글을 포함한다.
- 작업 결과는 repository 변경 성공과 public refresh 성공을 표시한다.

## Scenario 3: Duplicate slug 차단

1. 이미 published 글과 같은 slug를 가진 draft를 만든다.
2. Publish를 실행한다.

Expected:

- Publish는 repository 변경 없이 실패한다.
- 실패 코드는 duplicate slug 또는 validation failure로 구분된다.
- 운영자의 현재 editor document와 local draft backup은 보존된다.
- public refresh는 실행되지 않는다.

## Scenario 4: Unpublish

1. published 글을 CMS에서 연다.
2. Unpublish를 실행한다.
3. 공개 blog 홈, 상세 페이지, RSS, Sitemap을 확인한다.

Expected:

- 글 status는 `draft`로 바뀐다.
- 공개 홈, 상세 페이지, RSS, Sitemap에서 대상 글이 사라진다.
- 작업 결과는 repository 변경 성공과 public refresh 성공을 표시한다.

## Scenario 5: Archive

1. published 글을 CMS에서 연다.
2. Archive를 실행한다.
3. 공개 blog 홈, 상세 페이지, RSS, Sitemap을 확인한다.

Expected:

- 글 status는 `archived`로 바뀐다.
- 공개 홈, 상세 페이지, RSS, Sitemap에서 대상 글이 사라진다.
- repository에는 글 파일이 남아 있다.

## Scenario 6: Repository conflict

1. CMS에서 글을 연 뒤 같은 파일을 다른 작업으로 먼저 변경한다.
2. 기존 화면에서 Save 또는 Publish를 실행한다.

Expected:

- 작업은 stale-file 상태로 실패한다.
- CMS는 최신 파일 확인 또는 충돌 해결이 필요함을 표시한다.
- 운영자의 현재 편집 내용은 보존된다.
- public refresh는 실행되지 않는다.

## Scenario 7: Public refresh failure와 재시도

1. Publish, Unpublish, Archive 중 하나의 repository 변경은 성공시키고 public refresh 실패를
   재현한다.
2. CMS 결과 메시지를 확인한다.
3. Retry public refresh를 실행한다.

Expected:

- CMS는 repository 변경 성공과 public refresh 실패를 분리해서 표시한다.
- Retry는 repository 파일을 다시 commit하지 않고 public refresh target만 재시도한다.
- 재시도 성공 후 CMS는 공개 반영 완료 상태를 표시한다.

## Full Validation

```sh
pnpm --filter @blog-platform/markdown typecheck
pnpm --filter @blog-platform/markdown lint
pnpm --filter @blog-platform/markdown test
pnpm --filter @blog-platform/editor typecheck
pnpm --filter @blog-platform/editor lint
pnpm --filter @blog-platform/editor test
pnpm --filter @blog-platform/cms typecheck
pnpm --filter @blog-platform/cms lint
pnpm --filter @blog-platform/cms test
pnpm --filter @blog-platform/blog typecheck
pnpm --filter @blog-platform/blog lint
pnpm --filter @blog-platform/blog build
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Validation Results

이 quickstart는 구현 후 실행한다. `$speckit-plan` 단계에서는 산출물 작성과 contract 검토까지만
완료했다.
