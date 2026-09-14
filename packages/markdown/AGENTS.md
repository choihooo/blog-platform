# Markdown 공유 패키지 작업 지침

## 책임

heading, TOC, reading time, slug 정책처럼 문서 변환에 필요한 순수 함수를 담당한다.

- 콘텐츠 저장이나 editor document 변환을 이 패키지에 추가하지 않는다.
- 같은 입력은 같은 결과를 반환하도록 순수 함수로 유지한다.
- heading 추출, TOC 순서, slug 충돌 검증의 기존 계약을 보존한다.
- 한국어·영어·숫자·특수문자 입력을 모두 고려한다.
- 오류는 기존 `ValidationIssue` 계약에 맞춰 반환한다.

## 검증

```sh
pnpm --filter @blog-platform/markdown format:check
pnpm --filter @blog-platform/markdown lint
pnpm --filter @blog-platform/markdown typecheck
pnpm --filter @blog-platform/markdown test
pnpm --filter @blog-platform/markdown build
```
