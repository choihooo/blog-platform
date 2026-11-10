# Contract: Editor Media State

## Purpose

CMS editor UI가 media upload 상태를 저장 가능한 editor document와 분리해서 관리하기 위한 contract다.

## Body Image Insert Flow

1. 운영자가 toolbar의 image button을 선택한다.
2. UI는 파일 선택과 `alt`, `title`, `caption` 입력을 받는다.
3. UI는 `uploading` 상태를 표시하고 `uploadEditorMediaAction`을 호출한다.
4. 성공 시 action이 반환한 image node를 현재 cursor 위치 또는 본문 끝에 삽입한다.
5. 실패 시 editor body는 변경하지 않고 실패 상태와 재시도 가능 여부를 표시한다.

## Cover Image Flow

1. 운영자가 frontmatter panel에서 cover upload를 선택한다.
2. UI는 파일 선택과 설명 입력을 받는다.
3. UI는 `uploading` 상태를 표시하고 `uploadEditorMediaAction`을 호출한다.
4. 성공 시 `frontmatter.coverImage`를 반환된 `coverImage` 공개 경로로 갱신하고 dirty 상태로
   전환한다.
5. 실패 시 `frontmatter.coverImage`를 변경하지 않고 실패 상태를 표시한다.

## Save Interaction

- media upload 성공은 media file commit 성공만 의미한다.
- 글 저장은 기존 `saveEditorDraftAction` 흐름으로 별도 수행한다.
- media upload 성공 후 글 저장 전에는 운영자에게 글 저장이 아직 필요하다는 상태를 보여준다.
- 글 저장 실패 시 media file은 삭제하지 않고 editor document와 local backup이 public path 참조를
  보존한다.

## Forbidden State

- `blob:`, `data:`, `file://`, 절대 로컬 경로는 editor document의 image `src`와 `coverImage`에
  저장할 수 없다.
- pending upload placeholder는 저장 가능한 editor document body에 포함할 수 없다.
- 실패한 upload의 임시 정보는 local draft backup에 저장 가능한 콘텐츠로 직렬화하지 않는다.

## Accessibility and UI

- image upload button은 lucide image icon과 접근 가능한 label을 가져야 한다.
- 업로드 상태는 성공, 진행 중, 실패, 재시도 가능 여부를 텍스트로도 전달해야 한다.
- 버튼과 입력은 기존 design-system primitive를 사용한다.
