# Gemini RAG 구현 검증

- 날짜: 2026-11-06 (Asia/Seoul)
- 브랜치: `codex/gemini-rag`, 원본 base `850c07b77e85e25dfa1e62e59c88ff350dc79b9f`
- 구현: [계획](../superpowers/plans/2026-11-06-gemini-rag.md),
  [계약](../../specs/016-gemini-rag/contracts/rag-api.md)
- 상태: 로컬 구현·검증 완료. 운영 활성화 및 실제 Gemini 품질 검증은 미실행.

## 변경

- Gemini embedding-001 768차원·문서/질문 task type·L2 정규화, 별도 Vectorize binding·namespace.
- legacy ID와 기본 provider를 보존했다. 프로필 지문과 모델별 검색 cutoff를 분리했다.
- Worker `/answer`가 최신 공개 근거로 Gemini 답변을 생성한다. 확정 답변·후속 질문은 기존 Next
  경로다.
- 생성 후에도 근거 문서의 청크 ID를 재확인한다. 문서가 바뀌면 답변 전체를 503으로 폐기한다.
- 생성 본문의 링크는 검색된 출처 URL만 활성화한다. API 키는 Worker secret으로만 사용한다.
- remote 채팅은 기존 Hozui를 사용하며 브라우저 모델·WebGPU를 요구하지 않는다. local 코드는
  롤백용이다.
- sync 기본 dry-run, 명시적 실행·속도 제한·offset/revision 재시작을 추가했다.
- 48개 평가 fixture와 검색/생성을 구분한 평가 CLI, provider 독립 contentRevision을 추가했다.

## 자동 검증

| 명령                                                                                                                     | 결과                                                                         |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `pnpm install --offline --frozen-lockfile`                                                                               | 통과, 새 의존성 없음                                                         |
| `pnpm --filter './packages/*' build`                                                                                     | 통과, 새 worktree의 공유 dist 준비                                           |
| `pnpm --filter @blog-platform/rag-worker typegen`                                                                        | 통과, INDEX_GEMINI 타입 반영                                                 |
| `pnpm lint`                                                                                                              | 8 tasks 통과                                                                 |
| `pnpm typecheck`                                                                                                         | 9 tasks 통과                                                                 |
| `pnpm test`                                                                                                              | Blog 448, Worker 31, CMS 141, editor 17, analytics 14, SEO 15: 총 666개 통과 |
| `NEXT_PUBLIC_RAG_CHAT_MODE=remote RAG_ANSWER_PROVIDER=gemini BLOG_CONTENT_PROXY_URL=https://cms.hozorica.com pnpm build` | 6 tasks 통과                                                                 |
| `pnpm --filter @blog-platform/blog format:check`                                                                         | 통과                                                                         |
| `git diff --check`                                                                                                       | 통과                                                                         |

Worker build는 `wrangler deploy --dry-run`이다. Turbo의 Worker build output 파일 없음 경고는 기존
빌드가 번들을 업로드하지 않고 검사만 수행하기 때문에 발생하며 종료 상태는 성공이다.
타입·빌드·테스트의 일부는 Turbo 캐시를 사용했다. 변경된 Blog·Worker 검사는 새로 실행됐다.

새 worktree 초기 Blog 테스트는 공유 패키지 dist가 없어 실패했다. 공유 패키지를 빌드한 뒤 기준
435개가 통과했다. 새 테스트와 최종 수정 후 Blog는 448개다.

## 독립 리뷰와 수정

별도 gpt-6-astra 리뷰에서 아래 3개를 발견했다. 각각 실패 테스트를 먼저 실행하고 수정하여 통과했다.

1. 생성 대기 중 비공개·수정된 원문이 반환될 수 있음 → 생성 뒤 primary D1 증거 재확인.
2. 모델이 만든 Markdown URL이 클릭 가능한 출처로 보임 → 서버가 authoritative source allowlist 적용.
3. 생성 평가에 answer가 없어도 통과할 수 있음 → 필수 평가 mode와 generationPass 판정.

추가로 두 provider의 sync revision은 서로 다르므로, 같은 원문을 비교할 수 있는 contentRevision을
독립 테스트로 추가했다. 추가 리뷰를 반복하는 대신 회귀 테스트와 전체 suite로 수정 결과를 확인했다.

## 브라우저 확인

현재 worktree의 remote 모드 production build를 `http://localhost:3127`에서 실행했다. Aside
Browser에서 실제 앱·API를 사용했고 Gemini 응답을 mock으로 주입하지 않았다. 대표 프로젝트와 후속 성과
질문은 기존 확정 답변 경로여서 Gemini 키가 필요하지 않았다.

- 채팅 열기 → 대표 프로젝트 → 3개 프로젝트·출처 표시를 확인했다.
- 모바일 viewport 390×844에서 입력 가능, 페이지 scrollWidth 390, 가로 overflow 없음.
- `2번 성과` 후속 질문에서 Nexacro 화면 유형 5/5·추출 성공률 100% 원문 답변 확인.
- 데스크톱·모바일 스크린샷을 확인했다. 기존 Hozui 디자인과 채팅 스크롤·입력 영역을 유지했다.
- performance resource 목록에서 gguf·shard·wllama·Kanana 모델 요청은 0건이었다.
- 중복 전송·취소/닫기 뒤 지연 응답·잘못된 응답·429/503 안내는 jsdom 컴포넌트 테스트로 확인했다.
- Impeccable mechanical detector 결과는 빈 배열이었다. 실제 모바일 기기 시험은 미실행이다.

## SEO 확인

설치된 seo-page 지침을 적용했다. 번들 doctor가 실행 환경 누락을 반환하여 parse_html 도구는 실행하지
못했고 재설치하지 않았다. 대신 현재 로컬 build의 원시 HTML과 SEO 회귀 테스트를 확인했다.

| 페이지              | HTTP | canonical                             | meta noindex | H1  |
| ------------------- | ---- | ------------------------------------- | ------------ | --- |
| `/`                 | 200  | https://hozorica.com                  | 없음         | 1   |
| `/blog`             | 200  | https://hozorica.com/blog             | 없음         | 1   |
| `/blog/nest-di-ioc` | 200  | https://hozorica.com/blog/nest-di-ioc | 없음         | 2   |

각 title·canonical과 글 본문은 초기 HTML에 있다. 표본 글에는 페이지 제목과 본문 제목이 모두 H1으로
출력되는 기존 문제가 있다. 이번 diff는 본문 renderer나 메타데이터를 바꾸지 않으므로 관련 없는 콘텐츠
문제로 기록했으며 수정하지 않았다. 기존 공통 OG 상속 문제도 이번 작업에서 변경하지 않았다. 검색
실적·실제 색인·Core Web Vitals 실측은 수행하지 않았다.

## 남은 운영 단계와 제한

- Gemini 키 등록·실제 모델 응답·무료 프로젝트 quota·검색 Recall@3·출처/환각 품질은 아직 미검증이다.
- 새 인덱스 생성·재임베딩·비동기 반영·CMS 발행 동기화·운영 배포·원격 롤백은 미실행이다.
- 기본 설정은 legacy다. Gemini 활성화 시 embedding cutoff 평가와 두 채팅 모드 변수의 동시 전환이
  필요하다.
- 매우 낮은 quota에서 16청크 페이지가 CLI 300초/CMS 30초를 넘는 경우는 현재 지원하지 않는다. 해당
  환경에서는 비동기 갱신을 먼저 설계해야 한다. aggregate 제한은 전역 비용 상한이 아니다.
- Google 무료 데이터 처리 조건과 Vectorize의 별도 사용량을 확인해야 한다.
- [운영 runbook](../runbooks/2026-11-06-gemini-rag.md)에 후보 준비·재실행·전환·롤백 순서를 기록했다.
