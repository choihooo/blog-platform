# Editor 공유 패키지 작업 지침

## 책임

CMS editor document model, 지원 서식, validation, structured post content 직렬화, legacy Markdown
fallback, round-trip과 preview 분석을 담당한다.

- 현재 공개 API는 `loadPostContent`, `parsePostContent`, `serializePostContent`,
  `postRecordToEditorDocument` 중심이다. 별도 MDX AST parser가 있다고 가정하거나 이 패키지 밖에
  editor 변환을 복제하지 않는다.

- 저장 가능한 문서는 native document model과 serializer를 통과해야 한다.
- 지원하지 않는 JSX, unsafe HTML, event handler, runtime expression을 자동으로 허용하지 않는다.
- 이미지에는 허용된 public media path와 alt 정보를 요구한다.
- `blob:`, `data:`, `file://`, 로컬 절대 경로를 저장 가능한 이미지 경로로 허용하지 않는다.
- serializer를 바꾸면 parse·serialize round-trip 테스트를 함께 수정한다.
- 저장·발행 경계에서는 `validateEditorDocument`를 먼저 통과시키고, 임시 attachment media가 persisted
  content에 남지 않는지 확인한다.
- heading slug와 reading time은 `analyzeEditorNodes`의 결과를 사용한다.

## 검증

```sh
pnpm --filter @blog-platform/core format:check
pnpm --filter @blog-platform/core lint
pnpm --filter @blog-platform/core typecheck
pnpm --filter @blog-platform/core test
pnpm --filter @blog-platform/core build
```
