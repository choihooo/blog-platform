# Blog feature 경계 리팩토링 검증

## 범위와 작업본

- 계획: [실행 체크리스트](../superpowers/plans/2026-11-09-blog-feature-refactoring.md).
- 기준: [책임·의존성·계약](../superpowers/specs/2026-11-09-blog-feature-boundaries.md).
- 구현 위치: `/Users/choiho/.codex/worktrees/blog-feature-refactoring/blog`.
- 시작점은 main의 HEAD와 기존 미커밋 실험·로컬 챗봇 정리 57개 파일을 함께 복사한 작업본이다. main에
  직접 구현하지 않았다. 원본 변경 파일 hash와 git status는 실행 후에도 동일하다.
- CMS·Worker·core 원본, 콘텐츠·DB·원격 모델은 수정하지 않았다. 커밋·PR·배포는 하지 않았다.

## 구현 결과

1. layout에서 검색 UI를 navigation 슬롯으로 전달한다. 공개 콘텐츠 model과 RAG contracts는 서버
   구현에서 분리했다.
2. Gemini 채팅을 UI, client 요청, 대화 문맥 model, React 상태 hook으로 나눴다. 기존 600자·40초
   timeout·취소·동시 전송 방지·늦은 응답 무시는 보존했다.
3. blog-rounded 17개 파일을 blog의 listing/article/model과 CSS·README로 통합했다. CSS selector·본문
   renderer·URL은 유지했다. 목록의 서버 요약, 필터 hook, 가상화 수명을 분리했다.
4. 공통 media-query 구독과 홈 영상 재생·About 스크롤·프로젝트 창 제어 hook을 추출했다. 기존
   reducer·geometry·scrubber를 재사용한다.
5. 검색·RAG 조합 서비스를 추출했다. 공개 갱신은 app/api/revalidate에서 blog cache와 rag sync를
   조합해 feature 순환을 피했다.

## 단계별 자동 검사

모든 명령은 `pnpm --filter @blog-platform/blog` 기준이다. 아래 숫자는 각 단계가 끝난 시점의 집중
테스트 결과이며 마지막 행은 최종 전체 결과다. 단계별 신규 경계는 미구현 실패와 구현 후 통과를
확인했고, 순수 이동은 기존 테스트를 사용했다. 전체 로그는 작업공간의
`.agents/blog-feature-refactoring/`에 보존했다.

| Task   | 검사 대상                                    | 결과                                                   |
| ------ | -------------------------------------------- | ------------------------------------------------------ |
| 기준선 | 전체 테스트                                  | 60 files / 459 tests 통과                              |
| 1      | navigation와 검색 슬롯                       | 16 tests + typecheck 통과                              |
| 2      | 공개 타입·문맥·콘텐츠 서버                   | 179 tests + typecheck 통과                             |
| 3      | 채팅 client·문맥·hook·UI                     | 19 tests + typecheck 통과                              |
| 4      | 블로그 통합·본문·generated output            | 70 tests + typecheck 통과                              |
| 5      | 목록 loader·filter·model                     | 7 tests + typecheck 통과                               |
| 6      | 가상화 목록·순수 gate                        | 9 tests 통과, 이후 typecheck·추가 cleanup 검사 통과    |
| 7      | SSR/hydration·query 변경·Strict Mode cleanup | 2 tests + typecheck 통과                               |
| 8      | 홈·재생·전환                                 | 13 tests + typecheck 통과, 리뷰 후 거절/전환 검사 추가 |
| 9      | About·scroll frame cleanup                   | 9 tests + typecheck 통과                               |
| 10     | 창 상태·포커스·pointer·정식 경로             | 29 tests 통과, Task 11에서 typecheck 재확인            |
| 11     | 검색 서비스·route·generated output           | 12 tests + typecheck 통과                              |
| 12     | RAG·채팅 전체                                | 323 tests + typecheck 통과                             |
| 13     | 공개 갱신·부분 성공·기존 계약                | 12 tests + typecheck 통과                              |
| 최종   | 전체 `test`                                  | **76 files / 502 tests 통과**                          |
| 최종   | `format:check`, `lint`, `typecheck`, `build` | 통과                                                   |

Task 10 직후 typecheck는 미리 작성한 Task 11 서비스 테스트의 미구현 import 때문에 실패했다. 프로젝트
테스트는 29개 통과했으며, Task 11 구현 후 전체 타입 검사를 다시 통과했다. 이를 프로젝트 자체 타입
오류를 수정한 것처럼 보고하지 않는다.

## 의존성 감사

TypeScript AST로 제품 TS/TSX 131개 파일의 import/re-export와 문자열 dynamic import를 조사했다. 타입
참조와 실행 참조를 구분했다. feature는 10개이며 제품 TypeScript 파일은 94개다.

- navigation→blog, shared→feature, feature 실행 순환: 없음.
- chat→rag: contracts 타입만 참조한다. client에서 서버 저장소·환경변수 실행 경로로 연결되지 않는다.
- blog→navigation, rag→blog, scroll-story→chat/navigation, about/projects→navigation은 유지한다.
- blog-rounded 제품 import·이전 이름 소비자: 없음. 테스트와 README는 이동 경로를 사용한다.
- 계산된 dynamic import를 새로 추가하지 않았다. 실제 CSS는 기존 selector와 선언을 유지했다.

## HTTP·HTML·SEO

현재 production 작업본 :3117과 리팩토링 직전 작업본 :3118을 동시에 실행해 비교했다. 운영 사이트
결과로 로컬 변경을 대신 검증하지 않았다.

- 대표 경로 16개에서 상태·canonical·robots가 동일했다. 홈, About, 이력서, 프로젝트 목록/상세, 블로그
  목록/상세/페이지/검색/태그, RSS·sitemap·robots, 없는 preview와 제거한 경로를 포함했다.
- 공개 페이지 10개에서 서버 HTML의 본문 텍스트·링크·제목 구조·JSON-LD가 모두 동일했다.
- 검색 API 두 요청의 JSON과 cache가 동일했다. 공개 cache는
  `public, s-maxage=60, stale-while-revalidate=300`이다.
- category 대표 2개와 tag 대표 1개는 모두 이전/이후 200이었다.
- sitemap에 preview·experiments URL이 없었다. 없는 preview는 404·private/no-store를 유지했다.
- 기존 preview·published-only·비공개 글 제외 계약은 자동 테스트로도 확인했다.
- 기존에 읽은 seo-technical 스킬의 URL·색인·본문·모바일 항목을 적용했다. 실사용 CWV·외부 검색
  색인·실제 draft token 접근은 이번 로컬 수동 검증에 포함하지 않았다.

## 브라우저 확인

Aside의 직접 REPL과 실제 DOM·화면을 사용했다. 별도 사용자 탭은 변경하지 않았다.

- 홈 Blog 장면→목록→상세를 탐색했다. 뒤로가기로 목록과 홈 `#blog` 장면이 복원됐다. Aside의 goBack은
  navigation 대기 timeout을 냈지만, 다음 snapshot의 실제 URL과 장면으로 복귀를 확인했다.
- 모바일 390px 목록에서 검색 결과 없음·전체 글 초기화를 확인했다. 상세 본문·표지·공유·다른 글 탐색도
  표시됐다. 상세 screenshot을 열어 레이아웃을 확인했다.
- 모바일 홈 채팅에서 추천 기술 스택 질문·답변·출처 표시, Escape 닫기와 트리거 포커스 복귀를
  확인했다. 모델/GGUF/WASM 요청은 0건이었다. 이 질문은 공개 이력서의 사실 응답이며 외부 Gemini 호출
  검증은 아니다.
- 프로젝트 Kusting 창 열기·키보드 resize(720→736px)·최소화·Dock 포커스·복원·Escape 닫기·launcher
  포커스 복귀를 확인했다.
- 실제 pointer drag로 Kusting 아이콘이 x 30px·y 20px 이동하고 창이 잘못 열리지 않는 것도 확인했다.
- About 390×500에서 일반 문서 fallback, video src 없음, 실제 링크를 확인했다. 목록·상세·홈
  채팅·About의 document 폭은 390px로 가로 넘침이 없었다.
- 지연 응답 취소·이미지 decode 취소·play 거절·영상 전환·pointer drag 임계값은 자동 테스트로
  검증했다. 실제 외부 Gemini 생성·원격 sync·실제 영상 12초 지연·운영 발행은 실행하지 않았다.

## 독립 리뷰와 검증 보완

fresh-context 읽기 전용 리뷰 1회를 수행했다. 이전 승인 작업본과 직접 비교한 결과 중요한 제품 회귀는
발견하지 못했다. 판단을 유보한 동작도 없었다.

리뷰는 두 테스트 누락을 지적했다: 진행 중 unmount 뒤 늦은 decode, play 거절·전환 상태. 계획의 명시적
검증 요구이므로 한 번의 테스트 보완으로 해결했다. deadline cleanup과 play 예외 처리를 임시 제거했을
때 테스트가 실패했고, 기존 보호 코드를 복원하면 6개 집중 테스트와 전체 502개가 통과했다. 최종 제품
보호 로직은 변경하지 않았으며 재리뷰를 반복하지 않았다. 미해결 리뷰 항목은 없다.

## 실행 중 판단과 영향

순서는 실행 ledger의 Ruling 기록과 같다.

1. 설치된 task helper가 없는 하위 스크립트에 의존해, 같은 형식의 로컬 ledger·로그와 직접 test gate를
   사용했다. 제품 영향은 없으며 누락 위험은 단계별 결과와 최종 감사로 확인했다.
2. 계획의 기존 요약 9개 필드는 실제 8개여서 원래 8개를 유지했다. 잘못 추가/누락하면 client 데이터
   계약이 달라지므로 exact shape 테스트로 고정했다.
3. 가상화 hook은 UI transform이 쓰던 margin도 반환한다. 누락하면 행 위치가 달라지므로 기존 값을
   유지했다.
4. 프로젝트 hook은 기존 키보드 resize의 windowBounds도 반환한다. 누락하면 창 경계가 달라지므로 동일
   계산과 실제 resize를 확인했다.
5. Turbopack이 작업공간 밖 dependency symlink를 거부해 작업공간 안에 offline·frozen-lockfile·
   ignore-scripts 설치를 수행했다. lockfile과 source 변경은 없다. 이후 build가 통과했다.
6. 리뷰의 두 경미한 coverage 누락은 계획의 필수 검증으로 취급해 한 번의 테스트 보완을 수행했다. 잘못
   판단하면 중요한 비동기 회귀가 미검증으로 남으므로 mutation RED→GREEN과 전체 suite로 확인했다.

미커밋 작업과 ledger가 유일한 실행 기록이므로 임시 작업공간을 삭제하지 않는다. 원본 main 작업본은
보존했고, 후속 통합·커밋·배포는 별도 요청 범위다.

## 원본 main 반영과 커밋

사용자의 후속 지시로 원본 `/Users/choiho/coding/blog`의 main에 변경을 반영했다. 반영 전 기존 57개
변경 파일의 hash·git status와 HEAD가 기준선 그대로임을 확인했다. 리팩토링 변경을 patch로 적용하고,
커밋 범위 142개 파일이 격리 작업공간의 최종 내용과 동일함을 확인했다. 앞서 승인한 실험 페이지·로컬
챗봇 제거도 같은 커밋 범위에 포함한다. 무관한 변경·비밀키·생성물은 포함하지 않는다.

원본 main에서 Blog 테스트 76 files·502 tests, format:check·lint·typecheck·production build를 다시
실행해 통과했다. 현재 main의 로컬 production 서버에서 홈·About·프로젝트·블로그 목록/상세·
검색·sitemap의 정상 응답과 없는 preview·삭제한 실험 경로의 404를 확인했다. 정식 canonical과 검색
noindex, preview private/no-store를 유지했다. 후속 반영에서 제품 코드를 추가로 바꾸지 않았다.

이 절은 앞선 '원본 보존·미커밋' 종료 시점 기록 이후의 통합 결과다. 커밋은 로컬 main에 생성하며 원격
push·배포·실제 Gemini 생성·원격 발행/revalidate는 실행하지 않는다.
