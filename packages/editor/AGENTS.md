# Editor 공유 패키지 작업 지침

## 책임

CMS editor document model, 지원 서식, validation, MDX 변환, round-trip과 preview 분석을 담당한다.

- 저장 가능한 문서는 native document model과 serializer를 통과해야 한다.
- 지원하지 않는 JSX, unsafe HTML, event handler, runtime expression을 자동으로 허용하지 않는다.
- 이미지에는 허용된 public media path와 alt 정보를 요구한다.
- `blob:`, `data:`, `file://`, 로컬 절대 경로를 저장 가능한 이미지 경로로 허용하지 않는다.
- serializer를 바꾸면 parse·serialize round-trip 테스트를 함께 수정한다.

## 검증

```sh
pnpm --filter @blog-platform/editor format:check
pnpm --filter @blog-platform/editor lint
pnpm --filter @blog-platform/editor typecheck
pnpm --filter @blog-platform/editor test
pnpm --filter @blog-platform/editor build
```
