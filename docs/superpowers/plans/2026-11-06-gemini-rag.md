# Gemini RAG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [x]`) syntax for tracking.

**Goal:** 무료 등급부터 시험할 수 있도록 임베딩·답변 생성을 Gemini API로 전환하고 기존 검색과
독립적으로 롤백한다.

**Architecture:** D1과 Vectorize는 유지하고 Gemini 임베딩은 별도 768차원 인덱스에 저장한다. Worker가
Gemini 호출을 담당하며 기존 `/search`·`/sync` 외에 인증된 `/answer`를 제공한다. Next의 확정 답변
경로와 공개 JSON 계약은 유지하고 일반 질문만 새 생성 경로로 전달한다.

**Tech Stack:** TypeScript, Next.js, Cloudflare Workers/D1/Vectorize, Gemini REST API, Vitest, pnpm.

**Spec:** [전환 설계](../specs/2026-11-06-gemini-rag.md). 구현 전 이 파일과 설계, 수정 경로의
`AGENTS.md`를 함께 읽는다.

## Global Constraints

- 기존 미커밋 변경을 보존하고 구현 시 별도 worktree를 사용한다. 특히 Worker package.json과 콘텐츠
  파서는 이미 수정 중이다.
- 새 SDK·공유 패키지를 추가하지 않는다. `packages/ai`는 현재 존재하지 않으므로 새 추상 계층을 만들지
  않는다.
- 기존 1024차원 인덱스와 `public-v1`을 보존한다. Gemini: `gemini-embedding-001`, 768차원, cosine,
  `public-gemini-v1`.
- 질문 600자, 근거 3개·각 550자, 답변 4000자, sync 16청크·revision, 공개 상태 재확인 계약을
  유지한다.
- 공급자 키는 Worker secret이며 공개 환경변수에 넣지 않는다. 무료 할당량은 AI Studio 실제 값으로
  확인한다.
- 원격 index 생성·sync·배포·secret 등록·유료 전환은 이 계획 작성에 포함되지 않는다.
- 각 구현 Task는 실패 테스트 → 최소 구현 → 재검증 → 해당 파일만 commit 순으로 진행한다.

## Review Focus

1. 같은 차원 또는 같은 문서라도 모델 프로필이 다르면 재사용하지 않아야 한다 — Task 1/2.
2. 무료 quota 소진·취소·응답 차단이 근거 없음이나 부분 성공으로 바뀌면 안 된다 — Task 2/3.
3. 검색 직후 비공개 전환·본문 변경 시 옛 벡터와 조작된 문맥이 근거로 노출되면 안 된다 — Task 2/3.
4. 모바일·WebGPU 미지원 브라우저에서도 Gemini 모드는 모델 다운로드 없이 동작해야 한다 — Task 4.
5. 부분 sync·전환 후 콘텐츠 수정·rollback 시 누락과 provider 혼합이 없어야 한다 — Task 5/6.

## 파일 구조

| 경로                                                                                                        | 역할                                                                   |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `apps/blog/features/rag/embedding-profile.ts` (신규)                                                        | 양쪽 앱이 쓰는 순수 프로필·지문, 기존 corpus 공유 패턴 유지            |
| `apps/blog/features/rag/corpus-chunking.ts`, `corpus-matching.ts`, `corpus.ts`                              | 프로필별 ID, 검색 컷오프 매개변수                                      |
| `apps/rag-worker/src/gemini.ts` (신규)                                                                      | 임베딩·생성 REST 호출과 응답 검증                                      |
| `apps/rag-worker/src/retrieval.ts` (신규)                                                                   | index 선택, 검색 후 최신 공개 corpus 대조; index.ts에서 관련 함수 이동 |
| `apps/rag-worker/src/index.ts`, `wrangler.jsonc`, `worker-configuration.d.ts`                               | 라우트·binding·provider 설정                                           |
| `apps/blog/features/rag/server.ts`, `contracts.ts`, `app/api/rag/route.ts`                                  | provider별 Worker 호출과 기존 응답 계약                                |
| `apps/blog/features/pixel-room/portfolio-chat.tsx`, `portfolio-chat-remote.tsx`, `portfolio-chat-local.tsx` | 모드 선택·원격 답변 UI·기존 Kanana UI 보존                             |
| `apps/rag-worker/scripts/sync.mjs`, `sync-options.mjs` (신규)                                               | dry-run, 속도 제한, 명시적 실행과 재시작                               |
| `apps/blog/scripts/evaluate-rag.mjs`, `docs/fixtures/rag-gemini-evaluation.json` (신규)                     | 검색·생성 비교 평가                                                    |
| `specs/016-gemini-rag/contracts/rag-api.md` (신규)                                                          | 앱 사이 route·payload·상태 전이 계약                                   |
| `docs/runbooks/2026-11-06-gemini-rag.md` (신규)                                                             | 원격 전환·재실행·롤백 절차                                             |

## Task 1: 임베딩 프로필과 기존 ID 호환

**Files:** 위 프로필·corpus 파일, 신규 `embedding-profile.test.ts`, 기존 `rag.test.ts`.

**Interfaces:**

- `EmbeddingProfile`: `id`, `provider`, `model`, `dimensions`, `namespace`, `inputVersion`,
  `minScore`.
- `embeddingProfile(provider: "workers-ai" | "gemini", geminiMinScore?: number): EmbeddingProfile`.
- `chunkDocuments(documents: RagDocument[], profile?: EmbeddingProfile): Promise<RagChunk[]>`.
- `currentMatches(chunks, matches, query?, minScore?: number)`; 기존 기본값 0.48 유지.
- legacy 기본 프로필은 기존 ID 직렬화를 그대로 유지한다. Gemini minScore 미설정은 검색 활성화 시
  오류다.

- [x] **1. 실패 테스트 작성:** 기존 문서의 legacy ID snapshot은 동일하고 Gemini ID는 다르며,
      dimensions·입력 버전 변경도 ID를 바꾼다. 같은 프로필 재실행은 같은 ID다. 예:
      `expect(legacyAfter.id).toBe(legacyBefore.id); expect(gemini.id).not.toBe(legacyAfter.id)`.
- [x] **2. 실패 확인:**
      `pnpm --filter @blog-platform/blog test -- features/rag/embedding-profile.test.ts` — 새 프로필
      미구현으로 실패해야 한다.
- [x] **3. 구현:** 청크 경계 500자·중첩 50자와 taxonomy 입력은 유지한다. Gemini 지문에 document task
      type과 L2 정규화 버전도 포함한다. 프로필은 캐시된 전역 상태가 아닌 요청별 값으로 전달한다.
- [x] **4. 통과 확인:** 위 테스트 및
      `pnpm --filter @blog-platform/blog test -- features/rag/rag.test.ts` — 기존
      cutoff·stale·taxonomy 회귀 포함 통과.
- [x] **5. Commit:** Task 1의 실제 변경 파일만 선택해 `feat(rag): version embedding profiles`.

## Task 2: Gemini 임베딩과 Worker의 두 인덱스 지원

**Files:** 신규 `gemini.ts`, `gemini.test.ts`, `retrieval.ts`, 기존 `index.ts`, `index.test.ts`,
`wrangler.jsonc`, generated types, Worker `AGENTS.md`.

**Interfaces:**

- `embedGemini(input: { texts: string[]; taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY"; apiKey: string; signal?: AbortSignal }): Promise<number[][]>`.
- `searchPublished(query: string, env: Env, signal?: AbortSignal): Promise<RagResult>`.
- `RAG_EMBEDDING_PROVIDER=workers-ai|gemini` (기본 workers-ai), `GEMINI_MIN_SCORE`,
  `GEMINI_EMBED_DELAY_MS`.
- 기존 `INDEX`·`AI` 유지, 새 `INDEX_GEMINI` binding 추가. `GEMINI_API_KEY`는 secret.

- [x] **1. 실패 테스트 작성:** mock HTTP에서 모델·768·두 task type을 확인한다. `[3,4,...0]` 벡터는
      `[0.6,0.8,...0]`으로 정규화한다. 0벡터·767차원·NaN·벡터 누락·401·429·타임아웃은 실패하고
      upsert하지 않는다.
- [x] **2. 실패 확인:**
      `pnpm --filter @blog-platform/rag-worker test -- src/gemini.test.ts src/index.test.ts` —
      Gemini 모듈/분기 부재로 실패.
- [x] **3. 구현:** `batchEmbedContents`나 유료 Batch API 대신 표준 `embedContent`를 청크별 순차
      호출한다. 요청 timeout 10초, 무자동재시도. 취소 시 남은 청크 호출 중단. sync batch 도중
      실패하면 페이지 전체를 upsert하지 않아 같은 offset으로 재실행할 수 있게 한다.
- [x] **4. Worker 연결:** sync·검색·currentMatches가 동일 프로필을 사용하도록 연결한다. `/sync`에
      선택적 `dryRun: true`를 추가해 total·revision·profile만 반환하고 AI/upsert를 호출하지 않는다.
      검색 후 primary D1 공개 원문 재조회 순서를 유지한다. 부분 sync 재시도는 기존 ID를 건너뛴다.
- [x] **5. 회귀 테스트:** legacy namespace 유지, Gemini namespace 분리, 잘못된 provider 설정 실패,
      sync revision 변경 409, 검색 뒤 삭제/비공개/수정 청크 제외, auth 전 AI 호출 0회 확인.
- [x] **6. 통과 확인:** Worker test·typegen·typecheck·build 실행. build는
      `wrangler deploy --dry-run`만 수행하며 원격 배포하지 않는다.
- [x] **7. Commit:** `feat(rag): support Gemini embeddings in a separate index`.

## Task 3: Worker 답변 생성과 Next API 연결

**Files:** `gemini.ts`, `index.ts`, 각각의 테스트, Blog `server.ts`, `contracts.ts`,
`app/api/rag/route.ts`; 신규 `features/rag/generation.test.ts`,
`specs/016-gemini-rag/contracts/rag-api.md`.

**Interfaces:**

- `generateGeminiAnswer(input: { query: string; sources: RagSource[]; apiKey: string; model: string; signal?: AbortSignal }): Promise<string>`.
- Worker `/answer` POST `{ query: string }` → `RagResult` with `answer`, protected by
  `RAG_SEARCH_TOKEN`.
- `/search` stays retrieval-only; `/sync` stays admin-only. `/answer` and `/search` share
  `SEARCH_LIMIT`.
- Next `RAG_ANSWER_PROVIDER=local|gemini` (default local) selects `/search` or `/answer` only after
  existing factual/conversation paths.
- Public `/api/rag` remains JSON; no new stream/payload type. Successful Gemini retrieval must have
  an answer; missing answer is 503.

- [x] **1. 실패 테스트 작성:** factual·clarification·no-evidence results bypass generation; normal
      evidence makes exactly one generation call. `expect(generate).not.toHaveBeenCalled()` for no
      evidence. Provider 429→429, timeout/blocked/empty/MAX_TOKENS→503, never no-evidence. Oversized
      answer rejected; no silent truncation.
- [x] **2. 실패 확인:**
      `pnpm --filter @blog-platform/blog test -- features/rag/generation.test.ts`와 Worker 대상
      테스트 — 새 endpoint/provider가 없어 실패해야 한다.
- [x] **3. 구현:** Worker에서 server-owned 검색 결과만 prompt에 넣는다. 기존 grounded 지시를
      재사용하고 최대 3×550자 자료·1024 출력토큰·생성 timeout 20초를 설정한다. 제목과 출처 링크는
      원본 배열을 그대로 반환하며 모델이 만든 출처를 파싱하지 않는다. Next 전체 Worker 호출
      timeout은 Gemini 모드에서 35초로 명시한다.
- [x] **4. 입력·상태 회귀:** same-origin·bounded JSON·600자·no-store·취소·후속 질문 계약 유지.
      변조된 client context가 본문 근거로 전달되지 않는지와 자료 내 악성 지시가 system 지시와
      분리되는지 검증한다. 실제 환각 여부는 Task 6의 실응답 평가로 확인한다.
- [x] **5. 통과 확인:** Worker tests 및 Blog의 `generation`, `rag`, `follow-up-api`,
      `visitor-coverage` 테스트. API 문서에 provider 설정과 400/429/503·실패 시 무대체 정책 기록.
- [x] **6. Commit:** `feat(rag): generate grounded answers through Gemini`.

## Task 4: 다운로드 없는 채팅 모드

**Files:** 기존 `portfolio-chat.tsx`를 모드 wrapper로 변경, 기존 구현을 `portfolio-chat-local.tsx`로
이동; 신규 `portfolio-chat-remote.tsx`, `portfolio-chat-remote.test.tsx`; 기존
`portfolio-chat-messages.tsx`, `chat-answer.test.tsx`, `portfolio-chat-types.ts`는 필요한 부분만
변경.

**Interfaces:**

- 기존 `PortfolioChat({ diagnostics?: boolean })` 호출부 유지.
- `NEXT_PUBLIC_RAG_CHAT_MODE=local|remote` (default local); 이 값은 비밀이 아니다.
- remote 컴포넌트는 `/api/rag`에 `{ query, context }`를 보내고 검증된 `answer`·`sources`를 표시한다.
- local 경로는 dynamic import로 분리하고 remote 경로에서 Kanana·WASM·WebGPU 감지를 실행하지 않는다.

- [x] **1. 실패 테스트 작성:** 서버 답변·출처 표시, 429 안내, 중복 전송 차단, 중단/닫기/언마운트 후
      늦은 응답 무시, 조작된 응답 거절을 검증한다. `navigator.gpu`가 없어도 remote 입력이 가능하고
      모델 loader 호출이 0회임을 확인한다.
- [x] **2. 실패 확인:**
      `pnpm --filter @blog-platform/blog test -- features/pixel-room/portfolio-chat-remote.test.tsx`.
- [x] **3. 구현:** 기존 Hozui 채팅 UI·키보드 포커스·출처 표시를 재사용한다. JSON 응답을 기다리는
      로딩 상태를 제공하고 token streaming처럼 표시하지 않는다. remote에서 로컬 모델 진단·Q4/Q8
      선택·다운로드 문구를 표시하지 않는다.
- [x] **4. 통과 확인:** 신규 테스트·기존 chat-answer·Kanana 관련 테스트 실행. 기존 의존성과
      prebuild는 롤백 기간 유지하되 브라우저 다운로드가 없는지 실제 네트워크로 Task 6에서 확인한다.
- [x] **5. Commit:** `feat(chat): add server-generated chat without model downloads`.

## Task 5: 할당량을 고려한 동기화·평가·운영 문서

**Files:** `scripts/sync.mjs`, 신규 `scripts/sync-options.mjs`, `src/sync-options.test.ts`; 신규
Blog `scripts/evaluate-rag.mjs`, `docs/fixtures/rag-gemini-evaluation.json`, 운영 runbook;
`docs/rag-integration.md`, Blog README·Worker AGENTS 갱신.

**Interfaces:**

- `parseSyncOptions(argv: string[]): { endpoint: string; execute: boolean; requestsPerMinute: number; offset: number; revision?: string }`.
- `sync.mjs` 기본 동작은 dry-run. 실제 sync는 `--execute --requests-per-minute N`; remote에는 추가
  `--allow-remote`가 필요하다. 실제 승인 여부는 실행자가 별도로 확인한다.
- `evaluate-rag.mjs --endpoint URL --cases FILE --output FILE`은 명시된 endpoint만 호출한다. 운영
  endpoint를 기본값으로 넣지 않는다.

- [x] **1. 실패 테스트 작성:** 기본 dry-run에서 유료 호출·upsert 0회, remote 실행 옵션 누락 거절,
      음수 RPM 거절, 429에서 offset/revision을 기록하고 종료, 재시작 시 이미 저장된 ID 재임베딩
      생략.
- [x] **2. 실패 확인:** `pnpm --filter @blog-platform/rag-worker test -- src/sync-options.test.ts`.
- [x] **3. 구현:** sync 페이지당 16개와 요청당 1개 임베딩을 기준으로 페이지 간 최소 대기시간을
      계산한다. Worker 내부 간격도 별도로 적용한다. Retry-After가 있어도 자동 무한 재시도하지
      않는다. 보고서에는 원문·비밀키 없이 count/profile/revision/offset/실패 단계만 기록한다.
- [x] **4. 평가 세트 작성:** 고정 긍정 20문항(경력·프로젝트·기술 글·한국어 변형), 부정 10문항(허위
      경력·없는 글·무관 질문), 후속 질문 5개, prompt injection 3개. 각 질문에 허용 출처 URL·금지
      주장·응답 종류를 기록한다. 임베딩 검색만의 평가와 생성 API 평가를 분리한다.
- [x] **5. 품질 기준:** 같은 corpus revision에서 BGE/Gemini 검색을 비교한다. 별도 calibration
      10문항에서 cutoff를 선택하고 Task 5의 긍정 20·부정 10문항은 holdout으로 남긴다. 긍정
      Recall@3는 legacy 이상·90% 이상, 부정 오탐 0, 비공개/stale 노출 0을 전환 기준으로 삼는다.
      holdout을 보고 cutoff를 재조정하면 새 holdout을 준비한다. 생성 답변은 출처 불일치·허위
      경력/수치 추가·주입 지시 수행 0건이어야 한다.
- [x] **6. runbook 기록:** 아래 Task 6의 순서·요청 승인 경계·실측 quota·정확한 롤백 설정을 적는다.
      과거 문서는 삭제하지 않고 현재 흐름을 상단에 추가한다. 무료 데이터 처리 조건과 aggregate
      제한의 한계도 기록한다.
- [x] **7. 통과 확인 및 Commit:** Worker 테스트·문서 format 검사 통과 후
      `chore(rag): add paced indexing and evaluation runbook`.

## Task 6: 통합 검증과 단계별 전환

**Files:** `docs/runbooks/2026-11-06-gemini-rag.md`, 신규 `docs/audits/2026-11-06-gemini-rag.md`.
원격 실행 전에는 코드와 명령 예시까지만 준비한다.

- [x] **1. 로컬 회귀:** Worker `typegen`, `typecheck`, `test`, `build`; Blog `format:check`, `lint`,
      `typecheck`, `test`, `build` 실행. 기존 무관한 실패는 분리 기록한다. remote binding을 쓰는
      로컬 서버도 원격 사용량이 발생하므로 mock 통과와 혼동하지 않는다.
- [ ] **2. 원격 사전 확인:** runbook id `gemini-rag-20261106`, 사용자 실행 요청, 무료 프로젝트·실제
      quota·모델 접근·secret 등록 위치를 확인한다. secret 값을 채팅·로그에 출력하지 않는다.
- [ ] **3. 후보 준비:** 별도 768/cosine 인덱스와 후보 Worker를 생성한다. INDEX는 기존 인덱스,
      INDEX_GEMINI는 새 인덱스에 연결한다. provider=Gemini인 후보에서 dry-run으로 총
      청크·revision·예상 요청 수를 확인하고 실행 속도를 quota에 맞춘다.
- [ ] **4. 재임베딩:** 승인된 full sync 실행, 중단·재실행 기록, 비동기 반영 완료를 확인한다. 새
      인덱스가 비었거나 불완전하면 운영 검색을 전환하지 않는다. 문서/질문에 같은 프로필을 사용했는지
      확인한다.
- [ ] **5. 임베딩 전환 검증:** 생성은 local로 둔 채 Task 5 평가를 수행한다. cutoff와 품질 기준을
      만족한 후보 Worker로 RAG_API_URL을 전환한다. CMS public-refresh가 새 Worker의 `/sync`를
      호출하는지도 확인한다.
- [ ] **6. 생성 전환 검증:** 후보 Next에서 RAG_ANSWER_PROVIDER=gemini와
      NEXT_PUBLIC_RAG_CHAT_MODE=remote를 함께 적용해 빌드한다. 모바일·데스크톱의 실제
      질문/취소/429·출처·후속 질문을 확인하고 `.gguf`·모델 shard·wllama 요청 0건을 기록한다. local
      UI + server answer 등 설정 조합도 실패 없이 동작하는지 검증한다.
- [ ] **7. SEO 및 최종 보고:** 현재 후보 소스의 홈·블로그·글 상세 메타데이터와 본문이 유지되는지
      관련 SEO 스킬로 확인한다. mock/실제 API/브라우저/미검증 범위를 나눠 보고하고, 운영 승격은
      사용자 요청 범위 안에서만 실행한다.
- [ ] **8. 롤백 연습:** 생성만 되돌리려면 Next provider=local·UI mode=local로 함께 재배포한다.
      임베딩은 legacy profile 후보에서 현재 corpus를 재동기화하고 반영·품질 확인 후 endpoint를
      되돌린다. 마지막 검증 때의 worker artifact·Next 배포 ID·revision을 기록한다. 새 인덱스는 즉시
      삭제하지 않는다.
- [ ] **9. Commit:** 검증·운영 기록만 `docs(rag): record Gemini rollout verification`으로 저장한다.
      롤백 기간의 Kanana/Workers AI 제거는 별도 후속 작업이다.

## 자체 검토

- 검색·동기화·stale 검증의 프로필 일관성과 legacy ID 호환: Task 1/2.
- 무료 할당량·호출 제한·인증·실패·취소: Task 2/3/5.
- 확정 답변·출처·클라이언트 문맥·모바일 UI: Task 3/4/6.
- 별도 인덱스·재임베딩·검색 컷오프 평가·발행 동기화·롤백: Task 5/6.
- 이번 턴은 설계·계획 작성만 수행한다. 앱 구현·API 호출·원격 변경·테스트 성공을 완료한 것으로
  표시하지 않는다.

실행 결과: Tasks 1–5 및 Task 6의 로컬 회귀는 완료했다. 원격 준비·실제 API·운영 전환은 미실행이며
상세 결과는 [검증 기록](../../audits/2026-11-06-gemini-rag.md)에 남겼다.
