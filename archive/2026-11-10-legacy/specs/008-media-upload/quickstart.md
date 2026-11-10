# Quickstart: Media Upload

## Prerequisites

- dependencies 설치 완료
- CMS 인증 설정 또는 로컬 개발 bypass 설정
- `content/site.json`에 관리자 GitHub identity와 repository 설정 존재
- 기존 `specs/007-cms-editor` editor 저장 흐름이 동작

## Setup

```sh
pnpm install
pnpm --filter @blog-platform/cms typecheck
pnpm --filter @blog-platform/cms lint
pnpm --filter @blog-platform/cms test
pnpm --filter @blog-platform/editor typecheck
pnpm --filter @blog-platform/editor lint
pnpm --filter @blog-platform/editor test
```

## Scenario 1: 본문 이미지 업로드 성공

1. `CMS_DEV_BYPASS_AUTH=1 pnpm dev:cms`로 CMS를 연다.
2. `/posts/new` 또는 기존 글 editor를 연다.
3. 제목이 비어 있으면 slug 후보를 만들 수 있는 제목을 입력한다.
4. toolbar image button으로 2MB 이하 `png`, `jpg`, `jpeg`, `webp` 파일을 선택한다.
5. 대체 텍스트와 선택 제목을 입력하고 업로드한다.

Expected:

- 업로드 진행 상태가 표시된다.
- 성공 후 본문에 이미지가 삽입된다.
- 저장 가능한 MDX에는 `/media/posts/<slug>/...webp` 공개 경로가 들어간다.
- `blob:`, `data:`, 로컬 파일 경로는 저장될 MDX에 없다.

## Scenario 2: 커버 이미지 업로드 성공

1. editor의 metadata panel에서 cover upload를 선택한다.
2. 2MB 이하 허용 이미지 파일을 선택한다.
3. 업로드를 완료한다.

Expected:

- `coverImage` 값이 `/media/covers/<slug>-...webp` 공개 경로로 갱신된다.
- 기존 cover file은 자동 삭제되지 않는다.
- 글은 dirty 상태가 되고 별도 저장이 필요함을 표시한다.

## Scenario 3: 제한 위반 차단

1. 2MB 초과 이미지 파일을 선택한다.
2. 허용되지 않는 확장자 파일을 선택한다.
3. 확장자는 이미지처럼 보이지만 decode 불가능한 파일을 선택한다.

Expected:

- 각 입력은 repository 변경 없이 거부된다.
- editor body와 `coverImage`는 변경되지 않는다.
- 사용자는 다시 파일을 선택하거나 편집을 계속할 수 있다.

## Scenario 4: 권한/세션 실패

1. 인증되지 않은 상태 또는 비관리자 상태를 구성한다.
2. 본문 또는 커버 이미지 업로드를 시도한다.

Expected:

- repository media commit이 실행되지 않는다.
- 실패 상태는 재인증 또는 접근 거부로 구분된다.
- 저장 가능한 editor document에는 임시 이미지 참조가 없다.

## Scenario 5: 업로드 성공 후 글 저장 실패

1. media upload를 성공시킨다.
2. stale SHA 또는 네트워크 실패를 재현해 글 저장을 실패시킨다.

Expected:

- media file은 유지된다.
- editor document는 public image path 참조와 현재 편집 내용을 보존한다.
- 운영자는 저장 재시도 또는 충돌 해결을 판단할 수 있다.

## Full Validation

```sh
pnpm --filter @blog-platform/cms typecheck
pnpm --filter @blog-platform/cms lint
pnpm --filter @blog-platform/cms test
pnpm --filter @blog-platform/editor typecheck
pnpm --filter @blog-platform/editor lint
pnpm --filter @blog-platform/editor test
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Validation Results

2026-07-30 기준으로 다음 검증을 완료했다.

- `pnpm --filter @blog-platform/editor typecheck`: 통과
- `pnpm --filter @blog-platform/editor lint`: 통과
- `pnpm --filter @blog-platform/editor test`: 통과
- `pnpm --filter @blog-platform/cms typecheck`: 통과
- `pnpm --filter @blog-platform/cms lint`: 통과
- `pnpm --filter @blog-platform/cms test`: 통과
- `pnpm typecheck`: 통과
- `pnpm lint`: 통과
- `pnpm test`: 통과
- `pnpm build`: 통과
