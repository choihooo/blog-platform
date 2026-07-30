# Data Model: Media Upload

## Entity: MediaUploadRequest

운영자가 CMS editor에서 시작한 이미지 업로드 요청이다.

### Fields

- `target`: `body` 또는 `cover`
- `postSlug`: 업로드 경로에 사용할 글 slug 또는 slug 후보
- `fileName`: 사용자가 선택한 원본 파일명
- `mimeType`: 브라우저와 서버가 관찰한 파일 형식
- `sizeBytes`: 원본 파일 크기
- `alt`: 이미지 대체 텍스트
- `title`: 선택 입력 제목
- `caption`: 본문 이미지에만 적용되는 선택 입력 caption

### Validation Rules

- `target`은 `body` 또는 `cover`여야 한다.
- `postSlug`는 비어 있으면 안 되며 기존 slug 정책으로 생성 가능한 값이어야 한다.
- `sizeBytes`는 2MB 이하여야 한다.
- 원본 확장자는 `webp`, `png`, `jpg`, `jpeg` 중 하나여야 한다.
- 파일은 서버에서 실제 이미지로 decode 가능해야 한다.
- `alt`는 빈 값일 수 있지만 본문 저장과 SEO 검증을 위해 입력 가능해야 한다.
- `caption`은 cover upload에는 적용하지 않는다.

## Entity: MediaFile

repository에 commit되는 공개 이미지 파일 산출물이다.

### Fields

- `path`: repository 경로
- `publicPath`: MDX와 frontmatter에 저장되는 공개 경로
- `contentBase64`: adapter에 전달되는 이미지 content
- `contentHash`: 정규화된 파일 content hash
- `extension`: 저장 확장자. 기본값은 `webp`
- `sizeBytes`: 저장될 파일 크기
- `sha`: commit 후 repository file sha
- `commitId`: commit provider가 반환한 commit id

### Validation Rules

- `path`는 `public/media/covers/` 또는 `public/media/posts/<slug>/` 아래여야 한다.
- `publicPath`는 `path`에서 `public` prefix를 제거한 절대 공개 경로여야 한다.
- 같은 path를 overwrite하지 않도록 hash suffix를 포함해야 한다.
- 저장 결과의 `sizeBytes`도 2MB 이하여야 한다.

## Entity: EditorImageReference

편집 문서와 저장될 MDX 본문에 포함되는 이미지 참조다.

### Fields

- `src`: 공개 이미지 경로
- `alt`: 대체 텍스트
- `title`: 선택 입력 제목
- `caption`: 선택 입력 caption

### Validation Rules

- `src`는 `/media/`로 시작하는 공개 경로 또는 기존 허용 public path여야 한다.
- `src`는 `blob:`, `data:`, 로컬 파일 경로, 외부 script성 URL이면 안 된다.
- MDX 직렬화는 `![alt](src "title")` 형식을 사용한다.
- `caption`이 있으면 이미지 바로 다음 문단으로 저장한다.

## Entity: CoverImageReference

글 frontmatter에 저장되는 커버 이미지 참조다.

### Fields

- `coverImage`: 공개 이미지 경로
- `alt`: 커버 설명. 현재 frontmatter schema에 직접 필드가 없으면 editor UI state로 보존하거나 후속
  schema 확장 task에서 명확히 한다.

### Validation Rules

- `coverImage`는 `/media/covers/` 아래 공개 경로여야 한다.
- 기존 cover를 새 cover로 교체해도 기존 repository 파일을 자동 삭제하지 않는다.

## Entity: MediaUploadState

운영자가 업로드 진행과 실패를 구분할 수 있게 하는 UI 상태다.

### States

- `idle`: 업로드 요청 없음
- `validating`: 파일 제한과 이미지 decode 검증 중
- `uploading`: repository media commit 진행 중
- `uploaded`: public path가 editor document에 반영 가능함
- `validation-failed`: 형식, 크기, decode, slug 요구사항 실패
- `auth-required`: 세션 없음 또는 만료로 재인증 필요
- `forbidden`: 관리자 identity 불일치 또는 권한 없음
- `temporary-connectivity`: retry 가능한 provider 또는 network 실패
- `failed`: 알 수 없는 실패

### State Transitions

```text
idle -> validating
validating -> validation-failed
validating -> uploading
uploading -> uploaded
uploading -> auth-required
uploading -> forbidden
uploading -> temporary-connectivity
uploading -> failed
validation-failed -> idle
temporary-connectivity -> uploading
failed -> idle
uploaded -> idle
```

### Invariants

- `uploaded` 전에는 저장 가능한 editor document의 image `src` 또는 `coverImage`를 바꾸지 않는다.
- 실패 상태에서는 사용자가 현재 글 편집 내용을 잃지 않아야 한다.
- 성공한 media commit과 글 저장은 별도 상태로 표시되어야 한다.
