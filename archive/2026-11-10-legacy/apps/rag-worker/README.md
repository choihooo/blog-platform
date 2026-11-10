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

## Gemini 실행 위치와 오류 진단

Worker는 `placement.region = aws:us-east-1`로 미국 동부에 가까운 Cloudflare 실행 위치를 지정한다.
기본 edge 배치에서 Gemini 임베딩이 간헐적으로 HTTP 400의 위치 미지원 오류를 반환한 사례를 재현하여
명시적으로 배치했다. 배치 hint는 고정 egress IP를 보장하지 않으므로 변경 후 `cf-placement` 헤더와
실제 검색·생성 요청을 확인한다. 모델·인덱스·quota 정책은 바꾸지 않는다.

Gemini HTTP 실패는 공급자 상태 코드·작업 이름과 허용한 `location_unsupported` 사유만 내부 로그에
남긴다. 오류 응답 본문은 256 KiB 이내에서만 읽고 저장하거나 로그에 출력하지 않는다. 공개 API의
429/503 계약은 유지하고 지역 오류를 무작정 재시도하거나 다른 모델로 전환하지 않는다.

배치 설정은
[Cloudflare Placement](https://developers.cloudflare.com/workers/configuration/placement/), 지원
지역은 [Gemini 지원 지역](https://ai.google.dev/gemini-api/docs/available-regions)을 따른다.
