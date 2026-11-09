# RAG Worker

Blog BFF 뒤에서 공개 D1 corpus와 Vectorize를 조회하고 Gemini 근거 답변을 생성한다.

## 책임 경계

- `src/index.ts`: 기존 fetch export와 경로 dispatch.
- `src/http`: no-store JSON 응답·오류 매핑·인증·loopback 확인.
- `src/handlers`: local D1·검색/답변·sync의 입력 검증과 HTTP 응답.
- `src/services`: 생성 후 primary evidence 재검증과 sync revision/batch 처리.
- `src/retrieval.ts`: 프로필·인덱스 선택, primary corpus, 임베딩·검색.
- `src/gemini.ts`, `src/providers/gemini-http.ts`: 임베딩/생성 정책과 외부 REST 통신.
- `scripts`: 기존 dry-run 기본 동기화 CLI. 구조 변경 중 실행하지 않는다.

서비스는 HTTP 계층에 의존하지 않는다. `onStage` callback은 실패 시 기존 sanitized log의 stage만
보존하며 query·모델 응답·secret은 기록하지 않는다. `src/architecture.test.ts`가 역방향 의존성을
검사한다.

## 보존 계약과 검증

토큰과 endpoint, 16청크 sync·409 revision 재시작, 검색 후/생성 후 primary 원문 검증, Workers AI
1024차원/INDEX/public-v1과 Gemini 768차원/L2/INDEX_GEMINI/public-gemini-v1을 유지한다. Blog의
브라우저 로컬 모델 제거를 이유로 Workers AI 임베딩 프로필을 제거하지 않는다.

`pnpm --filter @blog-platform/rag-worker` 뒤에 `typegen`, `typecheck`, `test`, `build`를 각각
실행한다. build는 `wrangler deploy --dry-run`이며 배포하지 않는다. 테스트는 외부
fetch·D1·AI·Vectorize를 mock한다. local dev의 remote binding도 원격 쓰기를 수행할 수 있으므로 실제
sync/dev 실행으로 테스트를 대신하지 않는다.

세부 payload는 [RAG API 계약](../../specs/016-gemini-rag/contracts/rag-api.md), 운영은
[runbook](../../docs/runbooks/2026-11-06-gemini-rag.md)을 따른다.
