# CMS 기능 경계 리팩토링 검증

CMS 계획 8단계를 구현했다. 편집기는 components/hooks/model/server, 글 목록·카테고리·통계·공개
콘텐츠는 각각 feature로 분리했다. page는 typed command capability를 조립하고 Server Actions는
인증·redaction·Next cache 경계를 유지한다. 공통 필드와 사이트 설정은 shared로 옮겼다.

## 검증 기록

| 단계                       | 결과                                                                           |
| -------------------------- | ------------------------------------------------------------------------------ |
| 기준                       | format/lint/typecheck/build 통과, 테스트 117 통과·1 skipped                    |
| 1 slug·검사 범위           | lint/typecheck 통과, 테스트 118 통과·1 skipped                                 |
| 2 posts·공통 설정          | typecheck 통과, 테스트 118 통과·1 skipped                                      |
| 3 action·서버 경계         | lint/typecheck/build 통과, 테스트 118 통과·1 skipped                           |
| 4 세션·작업 hook           | lint/typecheck 통과, 테스트 119 통과·1 expected failure·1 skipped              |
| 5 Tiptap·미디어 hook       | format/lint/typecheck/build 통과, 같은 테스트 결과                             |
| 6 taxonomy                 | lint/typecheck 통과, 테스트 123 통과·1 expected failure·1 skipped              |
| 7 analytics                | lint/typecheck 통과, 같은 테스트 결과                                          |
| 8 public-content·경계 검사 | format/lint/typecheck/build 통과, 64파일·127 통과·1 expected failure·1 skipped |

명령은 `pnpm --filter @blog-platform/cms`의 `format:check`, `lint`, `typecheck`, `test`, `build`다.
새 slug·session·taxonomy model·public-content query의 새 진입점은 구현 전 실패와 구현 후 통과를
확인했다. 기존 save/publish/preview/media/auth/round-trip 테스트는 이동 후 다시 실행했다.

## 보존과 알려진 문제

- 발행 저장 후 공개 갱신 실패의 문서·sha·retryToken과 갱신만 재시도하는 경로를 유지했다.
- preview HMAC, 30분 만료, 미디어 검증, 공개 API의 필터·pagination·cache·404/502를 유지했다.
- analytics provider는 Google 인증/HTTP/순수 정규화/mock으로 나눴으며 기존 live API fixture를
  사용했다.
- 구조 변경 전에 재현한 기존 문제: 저장 중 새 제목을 입력하면 이전 저장 응답이 제목을 덮는다. 계획의
  동작 보존 범위에 따라 수정하지 않았다. `editor-save-flow.test.tsx`의 `it.fails`로 알려진 실패를
  기록했으며 정상 통과 사례와 구분한다.
- 기존 skipped 테스트 1개는 복구 manifest가 있을 때 전체 복구 글을 왕복 변환하는 조건부 검사다.
  manifest가 없는 현재 환경에서 기준과 동일하게 건너뛰었다. 일반 중첩 문서 왕복 변환 검사는
  통과했다. Node의 localstorage 실행 옵션 경고도 기준부터 존재했다.

운영 콘텐츠·발행·원격 업로드·배포는 실행하지 않았다. 공개 URL·메타데이터·본문 표현은 변경하지
않았으므로 별도 SEO 감사는 생략했다. Blog 전체 502개·core 전체 94개 테스트도 통과했다.

## 독립 리뷰와 최종 보완

읽기 전용 독립 리뷰에서 Critical은 없었고 검증 누락 2건과 preview fallback 차이 1건을 확인했다. 검증
누락은 실제 Tiptap 선택 변경 후 두 번째 이미지에만 속성 적용, 실패한 paste/cover upload의 기존
본문·커버 보존, UI retry token·publish/save 호출 수, 실제 retry action의 content adapter 미호출
assertion으로 보완했다.

preview fallback은 현재 D1이 보통 saved.slug를 주더라도 optional 결과 계약을 보존해야 하므로 중요한
동작 보존 문제로 판단했다. 기존 path 우선/ID 정규화 두 사례의 실패를 먼저 확인한 뒤 별도 서버
`previewSlugCandidate`로 복원하여 통과시켰다. 클라이언트 제목 후보와 억지로 통합하지 않는다.

최종 보완 후 CMS format/lint/typecheck/test/build를 다시 실행했다. **67파일·133 통과·1 expected
failure·1 skipped**다. 보완 대상 5파일·9테스트도 별도 통과했다. 독립 리뷰 이후의 보완은 새 리뷰를
반복하지 않고 테스트와 전체 빌드로 검증했다. 남겨 둔 신규 리뷰 지적은 없다.

## 실행 중 판단과 제외 범위

- 실행 스킬이 참조하는 workspace 도구가 설치되어 있지 않아 기존 ignored scratch에 단계 기록과 로그를
  남겼다. 잘못 판단했다면 커밋 범위만으로 단계별 이력을 복원하기 어렵다.
- 기존 detached 작업공간과 선행 Blog 변경을 보존하고 커밋·merge·push를 하지 않았다. 통합은 별도
  작업으로 남는다. Blog 선행 변경 자체는 이번 독립 리뷰에서 제외했으며 전체 테스트는 재실행했다.
- DTO는 action 구현의 type import 대신 model로 옮겼다. 타입 계약 유지 비용은 생기지만 feature에서
  app으로의 역방향 의존성과 client/server 혼합 barrel을 제거한다.
- 기존 저장 경쟁 상태는 계획대로 유지했다. 잘못된 응답 순서에서 새 입력을 잃을 위험이 남는다.
- 이미지 hook은 editor를 lazy getter로 참조하고 자체 transition의 pending을 화면에서 합친다. 초기화
  순서/상태 조합 오류의 위험은 실제 Tiptap·업로드·전체 편집기 검사로 확인했다.
- 기존 taxonomy의 공개 글 100건 기반 참조 집계는 바꾸지 않았다. 큰 데이터에서 표시되는 참조 수의
  기존 한계는 남으며 pagination 개선은 별도 작업이다.
- 기존 editor command의 rejection/pending 정책은 유지했다. 예기치 않은 Promise rejection 처리의 기존
  한계는 남으며 이번 추출에서 신규 회귀는 확인되지 않았다.
- 실제 Google/Gemini·운영 D1/Vectorize·발행·배포는 검증 범위에 넣지 않았다. mock·타입·bundle의
  통과가 운영 자격 증명과 원격 상태의 정상 동작을 증명하지는 않는다.

## 원본 main 반영 검증

2026-11-09 원본 `/Users/choiho/coding/blog`의 깨끗한 main(`55e49de`)에 CMS·Worker 범위만 반영했다.
변경 전 파일 일치와 새 경로 충돌 부재를 확인했다. 원본에서 CMS format/lint/typecheck/test/build를
다시 실행하여 모두 통과했고, 67파일·133 통과·1 expected failure·1 skipped를 확인했다. Blog
502개·core 94개 회귀 테스트도 원본에서 통과했다. 공개 표현 변경이 없어 SEO 감사는 생략했다.
