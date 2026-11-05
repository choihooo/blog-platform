# Editor Package

`packages/editor`는 CMS editor document model, 지원 서식, validation, structured JSON
load/serialize, round-trip, preview analysis를 소유한다.

`calculateReadingTime(text)`는 본문의 Unicode 단어를 분당 220개 기준으로 계산한다(최소 1분). 전체
노드 분석과 가벼운 공개 목록이 같은 함수를 사용하므로 목차 분석 여부에 따라 읽기 시간이 달라지지
않는다. 빈 문서 preview의 기존 0분 결과는 그대로 유지한다.

MVP supported format:

- Blocks: paragraph, heading, bullet list, ordered list, blockquote, horizontal rule, image
  reference, code block, table
- Marks: bold, italic, link, inline code

## 콘텐츠 보존 계약 (2026-11-05)

현재 저장 형식은 MDX가 아닌 `{ version: 1, nodes: EditorNode[] }` JSON이다. Markdown 문자열은
`loadPostContent`의 legacy fallback으로만 읽는다. JSON을 다시 Markdown으로 바꾸어 저장하지 않는다.

- 텍스트 블록의 선택적 `content: EditorInline[]`는 부분 강조·링크·인라인 코드를 보존한다. 이 필드가
  있으면 `text`를 Markdown으로 재해석하지 않는다. `text`는 검색·SEO용 평문이다.
- 목록은 `items: EditorNode[][]`, 번호 시작은 `start`로 보존한다. 기존 flat list 노드도 지원한다.
- 인용문의 `children`과 표의 `rows: EditorTableCell[][]`는 블록 구조를 보존한다. 셀에는 `body`,
  `header`, 선택적 `colspan`/`rowspan`이 있다. 빈 셀·목록 항목은 빈 paragraph로 정규화한다.
- 이미지의 `caption`/`captionContent`와 선택적 `href`는 본문 문단과 분리한다. 이미지 다음 문단을
  캡션으로 추측하지 않는다.
- `htmlToEditorNodes`는 HTML 트리를 먼저 파싱한다. pre/code의 JSX·제네릭·들여쓰기·빈 줄·마지막
  개행은 원문 그대로 보존하고, script/event handler/unsafe URL은 실행 가능한 콘텐츠로 저장하지
  않는다.
- `editorNodesToTiptap`/`tiptapToEditorNodes`가 CMS 변환을 소유한다. 알 수 없는 노드·mark는 조용히
  삭제하지 않고 거부한다. 저장·발행은 중첩 노드를 포함한 validation을 먼저 통과해야 한다.
- Markdown fallback과 CMS의 일반 텍스트 Markdown 블록 붙여넣기는 markdown-it 파서를 사용한다. raw
  HTML은 실행하지 않는다. 표 편집은 Tiptap TableKit을 사용한다.

확장된 JSON을 쓰기 전에 Blog와 CMS의 호환 렌더러·편집기를 먼저 배포한다. 기존 v1 JSON의 필드는 계속
읽을 수 있지만 이전 앱은 새로운 table 노드를 해석하지 못한다.

CMS UI는 Tiptap contenteditable surface를 사용하고, 저장 경계는 이 package의 native document model과
JSON serializer를 통과한다. JSX·HTML·runtime expression은 실행하지 않는다. 코드 블록 안의 코드는
문자열 그대로 보존한다.

Image node는 public media path, alt, title, optional caption을 가진다. caption은 이미지 속성으로
저장하며 별도의 본문 문단과 구분한다. `blob:`, `data:`, `file://`, 로컬 절대 경로는 저장 가능한
image 또는 cover path로 허용하지 않는다.
