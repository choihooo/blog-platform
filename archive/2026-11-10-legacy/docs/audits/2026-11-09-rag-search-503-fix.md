# 검색 503 원인과 운영 수정 검증

## 확인한 원인

`GGUF MLX` 검색을 실시간 tail과 함께 재요청했다. 기준 버전은 처음 5회 200 이후 6번째 요청에서 503을
반환했다. 진단 버전에서 공급자 상태를 확인한 결과 **Gemini embedContent의 HTTP 400**이었다. 400
응답을 제한된 크기로 읽어 사전 정의된 메시지만 분류한 다음 요청에서도 503이 재현됐고, 내부 로그의
`providerReason: location_unsupported`를 확인했다. 공급자 원문은 다음과 일치했다.

> User location is not supported for the API use.

Worker는 이 오류를 일반 `gemini_unavailable`로 던지고 HTTP 계층이 `retrieval_unavailable` 503으로
바꿨다. 기존 로그는 이 코드와 공급자 상태를 버려 원인 구분이 불가능했다. 같은 질문이 성공/실패하고
실패 지점이 임베딩 HTTP 호출이므로 입력 검증·D1·Vectorize·UI 오류가 아니다.

기본 edge 배치의 일부 실행/외부 통신 위치가 Gemini의 지역 검사에 거부되는 문제다. 한국과 미국은
[Gemini 지원 지역](https://ai.google.dev/gemini-api/docs/available-regions)에 포함된다. 싱가포르나
사용자의 국가 자체가 미지원이라고 단정하지 않으며 특정 egress IP의 지리 판정까지 확인한 것은 아니다.

최초 배포 점검 때 발생했던 개별 요청의 원문은 남아 있지 않다. 과거 로그 REST 조회는 CLI 인증
권한으로 거부됐고 브라우저에서 확인한 과거 로그는 sampling된 일부 요청뿐이었다. 이번 원인 판정은
**동일 질문의 새 503을 두 차례 재현하고 공급자 HTTP 상태·위치 사유를 직접 확인한 결과**다.

## 수정

- `wrangler.jsonc`: `placement.region = aws:us-east-1`. 기본 edge 위치 대신 미국 동부에 가까운
  Cloudflare 데이터센터에서 요청을 실행한다.
- `GeminiHttpError`: 공급자 상태·작업·허용된 위치 오류 사유를 구조화한다. 원문 응답·키·질문은 오류
  객체나 로그에 보관하지 않는다.
- 400 오류도 기존 256 KiB 제한 parser로 읽고, 정확히 일치하는 위치 메시지만 고정 enum으로 분류한다.
- 내부 오류 로그에 안전한 분류를 추가하되 공개 429/503, no-store, quota·취소·타임아웃 계약은
  유지한다.
- 자동 재시도·유료 모델 fallback·임베딩 모델/차원/namespace·인덱스·D1·secret 변경은 없다.

[Cloudflare Placement](https://developers.cloudflare.com/workers/configuration/placement/)가 지정
지역에 가까운 실행 위치를 선택하는 기능임을 확인했다. 고정 egress IP나 영구적인 지리 판정을 보장하는
기능은 아니므로 운영 헤더와 실측을 함께 검증했다. 이 문제를 숨기기 위한 재시도는 넣지 않았다.

## 테스트와 리뷰

- 원본 기준 Worker 테스트 56개 통과.
- 공급자 상태 보존·위치 사유 분류·로그 redaction 테스트는 구현 전 실패를 확인한 뒤 통과시켰다.
- 수정 후 Worker **11파일·59개 테스트 통과**. typegen/typecheck/build, ESLint, Prettier 통과.
- 원본 `/Users/choiho/coding/blog`에 수정본을 반영한 뒤 위 검사를 다시 실행해 모두 통과했다.
- 원본의 Blog 전체 테스트 **76파일·502개 통과**. CMS 코드는 변경하지 않았다.
- 독립 읽기 전용 리뷰: Critical/Important/Minor 지적 없음. 리뷰어가 변경 테스트 7개를 독립 실행해
  통과.

## 배포와 운영 검증

진단 배포 두 번으로 상태와 위치 사유를 확인한 뒤 아래 수정 버전으로 교체했다.

| 항목                 | 결과                                                  |
| -------------------- | ----------------------------------------------------- |
| 최종 Worker 버전     | `97c82824-31b4-4a27-bd5d-ad9fc21482b7`                |
| deployment           | `1c033e05-dc2a-4031-9232-61eb43fe70ac`, 새 버전 100%  |
| version tag          | `fix-search-location`                                 |
| 저장된 배치 설정     | targeted / aws:us-east-1                              |
| 실제 응답 헤더       | `cf-placement: remote-IAD`                            |
| 동일 `GGUF MLX` 검색 | 20회 연속 200·no-store, 실제 글 출처 1개              |
| Worker `/answer`     | 200, 실제 글 출처와 생성 답변                         |
| Blog `/api/rag`      | 200, 실제 글 출처와 생성 답변                         |
| `/sync` dryRun       | 200, 기존 Gemini 프로필·13청크, upsert 없는 읽기 경로 |
| 최종 버전 live tail  | 23개 이벤트 모두 outcome ok, error log 0·exception 0  |

반복 요청은 동시 실행하지 않고 간격을 두어 aggregate 제한을 지켰다. 영구 오류가 다시 나타나면 무한
반복하지 않고 중단하도록 점검 스크립트를 구성했다. 실제 인덱스 동기화·콘텐츠 발행·DB 쓰기는 하지
않았다.

수정은 원본 main에도 반영했다. 운영 artifact와 원본의 두 runtime 모듈 및 Wrangler 설정이 일치함을
확인했다. 후속 사용자 요청으로 이 수정과 검증 기록을 함께 커밋·push 대상으로 준비했다.

## 남는 범위

20회 smoke test가 장기간 무장애를 증명하지는 않는다. Cloudflare의 hint/네트워크나 Gemini 지역 판정이
바뀔 때 새 메타데이터로 `providerStatus=400`, `providerReason=location_unsupported`를 확인할 수
있다. 최초 무기록 503 하나의 과거 공급자 원문은 소급 복구하지 못했다.
