# RAG 근거 추출 및 생성 품질 수정

2026-11-09 후속 검증: 무료 한도 회복 후 고정 12문항 전체가 통과해 아래의 미검증 9문항을 해소했다.
raw 검색 30문항은 85%·오탐 0으로 기준 미달이 남았다.
[재평가 보고서](2026-11-09-rag-revalidation.md)에 현재 결과를 기록하고 아래 당시 실행 기록은 그대로
보존한다.

- Runbook ID: `gemini-rag-20261106-quality-fix-20261107`
- 사용자 승인: 이전에 승인한 후보 인덱스 재임베딩과 후속 품질 수정·재평가. 운영 배포·전환은 제외.
- 기존 품질 결과는 `2026-11-07-gemini-quality.md`와 JSON에 원본대로 보존한다.
- 이번 원본 결과: [JSON 기록](2026-11-07-rag-answer-fix-results.json).

## 수정

- editor의 새 `textFromPostContent`는 읽기 전용이다. 표를 포함한 rich 문서를 JSON 문자열로
  fallback하지 않고 행·셀·본문으로 추출한다. 편집·저장·본문 렌더링 API의 지원 서식은 바꾸지 않는다.
- 검색은 메타데이터가 맞는 문서 안에서 질문과 관련된 청크와 발췌 구간을 선택한다. 같은 `/resume`
  URL을 가진 서로 다른 경력 문서는 key로 구분해 제목·소개·본문이 섞이지 않게 한다.
- 생성은 서버의 공개 프로젝트 레지스트리에서 출처별 조직을 제공한다. 질문에 명시된 프로젝트가 첫
  번째 출처가 아니어도 조직을 검증한다. 관찰된 지시문 복창과 조직 누락은 한 번만 재요청하고,
  재실패는 503이다. 전체 20초 예산, 취소, 공급자 429를 유지하며 임의 대체 답변을 만들지 않는다.

## 회귀와 코드 리뷰

새 실패 테스트에서 editor JSON 누출, 잘못된 소개 선택, 지시문 복창, 명시적 조직 누락을 확인한 뒤
수정했다. 독립 리뷰가 찾은 잘못된 envelope shape, 공유 URL 문서 혼합, 출처 순서에 의존하는 조직
검증도 각각 RED→GREEN 및 전체 테스트로 확인했다.

- 전체 테스트: 680개 통과 (Blog 451, Worker 36, editor 23, CMS 141, analytics 14, SEO 15).
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` 통과. 전체 build는 6개 작업이 성공했고
  Worker는 deploy dry-run이다. Blog·editor format 검사 및 Worker typegen도 실행했다.
- 실제 Gemini 실패 회귀 3건: GGUF/MLX 질문 정상 비교 응답, 정규표현식·TypeScript 성능 글의 출처에
  편집기 envelope 없음.
- 실제 합성 문서 주입 3건: 악성 마커·링크 출력 0, 회사 `야근몬스터` 및 5종 검증(5/5) 결과를
  3/3건에서 확인했다. 이는 관찰 표본이며 일반적인 환각/주입 방지를 보장하지 않는다.

## 후보 인덱스 증분 동기화

본문 정규화 후 현재 corpus는 790개에서 580개 청크로 바뀌었다. 기존 인덱스에서 현재 ID 476개가
존재했고, 9개 글의 104개가 새 임베딩을 필요로 했다. 전체 재임베딩 대신 이 변경분만 처리했다.

- revision: `5ec17c3abf5bbc92675432a08ff602f9b830f0ee870bd905e45c2fdfabceea41`
- contentRevision: `848fbfbf432aaf6af9184b6aef17cad8ce765764fe567192b9684d8b6ba21f2f`
- 대상: `hozorica-rag-gemini-001-768-v1`, `public-gemini-v1`, cosine 768차원.
- CLI dry-run과 기존 ID 조회로 변경량을 확인한 뒤 동시성 1로 동기화했다. 실제 호출 수를 기준으로
  분당 60건 이하의 페이지 간격과 Worker 문서 간 1,000ms 간격을 사용했다.
- offset 288에서 503으로 중단됐다. 콘텐츠 버전을 유지한 상태에서 같은 offset/revision으로 한 번
  재개했고, 업로드 합계 104개·마지막 nextOffset null·종료 코드 0을 확인했다.
- 현재 ID를 20개씩 읽어 580개 전부 존재하고 누락 0임을 확인했다. 옛 ID는 삭제하지 않으며 최신 D1
  기반 stale 검증이 검색에서 제외한다. 전체 물리 벡터 수와 현재 corpus 청크 수는 다를 수 있다.

재실행은 기본 sync CLI의 같은 offset/revision으로 가능하다. 원본 D1/R2에는 쓰지 않았다. 롤백은 이
후보를 운영에 연결하지 않는 것으로 유지된다. 옛 코드로 후보를 다시 사용하려면 옛 ID가 검색될 수
있으므로 코드와 corpus 버전을 맞춰야 한다. 운영의 기존 BGE 인덱스는 수정하지 않았다.

## 새 질문 검증

`docs/fixtures/rag-answer-quality-holdout-v2.json`의 신규 12문항(긍정 8·부정 4)을 결과 관찰 전에
고정했다. 예전 실패 질문과 문서 주입 3건은 회귀 세트로 구분한다. cutoff 0.7과 생성 모델
gemini-3.5-flash-lite를 유지하며, 새 결과를 보고 임계값이나 정답을 바꾸지 않는다.

새 질문 평가: **부분 실행, 완료 아님.** 첫 3개 질문(AWS 구조, Next 로그인, throttle/debounce)은 HTTP
200이고 expected URL이 상위 3개에 포함됐다. 에이전트가 답변·발췌를 대조해 지시문 복창이나 편집기
envelope가 없음을 확인했다. 4번째 질문에서 Worker search 단계가 429를 반환해 즉시 중단했다. 나머지
9개(429 질문 포함)는 미검증이며, 부정 질문 4개도 실행하지 못했다.

원본 자동 보고서는 complete=false다. 429를 실패로 포함한 부분 recall 0.75를 전체 품질 지표로
해석하지 않는다. 임베딩 공급자 할당량 회복 후 동일한 고정 12개를 다시 실행해야 한다. 그 전에
fixture나 cutoff를 결과에 맞춰 바꾸지 않는다. 원래 30개 raw 검색 전체 재평가도 아직 실행하지
못했으므로 전체 90% 기준 달성이나 배포 준비 완료를 주장하지 않는다.

평가 후 dry-run도 같은 580개와 contentRevision을 반환했다. 실제 실행 결과·부분 보고서는 별도 JSON
기록에 보존한다.

실패 원인을 확인하기 위한 단일 진단 요청도 HTTP 429였고, 공급자가 다음 quota violation을 반환했다.
임의 재시도·다른 키를 통한 우회·유료 전환은 하지 않았다.

- quotaMetric: `generativelanguage.googleapis.com/embed_content_free_tier_requests`
- quotaId: `EmbedContentRequestsPerDayPerProjectPerModel-FreeTier`
- model dimension: `gemini-embedding-1.0`
- 당시 retryDelay: `39458s` (공급자 안내값이며 완료 시각 약속이 아니다).

AI Studio의 시간 필터가 있는 dashboard 집계는 최대 15분 늦을 수 있어, 해당 화면의 부분 집계를 잔여
일일 사용량으로 간주하지 않았다. 일일 한도 소진 판정은 위 API quota ID에 근거한다.

## 범위와 제한

- 지시문 복창 검사는 관찰된 패턴과 조직 필드에 대한 제한된 검증이다. 모든 의미 오류의 탐지기가
  아니며, 사람의 최종 검수와 운영 전환 승인을 대신하지 않는다.
- 원래 raw 검색 85%·오탐 0은 이전 버전/질문 세트의 결과다. 이번 회귀·새 질문 결과와 혼합해 새로운
  전체 성능으로 보고하지 않는다.
- SEO: 공개 URL·메타데이터·본문 렌더링을 수정하지 않아 생략한다. RAG의 읽기 전용 projection과 응답만
  수정했다. 배포·CMS 발행 상태 전이·운영 롤백 연습은 하지 않았다.
