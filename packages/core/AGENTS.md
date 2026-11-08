# Core 작업 지침

공통 코드는 용도별 subpath로 제공한다. 앱·Next.js·CMS 인증 모듈을 참조하지 않는다.

- content·seo·analytics는 Node 저장소와 분리한다.
- 공개 계약과 기존 fixture를 보존하고 rich content round-trip을 검증한다.
- `pnpm --filter @blog-platform/core format:check`, `lint`, `typecheck`, `test`, `build`를 실행한다.
