# 블로그 플랫폼 작업 지침

## 저장소 구조

- `apps/blog`: 픽셀룸 기반 공개 포트폴리오·블로그
- `apps/cms`: 비공개 운영자용 CMS
- `apps/rag-worker`: Cloudflare Worker 기반 검색·RAG API
- `packages/*`: 여러 앱에서 공유하는 TypeScript 패키지

## 기본 원칙

- 작업 전 현재 변경 사항을 확인하고, 관련 없는 변경은 보존한다.
- 소스 파일은 `apply_patch` 방식으로 수정한다.
- 비밀키, `.env` 파일, 개인 모델 파일을 커밋하지 않는다.
- 생성물인 `.next`, `dist`, `.turbo`, `.wrangler`를 직접 수정하지 않는다.
- 새 의존성은 기존 패키지로 해결할 수 없는 경우에만 추가한다.
- 패키지의 공개 API나 데이터 계약을 바꾸면 해당 패키지의 테스트와 README를 함께 확인한다.

## 패키지 경계

- 앱의 UI·라우팅 변경은 해당 앱에서 처리한다.
- 공유 로직은 먼저 관련 `packages/*`의 책임에 해당하는지 확인한다.
- 콘텐츠 데이터는 UI 컴포넌트 안에 하드코딩하지 않는다.
- Cloudflare 리소스 변경은 `apps/rag-worker`의 설정과 문서를 함께 확인한다.

## 검증

변경 범위에 맞는 가장 좁은 검증부터 실행한다.

```sh
pnpm --filter <패키지명> lint
pnpm --filter <패키지명> typecheck
pnpm --filter <패키지명> test
```

라우팅·공개 콘텐츠·공유 패키지 계약을 바꾼 경우에는 필요에 따라 다음을 추가한다.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## 완료 보고

최종 응답에는 다음을 간단히 기록한다.

- 수정한 파일과 핵심 변경
- 실행한 검증 명령과 결과
- 아직 실행하지 못한 검증 또는 남은 위험
