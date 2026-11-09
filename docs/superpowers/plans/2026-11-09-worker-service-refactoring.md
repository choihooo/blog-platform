# RAG Worker Service Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [x]`) syntax for tracking.

**Goal:** HTTP·검색·근거 답변·동기화·Gemini 통신 책임을 분리하면서 Worker와 Blog 사이의 계약을
보존한다.

**Architecture:** index는 dispatch, HTTP handler는 입력/응답, service는 순서가 중요한 workflow를
담당한다. retrieval은 primary corpus와 검색·프로필 선택, Gemini HTTP adapter는 외부 통신을 소유한다.
UI와 custom hook은 없으며 일반 함수와 기존 Env binding을 사용한다.

**Tech Stack:** Cloudflare Workers, D1, Vectorize, Workers AI, Gemini REST, TypeScript, Vitest,
Wrangler.

**Spec:** [CMS·Worker 경계 명세](../specs/2026-11-09-cms-worker-boundaries.md)

## Global Constraints

- 새 의존성은 추가하지 않는다.
- 모든 JSON 응답의 `Cache-Control: no-store`를 유지한다.
- sync는 최대 16청크, offset/revision 변경은 409, contentRevision은 provider 독립이다.
- Workers AI `@cf/baai/bge-m3`/1024/`public-v1`/`INDEX`를 유지한다.
- Gemini `gemini-embedding-001`/768/L2/`public-gemini-v1`/`INDEX_GEMINI`를 유지한다.
- wrangler 설정·remote bindings·keep_vars·배포 변수·인덱스·namespace·청크 ID를 바꾸지 않는다.
- 테스트는 fetch·D1·AI·Vectorize를 mock한다. `wrangler dev`·실제 sync CLI는 실행하지 않는다.

## Review Focus

- 인증 누락·잘못된 메서드·비loopback local D1 접근은 현재 상태 코드와 부작용 차단을 유지한다.
  Task 1.
- 답변 생성 중 문서가 삭제/비공개/변경되면 생성물을 반환하지 않는다. Task 2.
- Gemini 429·취소·응답 상한·불완전 출력은 답변 없음으로 숨기지 않는다. Task 3.
- sync 재개 중 corpus 변경 또는 한 임베딩 실패는 잘못된 페이지 upsert를 만들지 않는다. Task 4.
- provider 설정과 오래된 벡터가 섞여도 올바른 namespace 및 fresh primary evidence만 사용한다.
  Task 5.

---

## 파일 배치

| 파일                                     | 책임                                                              |
| ---------------------------------------- | ----------------------------------------------------------------- |
| `src/index.ts`                           | 기존 default fetch export와 route dispatch                        |
| `src/http/response.ts`                   | JSON/no-store 및 기존 오류 응답·sanitized log 매핑                |
| `src/http/access.ts`                     | authorized/isLocalRequest, 타이밍 비교와 loopback 규칙            |
| `src/handlers/{local-d1,search,sync}.ts` | 기존 경로의 입력 검증·상태/응답 조립                              |
| `src/services/answer.ts`                 | 검색 → 생성 → evidence 재검증                                     |
| `src/services/sync.ts`                   | corpus revision·batch·missing embedding·upsert                    |
| `src/providers/gemini-http.ts`           | Gemini REST 요청·timeout·취소·응답 크기 제한                      |
| 기존 `src/retrieval.ts`                  | profileFor/indexFor/corpus/embed/evidenceIds/searchPublished 계약 |
| 기존 `src/gemini.ts`                     | embedGemini/generateGeminiAnswer/waitForEmbeddingDelay 정책       |
| 기존 `scripts/*`                         | dry-run 기본 운영 CLI; 구조 변경하지 않음                         |

현재 런타임 파일이 작으므로 위 책임 이상으로 provider registry나 repository interface 계층을
추가하지 않는다. services는 기존 retrieval 함수와 Env를 직접 사용한다. http를 import하지 않고
구조화된 결과/오류를 반환하며 HTTP mapping은 handler가 맡는다. core/search 순수 알고리즘을 복제하지
않는다.

## 실행 규칙

각 task에서 기존 테스트를 먼저 실행하고 변경 후 같은 진입점으로 비교한다. 기존 테스트는 위치보다
동작을 기준으로 유지한다. 부족한 계약 사례만 추가하고, 새 export를 사용하는 테스트는 구현 전에
실패를 확인한다. source-only 이동에 인위적인 실패 테스트를 만들지 않는다. 원격 호출은 항상 mock한다.
task별 검증 후 diff를 리뷰 가능한 단위로 남기고, 커밋은 사용자가 요청한 시점의 저장소 절차를 따른다.

### Task 1: HTTP dispatch·응답·접근 경계 추출

**Files:** Modify `apps/rag-worker/src/index.ts`, `src/index.test.ts`; create
`src/http/{response,access}.ts`, `src/handlers/local-d1.ts`, `src/http/access.test.ts` under
`apps/rag-worker`.

**Interfaces:** `json(value: unknown, status?: number): Response`,
`authorized(request: Request, secret: string | undefined): boolean`,
`isLocalRequest(request: Request): boolean`,
`localD1Query(request: Request, env: Env): Promise<Response>`는 기존 signature와 동작을 유지한다.
실패 로그는 event/operation/stage/code/errorType만 포함한다. index의 public fetch signature는 바꾸지
않는다.

- [x] Worker typegen/typecheck/test/build 결과와 테스트 수를 기록한다. build는
      `pnpm --filter @blog-platform/rag-worker build`의 `wrangler deploy --dry-run`이다. typegen
      생성 diff는 직접 수정하지 않고 의미를 확인한다.
- [x] HTTP contract 테스트를 고정한다. GET health 200, 잘못된 경로/메서드 404, 토큰 누락 401, 원격
      local D1 404이며 DB 호출 0회, loopback의 잘못된 admin token 401, 모든 JSON에 no-store를
      assert한다.
- [x] 위 helper와 local D1 handler를 그대로 이동한다. missing secret fail closed, 길이 확인 후
      timingSafeEqual, loopback 확인 후 인증 순서를 보존한다. local D1의 SQL 길이 20000·params
      100·기존 first/run/all 처리와 오류 502를 보존한다.
- [x] `pnpm --filter @blog-platform/rag-worker exec vitest run src/index.test.ts src/http/access.test.ts`
      및 Worker typecheck를 실행한다. 아직 검색/동기화 orchestration은 index에 남겨 diff를 제한한다.

### Task 2: 검색 handler와 답변 service

**Files:** Create `apps/rag-worker/src/handlers/search.ts`, `src/services/answer.ts`,
`src/services/answer.test.ts`. Modify `src/index.ts`, `src/pipeline.test.ts`.

**Interfaces:**
`answerPublished(query: string, env: Env, signal: AbortSignal, onStage?: (stage: string) => void): Promise<RagResult>`는
core/search의 현재 result 타입을 사용한다. 순서는 searchPublished → sources가 있으면
generateGeminiAnswer → signal 확인 → primary corpus 재조회 → evidence 비교 → 결과다.
`handleSearch(request: Request, env: Env, mode: 'search' | 'answer'): Promise<Response>`는
boundedJson/queryFrom, 인증 뒤 rate-limit, 상태 매핑을 소유한다. search 응답에서는 evidence를
제거한다.

서비스는 작업 직전에 onStage로 `search`, `generation`, `evidence_revalidation`을 알린다. handler가
이 값을 보관해 catch 시 기존 sanitized log에 전달한다. 예외 message/name은 감싸 바꾸지 않는다.

- [x] pipeline fixture의 D1 all/fetch mock을 사용해 생성 도중 selected evidence가 삭제·비공개·본문
      변경되는 세 사례를 고정한다. 결과 503이며 생성 텍스트가 JSON에 없음을 assert한다. 결과가
      바뀌지 않은 정상 응답과 sources 0일 때 generation 미호출도 확인한다.
- [x] answerPublished를 추출한다. 재검증을 생성 앞으로 옮기거나 캐시 corpus를 재사용하지 않는다.
      evidence 비교의 현재 ID 정렬/선택 URL 규칙을 그대로 사용한다.
- [x] search handler에 validation과 합산 `SEARCH_LIMIT` 키 `portfolio-search`를 옮긴다. `/search`와
      `/answer`가 같은 limiter를 호출하고 불허 시 429, provider 실패 시 503이며 evidence 속성은
      응답에 없음을 검증한다.
- [x] 기존 index/pipeline 및 새 answer 테스트와 Worker typecheck를 실행한다. 오류 stage는
      search/generation/evidence_revalidation을 구분하여 기존 log 의미를 보존한다.

### Task 3: Gemini transport 분리

**Files:** Create `apps/rag-worker/src/providers/gemini-http.ts`, `gemini-http.test.ts`. Modify
`apps/rag-worker/src/gemini.ts`, `src/gemini.test.ts`.

**Interfaces:**
`requestGemini(model: string, method: string, body: unknown, apiKey: string, timeout: number, signal?: AbortSignal): Promise<unknown>`를
기존 private 함수에서 추출한다. 기존 Gemini API URL과 x-goog-api-key header를 유지한다.
embedGemini/generateGeminiAnswer/waitForEmbeddingDelay의 공개 signature는 변경하지 않는다.

- [x] 기존 Gemini 테스트를 실행한다. transport 테스트에 HTTP 429 → rate_limited, 262144바이트 초과 →
      gemini_invalid_response, 취소 시 fetch 중단, invalid model/key는 미호출, 실패 response body
      cancel을 고정한다.
- [x] requestGemini만 providers로 이동한다. timeout과 상위 signal 결합, stream releaseLock, byte
      한계, JSON parse 순서를 유지한다. 신뢰성 개선이라는 이유로 자동 HTTP retry를 추가하지 않는다.
- [x] 기존 생성 테스트에서 STOP 아닌 출력·thought 제외·4000자 초과·임의 링크 제거·조직 누락 재요청
      1회/20초 예산을 확인한다. 임베딩은 768차원 유한수·영벡터 거부·L2 norm 약 1·task type을
      확인한다.
- [x] 새 transport/기존 gemini/pipeline 테스트와 Worker typecheck를 실행한다. provider 오류가
      service/HTTP까지 현재 상태 코드로 전달되는지 확인한다.

### Task 4: sync handler와 서비스 분리

**Files:** Create `apps/rag-worker/src/handlers/sync.ts`, `src/services/sync.ts`,
`src/services/sync.test.ts`. Modify `apps/rag-worker/src/index.ts`, `src/pipeline.test.ts`.

**Interfaces:**
`SyncInput = {offset: number; slug?: string; revision?: unknown; dryRun?: unknown}`는 현재 검증
순서를 보존하기 위해 후반 검증 필드를 즉시 boolean/string으로 강제하지 않는다.
`syncPublished(input: SyncInput, env: Env, signal: AbortSignal, onStage?: (stage: string) => void)`는
기존 sync 결과 union 또는 `{error:'corpus_changed_restart_sync'}`/`{error:'invalid_body'}`와
status를 가진 결과를 반환한다. `handleSync(request: Request, env: Env): Promise<Response>`는
auth/JSON/초기 offset·slug 검증과 서비스 결과 HTTP 변환을 맡는다. 반환 DTO를 같은 파일에서 명시한다.

onStage는 `corpus`, `vector_lookup`, `embedding`, `vector_upsert`를 해당 작업 직전에 알린다. Task
2와 같은 방식으로 handler가 실패 stage와 기존 오류 name/message를 보존한다.

- [x] 기존 dry-run/revision fixture로 total/revision/contentRevision/profile/requests/nextOffset
      필드를 고정한다. dryRun에서는 AI/fetch/upsert 미호출, offset > 0에서 revision 불일치 409를
      확인한다.
- [x] 17개 이상 청크 fixture로 페이지 최대 16·다음 offset을 확인한다. 이미 존재하는 벡터는
      embed/upsert 대상에서 빠지고, 누락 벡터 중 한 embedding이 실패하면 그 페이지 upsert가 0회임을
      assert한다.
- [x] 기존 sync 블록을 service로 이동한다. corpus 읽기 → 두 revision 계산 → offset revision 검사 →
      dryRun 타입 검사 순서를 유지한다. ID revision은 chunk.id join의 SHA256, contentRevision은
      key/title/url/embeddingText projection JSON의 SHA256을 그대로 사용한다.
- [x] handler를 연결한다. 성공/실패 payload, batch 끝의 nextOffset, 400/409/429/503 매핑과 sanitized
      stage log를 유지한다. 실제 CLI나 Vectorize를 실행하지 않는다.
- [x] 기존 pipeline/sync-options와 새 sync 테스트, Worker typecheck를 실행한다. sync-options CLI의
      dry-run 기본값/remote 허용/요청 속도 제한 테스트는 그대로 통과해야 한다.

### Task 5: retrieval 계약·교차 앱 문서·최종 검증

**Files:** Create `apps/rag-worker/src/retrieval.test.ts`, `src/architecture.test.ts`. Modify
`apps/rag-worker/README.md`, `specs/016-gemini-rag/contracts/rag-api.md`; 실제 폴더 위치로 import
문서 갱신. 필요 시 `src/retrieval.ts`의 import만 조정하며 알고리즘은 유지한다.

**Interfaces:** profileFor/indexFor/corpus/embed/evidenceIds/searchPublished 공개 함수는 현재
signature를 유지한다. 두 provider를 통합하는 새 default나 설정 rename을 만들지 않는다. Worker
fetch와 Blog BFF의 RagResult payload는 그대로다.

- [x] 두 provider fixture에서 모델·차원·namespace·index binding·QUERY/DOCUMENT 구분을 assert한다.
      Gemini MIN_SCORE 미설정 시 기존 오류를 유지하고 Workers AI 기본 profile을 유지한다. provider
      독립 contentRevision과 provider별 revision 분리를 Task 4 fixture로 비교한다.
- [x] 오래된 Vectorize ID를 반환한 뒤 D1의 fresh 공개 원문으로 결과를 거르는 테스트를 작성한다. D1
      primary 실패/1000개 초과는 corpus_unavailable이며 오류를 sources 0으로 숨기지 않는다.
- [x] architecture 테스트는 TS import AST로 index의 handler 진입, service의 http 역방향 import 금지,
      provider의 handlers/services 역방향 import 금지를 검사한다. 값/type import를 구분하고 기존
      core/search 의존성은 허용한다. 전용 프레임워크는 추가하지 않는다.
- [x] 기존 RAG API 문서에서 삭제된 Blog local/Kanana 생성·NEXT_PUBLIC_RAG_CHAT_MODE 설명을 실제 Blog
      호출부와 대조하여 정정한다. Worker의 `/search`·두 임베딩 profile·legacy 인덱스는 유지한다.
      요청/응답/status가 바뀌지 않았음을 명시한다.
- [x] Worker `typegen`, `typecheck`, `test`, `build`를 실행한다. Blog의 RAG BFF와 revalidate 계약
      테스트를 실제 경로로 찾아 함께 실행한다. typegen 이외 wrangler/bindings 변경이 없고 테스트 중
      외부 쓰기 호출이 없음을 diff/mock으로 확인한다.
- [x] `docs/audits/2026-11-09-worker-service-refactoring.md`에 기준/최종 테스트 결과와 책임 지도를
      남긴다. 배포·재임베딩·sync 실행을 완료 조건에 추가하지 않는다.

## 완료 조건과 자체 검토

각 task의 테스트 및 Worker 필수 검사가 통과하고 endpoint·payload·비공개 보호·profile·revision
불변성이 유지되어야 한다. index에는 생성/동기화 본문이 남지 않고, Gemini transport만 별도 adapter가
된다. 함수 수를 줄이기 위해 검색 후/생성 후 primary D1 검증을 합치지 않는다.

자체 검토: UI/custom hook은 적용 대상이 없음을 명세와 계획에 명시했다. HTTP/BFF는 Task 1·2·4, 서비스
책임은 Task 2~4, 공통 utility는 Task 1·3, retrieval profile/경계는 Task 5에 연결했다. Review Focus
5개 모두 task의 구체적 assertion과 연결된다. 운영 CLI/리소스 변경은 없다.
