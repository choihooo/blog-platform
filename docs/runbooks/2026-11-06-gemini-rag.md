# Gemini RAG 전환·롤백

- Runbook ID: `gemini-rag-20261106`
- 상태: 구현과 mock 검증 단계. 실제 Gemini 호출·인덱스 생성·sync·secret 등록·배포는 미실행.
- 재실행 가능: 같은 프로필·revision은 이미 upsert한 ID를 건너뛴다. 409는 offset 0부터 재시작.
- 롤백 가능: 기존 인덱스와 Kanana 코드를 보존한다. 기존 인덱스도 최신 공개 콘텐츠로 재동기화해야
  한다.

## 실행 전

1. 사용자에게 원격 인덱스 생성·동기화·배포 요청이 있는지 확인한다. 이 문서의 명령 예시는 실행 기록이
   아니다.
2. Google AI Studio에서 해당 프로젝트가 무료 등급인지, embedding-001과 생성 모델에 접근 가능한지,
   실제 RPM·TPM·RPD를 확인하고 별도 운영 기록에 남긴다. 유료 전환은 자동으로 하지 않는다.
3. 동일 Google 프로젝트의 다른 앱 사용량도 포함해 여유를 둔다. 무료 데이터 처리 조건을 확인한다.
4. Worker secret `GEMINI_API_KEY`와 기존 검색·관리 토큰을 후보 환경에 등록한다. 값은 채팅·로그·Git에
   남기지 않는다.
5. 마지막 검증 배포 ID·commit·corpus revision·quota와 인덱스 이름을 기록한다.

## 후보 인덱스와 Worker

새 인덱스는 cosine 768차원 `hozorica-rag-gemini-001-768-v1`, namespace `public-gemini-v1`이다.
Worker의 INDEX는 기존 `hozorica-portfolio-rag`, INDEX_GEMINI는 새 인덱스에 연결한다. 인덱스는 코드
변경으로 생성되지 않는다. 생성 명령은 별도 원격 실행 승인 후에만 사용한다.

```sh
pnpm --filter @blog-platform/rag-worker exec wrangler vectorize create hozorica-rag-gemini-001-768-v1 --dimensions 768 --metric cosine
```

후보 Worker 환경에 다음을 설정한다. cutoff와 간격 값은 계정·평가에 맞춰 정하며 아래 문구를 그대로
환경변수 값으로 쓰지 않는다.

| 변수                    | 값                                                                   |
| ----------------------- | -------------------------------------------------------------------- |
| RAG_EMBEDDING_PROVIDER  | gemini                                                               |
| GEMINI_MIN_SCORE        | calibration에서 선택할 -1~1 숫자. 초기 탐색은 보수적 후보값으로 시작 |
| GEMINI_EMBED_DELAY_MS   | 0~60000 정수 밀리초, 실제 quota에 맞춘 요청 간격                     |
| GEMINI_GENERATION_MODEL | gemini-3.8-flash                                                     |
| GEMINI_API_KEY          | Worker secret                                                        |

로컬 Worker도 wrangler.jsonc의 remote binding을 사용하면 원격 D1을 읽고 AI·Vectorize 사용량이
발생한다. mock 검증과 혼동하지 않는다. 후보 Worker 배포에는 고유 name/config로 운영을 덮어쓰지
않는다.

## 동기화

아래 명령의 작업 디렉터리는 저장소 루트다. 토큰은 Worker `.dev.vars` 또는 환경변수에서 읽는다.
RAG_API_URL 환경변수는 sync CLI에 적용되지 않는다. 대상은 `--endpoint`로 명시한다.

```sh
# 기본은 dry-run. 원격 D1 읽기는 발생할 수 있다.
pnpm --filter @blog-platform/rag-worker sync --endpoint http://127.0.0.1:8787
# 실제 quota에 맞는 N으로 바꾼 후에만 실행한다.
pnpm --filter @blog-platform/rag-worker sync --execute --requests-per-minute N --endpoint http://127.0.0.1:8787
```

원격 endpoint에 쓰려면 `--allow-remote`도 명시한다. 로컬 endpoint도 remote binding이 있다면 실제로는
원격 쓰기이므로 사용자 실행 요청이 필요하다. CLI는 이 승인 여부를 판단하지 않는다.

- dry-run의 total·revision·requests를 기록한다. requests는 전체 청크 수 기준 상한이며 토큰 예산은
  별도다.
- 동시성 1, 청크마다 표준 embedContent 호출. Worker 내부 간격과 CLI 페이지 간 대기를 함께 적용한다.
- sync는 페이지당 16개이며 timeout은 CLI에서 300초다. 매우 낮은 quota에서는 한 페이지가 이 시간을
  넘을 수 있다. 해당 경우 실행하지 말고 batch 정책과 호스트 한도를 별도로 설계한다.
- 429는 현재 페이지의 offset/revision을 기록하고 종료한다. quota가 회복되면
  `--offset <offset> --revision <revision>`으로 재시작한다. 무한 재시도하지 않는다.
- 업로드 성공과 Vectorize의 비동기 반영 완료는 다르다. vector 수와 대표 검색 ID 반영을 확인한다.
- CMS public-refresh는 `/sync`를 계속 호출한다. 현행 Next의 30초 sync timeout보다 느린 quota에서는
  페이지 갱신과 검색 동기화가 분리된 실패로 보고된다. 허용 지연 내 실측이 되기 전 자동 발행 전환을
  승인하지 않는다. 낮은 quota에 적합한 비동기 갱신은 별도 설계가 필요하다.

## 검색·생성 평가

고정 평가 파일은 `docs/fixtures/rag-gemini-evaluation.json`이다. calibration 10개는 cutoff 선택에만
사용하고 positive 20개·negative 10개는 holdout으로 남긴다. 실제 현재 corpus에 각 출처가 존재하는지
먼저 확인한다. 양쪽 후보의 corpus revision이 같아야 비교할 수 있다.

```sh
node apps/blog/scripts/evaluate-rag.mjs --endpoint http://127.0.0.1:8787/search --cases docs/fixtures/rag-gemini-evaluation.json --output /tmp/gemini-search.json --corpus-revision ACTUAL_REVISION --requests-per-minute N
node apps/blog/scripts/evaluate-rag.mjs --endpoint http://localhost:3000/api/rag --cases docs/fixtures/rag-gemini-evaluation.json --output /tmp/gemini-answer.json --corpus-revision ACTUAL_REVISION --requests-per-minute N
```

직접 Worker 호출에는 환경변수 RAG_SEARCH_TOKEN이 필요하다. N은 1~30 사이이며 Google quota가 더
작으면 그 한도를 따른다. Gemini quota 제한에 도달하면 평가를 중단한다. 결과에는 공개 평가 질문의
답변이 포함되므로 사용자 대화·비공개 자료를 fixtures로 넣지 않는다.

- 검색: positive Recall@3 ≥90%이며 legacy 이상, negative 오탐 0, 비공개/stale 노출 0.
- 생성: 출처 일치·회사별 업무 귀속·수치 단위·허위 전제 거절·자료 내 지시문 무시를 사람이 확인한다.
- 스크립트의 문자열 검사는 생성 품질 전체를 보장하지 않는다. humanReviewPending이 남으면 생성 품질
  합격으로 보고하지 않는다. 일부만 실행된 보고서는 전환 근거로 쓰지 않는다.
- 직접 `/search` 평가는 후속 질문을 생략한다. `/api/rag`는 후속 질문 5개·주입 질문 3개도 확인한다.
- Worker `/search`는 생성 모델을 호출하지 않으므로 임베딩 전환과 생성 전환을 독립 평가할 수 있다.

## 단계별 운영 전환

1. 기존 Next는 local 생성/UI로 두고, 검증한 Gemini embedding Worker URL로 전환한다.
2. CMS 발행·수정 후 검색 갱신, 비공개 전환 후 검색 제외를 확인한다. 최신 콘텐츠로 양쪽을 비교한다.
3. 후보 Next에 `RAG_ANSWER_PROVIDER=gemini`, `NEXT_PUBLIC_RAG_CHAT_MODE=remote`를 함께 설정하고 다시
   빌드한다. public 변수는 빌드 시점 값이다. Gemini 키를 Next나 브라우저에 넣지 않는다.
4. 데스크톱·모바일에서 질문·출처·후속 질문·중지·닫기·429를 확인한다. gguf·shard·wllama 요청은
   0이어야 한다.
5. 후보 소스의 홈·목록·글 상세 SEO 출력과 본문을 검증한 다음 사용자 요청 범위에서 운영 승격한다.

## 롤백

- 생성만 롤백: Next `RAG_ANSWER_PROVIDER=local`, `NEXT_PUBLIC_RAG_CHAT_MODE=local`을 함께
  빌드·배포한다. Gemini embedding Worker는 유지할 수 있다. 기존 브라우저 다운로드·데스크톱 제약이
  다시 적용된다.
- 임베딩 롤백: legacy 프로필 Worker 후보에서 현재 corpus 전체를 기존 INDEX에 동기화하고 검색 반영을
  확인한 뒤 RAG_API_URL을 되돌린다. 이전 모델의 cutoff 0.48과 namespace public-v1을 사용한다.
- 동기화·반영 중에는 확정 답변만 사용하거나 검색을 중단한다. 옛 벡터가 있다고 최신 콘텐츠가 검색되는
  것은 아니다. stale 검증은 노출을 막지만 검색 누락까지 해결하지 않는다.
- 새 인덱스·기존 모델 코드는 롤백 기간에 삭제하지 않는다. 생성 공급자 실패를 로컬 생성으로 자동
  우회하지 않는다. 설정과 배포 버전을 기록한 뒤 명시적으로 전환한다.
