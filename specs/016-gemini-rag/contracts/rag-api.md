# Gemini RAG API 계약

## 공개 API

`POST /api/rag`는 기존 `{ query, context? }` 입력과 `RagResult` JSON 출력을 유지한다. 질문은
1~600자이며 context는 기존 제목·질문 히스토리만 허용한다. 확정된 경력·성과·소개와 명확화 응답은
모델을 호출하지 않는다. 공개 응답은 `Cache-Control: no-store`다.

- `RAG_ANSWER_PROVIDER=local` (기본): Worker `/search`를 호출하고 브라우저 Kanana가 생성한다.
- `RAG_ANSWER_PROVIDER=gemini`: Worker `/answer`를 호출한다. 근거가 있는데 answer가 없으면 503.
- 응답: `sources` 최대 3개, 제목 200자·발췌 550자, 내부 공개 URL만 허용. answer 최대 4000자.
- 400: 잘못된 입력, 403: 다른 origin, 429: Worker 또는 Gemini 할당량 제한, 503: 검색·생성 실패.
- 근거 없음은 정상 200 안내다. 공급자 실패를 근거 없음으로 바꾸지 않는다.

## Worker

`/health` GET을 제외한 `/search`, `/answer`, `/sync`는 POST JSON만 받는다.

| 경로      | 인증             | 입력                                     | 출력                   |
| --------- | ---------------- | ---------------------------------------- | ---------------------- |
| `/search` | RAG_SEARCH_TOKEN | `{ query }`                              | `{ sources }`          |
| `/answer` | RAG_SEARCH_TOKEN | `{ query }`                              | `{ sources, answer? }` |
| `/sync`   | RAG_ADMIN_TOKEN  | `{ slug?, offset?, revision?, dryRun? }` | 아래 참고              |

`/answer`는 자료가 있을 때만 생성한다. 클라이언트가 보낸 sources·본문은 무시하고 최신 공개 D1 자료로
근거를 만든다. `/search`와 `/answer`는 같은 aggregate 30회/60초 제한을 공유한다. 출처 URL은 모델
출력으로부터 생성하지 않는다. 생성 본문의 Markdown 링크도 검색된 출처 URL만 활성 링크로 남긴다. 생성
후 선택 문서의 청크 ID를 primary D1에서 재확인하며 변경·삭제·비공개 전환이 있으면 답변 전체를
503으로 폐기한다. JSON 단발 응답이며 SSE는 지원하지 않는다.

`/sync`는 페이지당 최대 16청크다. 응답은 `indexed`, `total`, `revision`, `nextOffset`이고 중간에
corpus가 바뀌면 409다. `dryRun: true`는 AI·Vectorize 쓰기 없이
`{ total, revision, contentRevision, profile, requests, nextOffset: null }`를 반환한다. requests는
전체 청크 수에 근거한 상한이며 기존 벡터·TPM/RPD·과금액을 측정한 값이 아니다. 임베딩 페이지 도중
실패하면 해당 페이지를 upsert하지 않는다. 재실행은 같은 offset/revision이며 409일 때만 offset 0부터
다시 시작한다.

contentRevision은 provider와 무관한 콘텐츠 지문으로 인덱스 비교에 사용한다. revision은 provider별
청크 ID 기반의 sync 재시작용이므로 provider 사이에서 같지 않다.

## 임베딩 프로필

| provider          | 모델                 | 차원 | namespace        | binding      |
| ----------------- | -------------------- | ---- | ---------------- | ------------ |
| workers-ai (기본) | @cf/baai/bge-m3      | 1024 | public-v1        | INDEX        |
| gemini            | gemini-embedding-001 | 768  | public-gemini-v1 | INDEX_GEMINI |

Gemini 문서/질문은 각각 RETRIEVAL_DOCUMENT/RETRIEVAL_QUERY를 사용하고 L2 정규화한다. Gemini 검색
cutoff `GEMINI_MIN_SCORE`는 평가 후 명시하며, 미설정 시 임의 기본값을 쓰지 않는다. 문서 입력
포맷·모델·차원·정규화 프로필이 다르면 ID를 분리한다. legacy ID는 유지한다. Vectorize 조회 후 D1
primary 공개 원문을 재조회하여 stale·삭제·미발행 청크를 배제한다.

## 설정과 전환

Worker: `RAG_EMBEDDING_PROVIDER`, `GEMINI_MIN_SCORE`, `GEMINI_EMBED_DELAY_MS`,
`GEMINI_GENERATION_MODEL` 및 secret `GEMINI_API_KEY`. Next server: 기존 RAG URL·토큰과
`RAG_ANSWER_PROVIDER`. Next build: `NEXT_PUBLIC_RAG_CHAT_MODE=local|remote` (기본 local). remote
UI는 answer가 없는 응답을 실패로 표시하고 로컬 모델을 자동 다운로드하지 않는다. remote UI와 local
server 조합은 지원하지 않으므로 생성 전환 시 두 설정을 함께 배포한다. local UI와 Gemini server
조합은 기존 answer 단락을 통해 동작하지만 기존 모델 로딩은 남는다.

실행·전환·롤백은 [운영 runbook](../../../docs/runbooks/2026-11-06-gemini-rag.md)을 따른다.
