# RAG Worker 서비스 경계 리팩토링 검증

Worker 계획 5단계를 구현했다. index는 16줄의 dispatch로 줄이고 HTTP·검색/답변·sync handler,
답변/sync service, Gemini HTTP adapter로 나눴다. retrieval·임베딩 프로필·운영 CLI는 유지했다.

## 검증 기록

| 단계                                             | 결과                                                     |
| ------------------------------------------------ | -------------------------------------------------------- |
| 기준                                             | typegen/typecheck/test/build 통과, 테스트 36 통과        |
| 1 HTTP·인증·local D1                             | typecheck/test 통과, 테스트 39 통과                      |
| 2 답변 service·검색 handler / 3 Gemini transport | typecheck/test 통과, 테스트 47 통과                      |
| 4 sync service·handler                           | typecheck/test 통과, 테스트 50 통과                      |
| 5 profile·경계 검사                              | typegen/typecheck/test/build 통과, 10파일·56 테스트 통과 |

필수 명령은 `pnpm --filter @blog-platform/rag-worker`의 `typegen`, `typecheck`, `test`, `build`다.
build의 `wrangler deploy --dry-run`은 bundle만 검증하며 배포하지 않는다. 추가로
`pnpm exec eslint apps/rag-worker/src`와 해당 소스의 Prettier 검사를 실행했다.

## 보존 확인

- method·별도 search/admin 토큰·loopback·no-store 계약을 HTTP 테스트로 확인했다.
- Vectorize 조회 중 원문이 사라지는 경우와 생성 도중 선택 근거의 삭제/비공개/본문 변경을 확인했다.
- sources가 없으면 생성하지 않으며 provider 실패·quota를 정상 근거 없음으로 바꾸지 않는다.
- Gemini 잘못된 설정·429 body 해제·262144바이트 초과 취소·in-flight 취소, 기존 STOP·링크·조직 검증
  사례를 확인했다.
- dryRun의 추론/쓰기 미호출, 16청크 한도, 기존 vector 제외, 한 embedding 실패 시 페이지 upsert
  미호출, 409 revision 재시작, provider 독립 contentRevision을 확인했다.
- Workers AI/Gemini의 모델·차원·namespace·binding 분리와 Gemini cutoff 필수 조건을 확인했다.
- wrangler 설정·AI/D1/Vectorize 리소스·배포 변수는 바꾸지 않았다. `worker-configuration.d.ts`는 필수
  typegen의 재생성 결과다. local secret 파일이 없는 환경의 생성 차이이며 필수 토큰의 수기 타입은
  기존 `src/env.d.ts`가 계속 선언한다.

## 교차 앱 검증

- Blog 전체 테스트: 76파일·502개 통과. RAG BFF·revalidate·preview·remote content-source 포함.
- core 전체 테스트: 34파일·94개 통과. 콘텐츠·스토리지·검색 계약 포함.
- 운영 sync·발행·remote binding 쓰기·배포를 실행하지 않았다.
- 공개 URL·메타데이터·본문 표현 변경이 없으므로 별도 SEO 감사는 생략했다.

기존 RAG 계약 문서의 삭제된 Kanana/Blog local 생성 설정 설명은 실제 `/answer` 호출부에 맞췄다.
Worker `/search`와 두 임베딩 프로필은 유지했다.

## 독립 리뷰

읽기 전용 독립 리뷰는 Worker의 HTTP·검색 후 primary 조회·생성 후 evidence 재검증·sync
revision/hash/batch·Gemini transport가 기준 동작을 보존한다고 확인했다. Worker의 신규 동작 회귀
지적은 없었다. CMS 측 검증 보완과 preview fallback 복원은 CMS 검증 기록에 남겼다.

local D1의 `first` 입력이 기존처럼 `all()`을 실행하는 동작은 바꾸지 않았다. 호출자가 단건 결과를
기대할 때의 기존 한계가 남으며 별도 계약 변경 없이 이번 구조 변경에 섞지 않는다. 운영 리소스 검증을
제외한 판단과 잔여 위험은 CMS 검증 기록의 실행 판단에도 함께 기록했다.

## 원본 main 반영 검증

2026-11-09 원본 `/Users/choiho/coding/blog`에서 typegen/typecheck/test/build를 재실행하여 모두
통과했고 10파일·56 테스트를 확인했다. build는 배포 없는 dry-run이다. 원본의 typegen 결과는 기존 추적
생성 파일과 같아 별도 생성 파일 변경을 포함하지 않는다. wrangler 설정과 운영 리소스는 유지했다.
