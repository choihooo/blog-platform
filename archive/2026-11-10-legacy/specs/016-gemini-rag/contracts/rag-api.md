# Gemini RAG API 계약

## 공개 API

`POST /api/rag`는 기존 `{ query, context? }` 입력과 `RagResult` JSON 출력을 유지한다. 질문은
1~600자이며 context는 기존 제목·질문 히스토리만 허용한다. 확정된 경력·성과·소개와 명확화 응답은
모델을 호출하지 않는다. 공개 응답은 `Cache-Control: no-store`다.

- Blog BFF는 Worker `/answer`를 호출한다. 근거가 있는데 answer가 없으면 503이다.
- 브라우저 로컬 생성과 Kanana 모드는 제거했다. Worker `/search`는 검색 전용 내부 API로 유지한다.
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

생성에 전달하는 프로젝트 조직 정보는 서버의 공개 프로젝트 레지스트리를 출처 URL에 연결해 제공한다.
지시문 복창 또는 질문한 프로젝트 조직 누락이 감지되면 같은 20초 전체 예산 안에서 한 번만 재요청한다.
반복 실패는 503이며 임의의 대체 답변을 만들지 않는다. 429·취소·불완전 출력은 자동 재시도로 숨기지
않는다. 이는 제한된 의미 검증이며 모든 환각을 판별하는 검사는 아니다.

편집기 rich JSON은 공용 패키지의 읽기 전용 텍스트 projection으로 검색 corpus에 넣는다. 표는 행·셀
관계를 보존하고 잘못된 editor envelope는 JSON 문자열로 fallback하지 않는다. 본문이 바뀐 청크만 새
ID가 되며 재동기화가 필요하다. 같은 URL의 서로 다른 문서는 key로 분리해 근거를 고른다.

성과·수치 질문은 식별된 프로젝트 또는 기존 신뢰도 기준을 넘은 관련 프로젝트 출처를 우선한다.
프로젝트 식별은 정형 응답과 같은 공개 이름·slug·별칭 규칙을 사용하며 `비교`·`검증` 같은 일반
단어만으로 프로젝트를 지정하지 않는다. 사용자 수 질문은 `명` 단위 수치처럼 요청한 지표에 맞는 발췌를
우선한다. 명시적으로 글·회고·후기를 요청하면 이 프로젝트 우선 규칙을 적용하지 않는다. 순위·발췌만
변경하므로 임베딩 프로필과 청크 ID는 바꾸지 않으며 재임베딩은 필요 없다.

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
`GEMINI_GENERATION_MODEL` 및 secret `GEMINI_API_KEY`. Next server는 `RAG_API_URL`과
`RAG_SEARCH_TOKEN`, 동기화용 `RAG_ADMIN_TOKEN`을 사용한다. `RAG_ANSWER_PROVIDER`와
`NEXT_PUBLIC_RAG_CHAT_MODE`에 따른 Blog 로컬 생성 분기는 제거했다. 이 변경은 Worker의 두 임베딩
프로필과 별개이며 Workers AI의 기존 인덱스를 제거하거나 Gemini 인덱스와 혼합하지 않는다.

2026-11-09 구조 변경은 HTTP handler·서비스·Gemini transport의 책임 분리다. Worker의 endpoint,
인증·입출력·상태 코드·revision·profile 계약은 유지한다.

실행·전환·롤백은 [운영 runbook](../../../docs/runbooks/2026-11-06-gemini-rag.md)을 따른다.
