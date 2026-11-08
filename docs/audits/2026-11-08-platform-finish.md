# 플랫폼 단순화 후속 통합·운영 검증

## 통합과 사용자 변경 보존

- 리팩터링만 `f4d0754` (`refactor: consolidate platform core and remove legacy storage bridges`)로
  커밋했다. 기존 사용자 작업인 편집기·About·콘텐츠 복구 등의 변경은 포함하지 않았다.
- `/Users/choiho/coding/blog`의 `codex/blog-rounded-preview`에 리팩터링을 통합했다. 겹치는 미커밋
  작업은 백업과 416개 경로 비교 후 보존했고, 이동된 경로에서도 사용자 변경은 미커밋으로 남겼다.
- 루트에는 비전·주요 구성·상세 지침 위치만 남기고, 앱 세부 규칙과 개발 절차는 하위 지침으로 옮겼다.
  공유 코드는 core로 통합하고 앱 사이 직접 import와 legacy 저장소 연결을 제거했다.
- 기존 두 문서의 포맷 오류를 수정했고 전체 `pnpm format:check`를 통과했다.
- 원격 push·PR·운영 배포는 실행하지 않았다.

## 검증 근거

실행 로그는 ignored `_workspace/platform-simplification/finish/`에 저장했다.

| 대상                               | 실행과 결과                                                                                       | 로그                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 사용자 변경을 제외한 리팩터링 커밋 | 독립 추출본 test 611개 통과, typecheck·lint·format·build 통과                                     | `candidate-*-fresh.log`, `candidate-{typecheck,lint,format,build}.log` |
| 사용자 변경까지 포함한 원래 작업본 | frozen install, 전체 format·lint·typecheck·test·build 통과, test 646개 통과·1개 건너뜀            | `integrated-*.log`                                                     |
| 실제 콘텐츠를 읽는 공개 빌드       | `BLOG_CONTENT_PROXY_URL=https://cms.hozorica.com pnpm --dir /Users/choiho/coding/blog build` 통과 | `integrated-build.log`                                                 |
| 후속 비공개 노출 수정              | CMS test 117개 통과·1개 건너뜀, lint·typecheck·format·build 확인                                  | `final-cms-*.log`, `final-format.log`                                  |

최초 단순화의 HTTP 30개·HTML/SEO 13개 페이지와 브라우저 검증은
[최초 감사](2026-11-08-platform-simplification.md)에 있다. 후속 수정은 `seo-technical` 스킬의 공개
접근·색인 경계를 적용해 실제 Request/Response 기반 로컬 route 회귀 테스트로 확인했다. 발행 글의
URL·응답 payload는 유지하고 비공개 글은 본문 없이 404를 반환한다. 새 소스의 실제 운영 배포와 배포 후
HTTP 검증은 하지 않았다. CWV 실측·외부 검색엔진 색인은 검증 범위가 아니다.

## 실제 운영 동작

기존에 배포된 운영 CMS의 로그인된 관리자 세션과 정상 Cloudflare CLI OAuth를 사용했다. 미배포
리팩터링 소스의 운영 E2E 성공을 의미하지 않는다.

- CMS `/posts`와 새 글 편집 화면에서 인증된 운영자 상태를 확인했다.
- 일회성 글을 Save·Publish하고 커버 이미지를 R2에 업로드했다. 공개 페이지 200, 제목·본문 일치와 실제
  WebP 이미지 응답 200을 확인했다. 발행 전 해당 URL은 404였다.
- RAG health와 인증된 검색은 200이었다. `Nexacro React 전환 자동화` 검색에서
  `/projects/nexacro-react-poc`를 반환했다.
- 원격 D1 조회와 임시 글 삭제, R2 단일 객체 삭제, 해당 글의 검색 벡터 삭제를 실제로 확인했다. 최종
  글·공개 API·이미지 URL은 404이고 기존 `/blog/nest-di-ioc`는 200이었다.
- 검증 글 id·정확한 key·삭제 조건과 결과는
  [운영 검증 runbook](../runbooks/2026-11-08-platform-verification.md)에 있다. 임시 리소스는 남기지
  않았다.

## 발견한 오류와 남은 배포 경계

Unpublish는 D1을 비공개로 바꿨지만 공개 CMS API의 slug 조회가 발행 상태를 검사하지 않아 계속 본문을
반환했다. 실제 운영에서 재현하고 현재 소스에서도 확인한 기존 오류다. 실패하는 테스트 (`404` 기대,
실제 `200`)를 먼저 확인한 뒤 `isPublished` 검사를 추가했고 발행 글의 정상 응답도 함께 검증했다. 공개
목록의 published-only 동작과 URL은 유지한다.

수정 커밋은 `18597f8`이며, 별도 맥락으로 진행한 독립 코드 리뷰에서 조치할 지적은 없었다.

운영의 임시 글은 정확한 id·slug·제목·비공개 조건으로 삭제해 노출을 제거했다. 오류 수정은 로컬 소스에
있으며 배포 전까지 운영 전체에 적용된 것으로 볼 수 없다. 배포가 요청되면 배포 후 비공개 글 404와
기존 발행 글 200을 다시 확인해야 한다.

로컬에서 새 core의 원격 D1/R2 REST 인증은 Vercel의 민감 변수 다운로드 제한 때문에 검증하지 못했다.
이를 통과로 처리하지 않았으며, 실제 운영 연결 확인은 기존 CMS와 CLI OAuth로 수행했다. 임시로 받은
환경 파일은 검사 후 삭제하며 비밀값과 `.env` 파일은 커밋하지 않는다.
