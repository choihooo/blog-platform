# Editor Package

`packages/editor`는 CMS editor document model, 지원 서식, validation, MDX load/serialize,
round-trip, preview analysis를 소유한다.

`calculateReadingTime(text)`는 본문의 Unicode 단어를 분당 220개 기준으로 계산한다(최소 1분). 전체
노드 분석과 가벼운 공개 목록이 같은 함수를 사용하므로 목차 분석 여부에 따라 읽기 시간이 달라지지
않는다. 빈 문서 preview의 기존 0분 결과는 그대로 유지한다.

MVP supported format:

`textFromPostContent(source)`는 검색을 위한 읽기 전용 plain-text projection이다. 저장된 rich 문서의
표 행·셀과 중첩 텍스트를 읽되, 중복된 inline content는 반복하지 않는다. 깨진 editor envelope는 JSON
자체를 텍스트로 내보내지 않는다. 편집·저장·렌더링에서 지원하는 node 계약은 확장하지 않는다.

- Blocks: paragraph, heading, bullet list, ordered list, blockquote, horizontal rule, image
  reference, code block
- Marks: bold, italic, link, inline code

CMS UI는 Tiptap contenteditable surface를 사용하고, 저장 경계는 repository-compatible MDX를 보장하기
위해 이 package의 native document model과 serializer를 통과한다. 미지원 import/export, JSX, unsafe
HTML, event handler, runtime expression은 편집 가능 상태로 자동 변환하지 않는다.

Image node는 public media path, alt, title, optional caption을 가진다. serializer는
`![alt](src "title")` 형식으로 저장하고 caption은 이미지 바로 아래 paragraph로 보존한다. `blob:`,
`data:`, `file://`, 로컬 절대 경로는 저장 가능한 image 또는 cover path로 허용하지 않는다.
