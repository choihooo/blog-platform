# Editor Package

`packages/editor`는 CMS editor document model, 지원 서식, validation, MDX load/serialize,
round-trip, preview analysis를 소유한다.

MVP supported format:

- Blocks: paragraph, heading, bullet list, ordered list, blockquote, horizontal rule, image
  reference, code block
- Marks: bold, italic, link, inline code

CMS UI는 Tiptap contenteditable surface를 사용하고, 저장 경계는 repository-compatible MDX를 보장하기
위해 이 package의 native document model과 serializer를 통과한다. 미지원 import/export, JSX, unsafe
HTML, event handler, runtime expression은 편집 가능 상태로 자동 변환하지 않는다.
