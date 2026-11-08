# 플랫폼 구조 단순화 검증 기록

## 결과와 작업 보존

- 계획: `docs/superpowers/plans/2026-11-08-platform-simplification.md`, Task 0–6 순차 실행.
- 기준 HEAD: `850c07b77e85e25dfa1e62e59c88ff350dc79b9f`와 사용자 미커밋 작업 전체.
- 원본: `/Users/choiho/coding/blog`; 구현:
  `/Users/choiho/.codex/worktrees/platform-simplification/blog`.
- 변경·미추적 파일 88개를 비밀 설정 없이 복사했다. 완료 전 원본 Git status와 88개 SHA-256이 모두
  동일함을 확인했다. 사용자 작업을 reset/stash/임의 커밋하지 않았다.
- 최종 구성은 Blog·CMS·Worker·core의 workspace 4개다. 앱 사이의 source import와 core → 앱 import를
  제거했다. 이전 editor/seo-engine/analytics 패키지와 미사용 repository CRUD 호환 계층을 제거했다.
- 전체 로그·원본 hash·단계 brief·ledger·로컬 fixture는 ignored
  `_workspace/platform-simplification/`에 보관한다. 아직 커밋·merge·push·배포하지 않았다.

## 0단계 기준선

| 명령                                      | 결과                                          |           소요 |
| ----------------------------------------- | --------------------------------------------- | -------------: |
| `pnpm install --frozen-lockfile`          | 통과                                          | 별도 측정 없음 |
| `pnpm format:check`                       | 기존 문서 2개에서 실패                        |         6.55초 |
| `pnpm lint`                               | 통과                                          |         4.99초 |
| `pnpm typecheck`                          | 통과                                          |         4.29초 |
| `pnpm test`                               | 660개 통과, 1개 스킵                          |        20.73초 |
| `pnpm build`                              | D1 설정이 없는 조건에서 `content_unavailable` |        12.96초 |
| 로컬 remote fixture를 연결한 `pnpm build` | 전체 통과                                     |        10.83초 |

기존 포맷 실패는 `apps/blog/features/blog-rounded/README.md`,
`docs/audits/2026-11-05-seo-first-run.md`다. 관련 없는 수정은 하지 않았으며 최종 root format에서도
동일한 2개만 경고한다. 앱/core 각각의 format 검사는 통과했다.

기본 build 실패를 숨기는 fallback은 추가하지 않았다. 실제 비밀 설정을 옮기지 않았으므로 원격 D1을
사용하지 않았다. 별도의 로컬 콘텐츠 fixture와 로컬 전용 D1 Worker로 두 경로를 검증했다.

## 단계별 검증

| Task | 변경과 검증                                                                                                                                        |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | 기존 URL 설정 실행 결과와 corpus를 snapshot으로 고정. preview token·remote 404/502 구분 등 신규 보존 검사 5개 통과.                                |
| 1    | core 순수 subpath 생성 후 63개 테스트 통과. root lint·typecheck·전체 suite·fixture build 확인.                                                     |
| 2    | D1·공통 타입·설정 로더 이동. Blog → CMS 경계 검사 RED→GREEN. core 67개·Blog 453개·CMS 145개 통과, CMS 1개 스킵.                                    |
| 3    | catalog·corpus·검색 계약 이동. Worker → Blog 경계 검사 RED→GREEN. core 69개와 전체 suite 통과. 검색 문서·임베딩 입력·chunk id snapshot 변경 없음.  |
| 4    | R2/로컬 media store 4개 검사 RED→GREEN. 실제 인증 guard를 거쳐 미인증 업로드 쓰기 0회 확인. CMS 테스트 누락 설정도 수정한 뒤 150개 통과, 1개 스킵. |
| 5    | chat 파일·CSS 이동. Blog 453개 테스트·typecheck·build 통과. 브라우저의 위치·크기·글꼴·색상·isolation이 이동 전과 일치.                             |
| 6    | 참조를 옮긴 후 이전 workspace·호환 코드·전용 fixture 제거. 고정 설치·root 검사·두 콘텐츠 경로 build·로컬 HTTP/SEO·브라우저 검사 수행.              |

태스크 간에는 core build를 먼저 실행했다. 삭제한 테스트는 더 이상 제공하지 않는 GitHub/file CRUD
호환 구현의 전용 검사다. 인증·secret redaction·콘텐츠 round-trip·실제 미디어 저장과 공개 계약 검사는
유지하거나 새 저장소/실제 action 검사로 옮겼다. 예상한 경계 검사 실패는 이동 전에, 발견한 문제의
재현은 수정 전에 확인했다.

## 최종 명령과 결과

| 명령                                                                                                                                          | 결과                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `pnpm install --frozen-lockfile`                                                                                                              | 통과                                                               |
| `pnpm -r list --depth -1`                                                                                                                     | root 외 workspace 4개                                              |
| core·Blog·CMS `format:check`                                                                                                                  | 모두 통과                                                          |
| `pnpm lint`                                                                                                                                   | 통과                                                               |
| `pnpm typecheck`                                                                                                                              | 통과                                                               |
| `pnpm test`                                                                                                                                   | core 73 + Blog 453 + CMS 115 + Worker 5 = 646개 통과, CMS 1개 스킵 |
| `BLOG_CONTENT_PROXY_URL=http://127.0.0.1:18787 pnpm build`                                                                                    | 전체 통과; remote fixture 사용                                     |
| `CLOUDFLARE_D1_PROXY_URL=http://127.0.0.1:18788/__local/d1 CLOUDFLARE_D1_PROXY_TOKEN=<local-fixture> pnpm --filter @blog-platform/blog build` | 실제 로컬 D1 직접 조회 build 통과                                  |
| Worker `typegen`, `typecheck`, `test`, `build`                                                                                                | 통과; build는 `wrangler deploy --dry-run`                          |
| `pnpm format:check`                                                                                                                           | 기준선과 같은 기존 문서 2개에서 실패, 새 포맷 문제 없음            |
| `git diff --check`와 원본 hash/status 비교                                                                                                    | 통과                                                               |

Turbo의 엄격한 환경 필터가 기존 local proxy 변수 두 개를 전달하지 않아, proxy만 지정한 root build는
D1 연결 실패를 재현했다. 기존 실행 동작을 바꾸지 않고 직접 D1 검증은 앱 명령으로 수행했다. CI와 같은
remote 경로는 root build로 검증했다. local fixture endpoint·토큰은 테스트 전용이며 실제 계정 값이
아니다.

## 현재 수정본의 HTTP·SEO·브라우저 검사

- 로컬 HTTP 계약 30건: 홈·About·Resume·프로젝트·출력·블로그·페이지네이션·카테고리·태그 목록·검색·
  실험 페이지·RSS·sitemap·robots, 정상 404와 기존 308/host redirect를 확인했다.
- 직접 D1에서 비공개 글은 공개 상세·CMS 공개 API에서 404, 올바른 fixture preview token은 200과
  `private, no-store`였다. CMS 목록은 요청한 3개와 전체 수 10개를 반환했다.
- `next.config.mjs`와 티스토리 redirect 매핑은 원본과 byte 단위로 동일하다. redirect/rewrite와 검색
  corpus golden snapshot은 갱신하지 않고 그대로 통과했다.
- 서버 HTML 13페이지에서 실제 본문·H1·중복 없는 canonical·JSON-LD 파싱·의도한 noindex를 확인했다.
  sitemap XML은 28개 URL을 포함했고 preview/비공개 글이 없었다. canonical은 기존 운영 URL을
  유지했다.
- Aside 브라우저로 데스크톱과 390px 화면을 확인했다. 홈·픽셀룸·글 상세의 document 너비는 390px로
  가로 넘침이 없었다. 닫힌 홈의 모델/WASM 요청은 0건이었다. 챗봇 열기·다운로드 취소·닫기를 확인했고
  큰 모델의 실제 생성은 검증하지 않았다.
- 프로젝트 STILL 미리보기 창과 상세 링크를 확인했다. 브라우저 뒤로 가기 도구는 navigation event 대기
  timeout을 냈지만, 이후 새 snapshot과 실제 URL `/projects`로 목록 복귀를 확인했다.
- CMS `/posts/new`는 로컬 D1과 development 전용 인증 bypass로 toolbar·본문·메타데이터·SEO sidebar가
  표시됨을 확인했다. 실제 OAuth 로그인·원격 발행을 대신 검증했다고 보지 않는다.

`seo-technical` 스킬의 crawlability·indexability·본문 렌더링·구조화 데이터·모바일 관련 항목을
적용했다. 설치된 SEO 실행기는 기본 Python 3.9에서 시작하지 못했고, 설치된 Python 3.11 환경으로
실행했을 때도 전용 runtime setup이 준비되지 않아 자동 sitemap discovery는 미실행이다. 위 결과는 직접
로컬 HTTP, HTML/XML 파싱과 브라우저 증거다. 운영 사이트로 미배포 코드를 검증하지 않았다. CrUX/실사용
CWV·외부 검색 색인 결과는 이번 검증에 포함하지 않았다.

## 독립 코드 리뷰

`executing-plans`/`requesting-code-review`에 따라 fresh-context 리뷰 1회를 수행했다. 리뷰어는 원래
작업본을 기준으로 다섯 Review Focus를 점검했고 Critical/Important 회귀와 조치할 minor를 찾지 못했다.
리뷰는 소스 검토이며 실제 브라우저·외부 provider·모델 추론 검증을 대신하지 않는다.

## 실행 중 판단과 남는 비용

1. 설치되지 않은 sdd helper 대신 기존 ignored 작업 폴더에 ledger/brief를 관리했다. 실행 이력은 이
   audit에도 남기므로 helper 부재가 제품 동작에 미치는 영향은 없다.
2. 승인된 계획의 격리 작업공간 절차를 사용하고 현재 사용자 변경까지 복사했다. 잘못된 기준선 위험은
   원본 88개 파일 hash/status 비교로 확인했다. 원본 작업본은 그대로다.
3. TypeScript 6의 타입 탐색에 맞춰 core tsconfig에 Node 타입을 명시했다. 순수 export의 실제 Node
   의존은 graph 검사로 금지한다. Node 타입 허용을 런타임 Node 모듈 허용으로 해석하면 안 된다.
4. CMS factory는 전환 중 core factory를 직접 재수출한 뒤 최종 호출부를 core로 통일했다. 실패/성공과
   API payload는 유지하며 중복 factory 조립을 제거했다.
5. 프로젝트·이력서 데이터는 JSON 재직렬화 대신 core의 TypeScript catalog로 이동했다. 값·순서를
   보존하고 컴파일 경계를 단순화했으며 데이터 변경 시 해당 catalog를 수정해야 한다.
6. 누락된 CMS app `.test.ts`를 검사에 포함하고 요청 없는 preview 테스트에 인증·저장 IO fixture를
   제공했다. production 인증을 우회하지 않았고 추가 검사에서 발견할 잠재 실패를 숨기지 않았다.
7. CSS 추출 후 최적화 과정이 제거한 isolation을 기존 nested `&` 형태로 보존했다. 실제 브라우저에서
   차이를 재현하고 수정 후 계산값 일치를 확인했다. 원래 겹침 동작을 유지하는 판단이다.
8. Wrangler 생성 타입과 별도로 비밀 binding 이름만 선언했다. `.dev.vars`가 없어도 타입 재생성이
   가능하며 실제 배포 환경에는 기존 두 토큰이 필요하다. 값은 추가하지 않았다.
9. 원래 사용자 변경을 이 작업의 커밋으로 묶지 않고 격리 작업공간을 그대로 보존했다. 통합·PR·배포는
   별도 요청 범위로 남는다.

원격 D1/R2 쓰기·콘텐츠 복구·실제 발행/revalidate·Vectorize sync·배포는 수행하지 않았다. schema, R2
key, 저장 본문과 chunk id를 바꾸지 않아 단계별 코드 diff로 되돌릴 수 있다. 실제 OAuth·운영 R2
업로드·프로덕션 Vectorize/Workers AI·대용량 모델 추론은 미검증이다.

이동한 migration·portfolio 스크립트 5개의 독립 `tsc --noEmit --strict` 검사도 통과했다. 스크립트는
실행하지 않고 타입·import 해석만 확인했다.

격리 작업본 복사부터 최종 검사까지 측정한 시간은 36.2분이다. 앞선 계획 작성과 실제 배포 시간은
포함하지 않는다.

초기 P30 12시간 / P50 20시간 / P80 36시간은 통계적으로 보정하지 않은 수작업 포함 추정이었다. 실제
에이전트 실행은 별도 elapsed 기록으로 남긴다. 한 번의 실행 결과를 완료 확률의 통계적 측정으로 보지
않는다.

## 후속 통합·운영 검증

위 미커밋·미통합·운영 미검증 상태는 최초 단계 종료 시점의 기록이다. 사용자의 후속 요청에 따라
리팩터링 커밋 `f4d0754`를 원래 작업 브랜치에 통합했고, 기존 사용자 변경은 미커밋 상태로 보존했다.
실제 운영 CMS 로그인·업로드·발행·공개 갱신·RAG 검색과 검증 리소스 정리 결과 및 발견한 비공개 글 노출
오류의 수정 범위는 [후속 완료 기록](2026-11-08-platform-finish.md)에 남긴다. 운영 배포는 하지
않았다.
