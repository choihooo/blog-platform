# Blog feature 경계 리팩토링 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this
> plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. 직접 실행을 제안한다. 별도
> 에이전트 실행은 사용자가 선택하거나 적용 스킬이 요구할 때만 사용한다.

**Goal:** 현재 정식 화면과 Gemini 채팅을 유지하면서 feature 책임, UI·상태·순수 규칙, 공통 코드와
기존 Next.js BFF의 경계를 정리한다.

**Architecture:** navigation 역참조와 서버 타입 결합을 먼저 제거한다. Gemini 채팅을 분리 사례로 만든
뒤 블로그 기능을 통합하고, 실제 중복과 복잡한 화면 수명만 hook으로 추출한다. 마지막으로 HTTP
검증·응답과 서버 서비스의 조회·조합을 분리한다.

**Tech Stack:** 현재 Next.js App Router, React, TypeScript, Vitest, pnpm, Hozui, TanStack Virtual
유지.

**Spec:** [현재 책임·의존성과 보존 조건](../specs/2026-11-09-blog-feature-boundaries.md).

## Global Constraints

- 대상은 `apps/blog`다. CMS·Worker·core 구조, DB·인프라·의존성은 변경하지 않는다.
- Gemini 원격 채팅만 유지한다. 삭제한 실험 라우트·픽셀룸·로컬 모델·다운로드·진단은 복원하지 않는다.
- 정식 URL·디자인·본문·검색 결과/순서·analytics·cache·preview·발행 계약을 유지한다.
- 목록 로컬 요약 필터와 서버 검색은 별도 기능이다. 검색 total 의미·페이지 수를 변경하지 않는다.
- shared는 feature를 참조하지 않는다. core 이동은 다른 앱에서도 실제 사용할 때 별도 판단한다.
- 획일적 폴더·거대 공통 hook·범용 utils·전체 재수출 barrel을 만들지 않는다.
- apply_patch로 수정한다. 현재 미커밋 변경을 기준선으로 보존하고 임의 커밋·stash·reset을 하지
  않는다.
- 원격 쓰기·발행·revalidate·Vectorize sync·배포는 하지 않는다. 외부 IO는 fixture/mock으로 검증한다.

## Review Focus

1. 취소→재질문→이전 응답 도착·unmount가 현재 대화를 오염시키지 않는다: Task 3.
2. 타입 이동이 client의 서버 저장소·환경변수 실행 import로 연결되지 않는다: Task 2·14.
3. 필터 초기화·이미지 실패·모바일 열 변경·포커스·스크롤 위치가 유지된다: Task 5·6.
4. cache·400/403/429/503·갱신 부분 성공이 서비스 추출 후 구분된다: Task 11–13.
5. SSR·hydration·reduced-motion·영상 fallback·창 복귀·본문·SEO가 유지된다: Task 4·7–10·14.

## 기준선과 실행 순서

실험 정리와 로컬 챗봇 제거는 완료된 선행 변경이다. 마지막 소스 검증은 Blog 테스트 60 files·459
tests와 format·lint·typecheck·build 통과다. 이번 계획 작성에서는 앱 검사를 다시 실행하지 않았다.
구현 시작 시 status와 관련 검사를 다시 확인한다. 이전 통과 기록으로 새 구현을 판정하지 않는다.

| 단계                | Task  | 완료 후 상태                                      |
| ------------------- | ----- | ------------------------------------------------- |
| feature 경계        | 1–2   | navigation 역참조 제거, 공개 데이터·RAG 계약 분리 |
| 기준 사례           | 3     | Gemini 채팅 UI·요청·상태·문맥 분리                |
| 블로그 통합         | 4–6   | blog-rounded 통합, 목록 데이터·필터·가상화 분리   |
| 공통 코드·화면 hook | 7–10  | 공통 미디어 구독, 홈·About·프로젝트 제어 분리     |
| BFF·종합 검증       | 11–14 | 검색·RAG·갱신 서비스와 정식 화면 회귀 증거        |

Task는 번호대로 진행한다. 각 단계의 검증을 통과한 뒤 다음 단계로 넘어간다. 기계적인 이동은 기존
테스트를 사용하고, 취소·구독·변환 같은 경계는 의미 있는 행동 테스트를 먼저 작성한다. 각 Task는 별도
diff/커밋 후보로 유지하되 자동 커밋하지 않는다.

이하 `F = apps/blog/features`, `A = apps/blog/app`, `S = apps/blog/shared`다. `Test: <경로>`는
`pnpm --filter @blog-platform/blog exec vitest run <경로>` 명령을 뜻한다. 경로는 apps/blog 기준이며
통과 조건은 종료 코드 0과 해당 테스트 전체 통과다.

### Task 1: navigation의 블로그 검색 역참조 제거

**Files:** 수정 `F/navigation/site-shell.tsx`, `A/layout.tsx`; 생성
`F/navigation/site-shell.test.tsx`, 기존 `home-aware-shell.test.tsx` 검증.

**Interfaces:** SiteShellProps에 `headerSearch?: ReactNode` 추가. layout이 기존
BlogHeaderSearchForm을 전달하고 shell은 현재 검색 위치에 렌더한다.
categories·siteName·children·경로별 헤더 정책 유지.

- [x] 실제 검색 form을 슬롯에 전달해 archive 경로에 action `/blog/search`·name `q` 검색창이 1개
      표시되는 테스트를 작성하고 기존 구현에서 실패를 확인한다.
- [x] 슬롯과 layout 조립을 구현하고 navigation의 blog import를 제거한다.
- [x] Test: `features/navigation`, typecheck 실행. 홈·정식 목록·글 상세·프로젝트의 헤더 정책을
      유지한다.

### Task 2: 공개 타입·RAG 계약과 서버 구현 분리

**Files:** 생성 `F/blog/model/public-content.ts`, `F/rag/contracts.ts`; 수정
`F/blog/server/content-source-types.ts`, `F/rag/follow-up.ts`와 실제 타입 소비자.

**Interfaces:** public-content는 기존 PublicPost·Category·Tag·CategoryHierarchy를 소유한다.
adapter·실패·저장소 입력은 server에 남긴다. contracts는 기존 SearchSnapshot·SearchContext와
`isSearchContext(value: unknown): value is SearchContext`를 소유한다. 값·검증 한도는 바꾸지 않는다.
chat은 contracts 타입만, blog UI·rag/article-discovery는 공개 model 타입을 소비한다.

- [x] 기존 문맥 테스트로 중첩 history·제목 4개·history 6개·600자 초과 query 거부를 기준선 확인한다.
- [x] 타입·validator를 옮기고 소비자를 이전한다. server entry의 필요한 type export는 유지하되
      client가 서버 실행 코드를 재수출하는 경로를 사용하지 않게 한다. catalog는 core에 유지한다.
- [x] Test:
      `features/rag/follow-up-api.test.ts features/rag/visitor-coverage.test.ts features/blog/server`,
      typecheck 실행. 이동 자체를 검사하는 소스 텍스트 테스트는 추가하지 않는다.

### Task 3: Gemini 채팅의 요청·문맥·상태 분리

**Files:** 수정 `F/chat/portfolio-chat-remote.tsx`; 생성 `F/chat/client/rag-client.ts`,
`F/chat/model/search-context.ts`, `F/chat/hooks/use-remote-chat.ts`와 각각의 동명 테스트.
portfolio-chat 진입점, messages·answer UI, Message 타입은 유지한다.

**Interfaces:**

- `requestRag(input: { query: string; context?: SearchContext }, signal: AbortSignal): Promise<RagResult>`:
  기존 POST·40초 timeout·JSON/출처/answer 검증. Error message는
  rate_limited·unavailable·invalid_answer.
- `advanceSearchContext(previous: SearchContext | undefined, query: string, result: RagResult): SearchContext | undefined`:
  sources 없으면 이전 값 유지. resolvedQuery 우선, 제목 dedupe 후 3개, history 마지막 5개.
- `useRemoteChat(): { draft: string; setDraft(value: string): void; messages: Message[]; pending: boolean; error: string; send(value: string): Promise<void>; cancel(): void }`.
  send는 trim 후 빈 값·600자 초과·진행 중 중복을 거부한다. cancel/unmount는 작업을 무효화한다.

- [x] client·문맥·hook 테스트를 작성하고 미구현 실패를 확인한다. sources 없음·중복 제목·6번째
      history, 요청 취소→재요청→이전 응답 도착·unmount를 실제 hook harness와 literal fixture로
      검증한다.
- [x] 세 모듈을 추출한다. open·close·DOM 포커스·자동 스크롤은 UI에 두고 close에서 cancel한다. 현재
      요청 식별과 finally 분기를 보존해 이전 요청이 새 pending을 해제하지 않게 한다.
- [x] Test: `features/chat`. 환경변수 없는 실제 진입점, 추천 질문·출처·429/503·잘못된
      답변·닫기/재열기 확인.

### Task 4: blog-rounded를 정식 blog에 통합

**Files / 이동표:** 원본 `F/blog-rounded/`에서 아래로 이동한다. 테스트는 모듈 옆으로 함께 옮긴다.

| 원본                                                                    | 목적지 (`F/blog/` 아래)    |
| ----------------------------------------------------------------------- | -------------------------- |
| rounded-blog.tsx                                                        | listing/blog-listing.tsx   |
| virtual-post-grid.tsx, post-card.tsx, post-rows.ts, scroll-load-gate.ts | listing/                   |
| preview-model.ts                                                        | model/post-summary.ts      |
| preview-article.ts                                                      | article/prepare-article.ts |
| article-navigation.ts, article-navigation-panel.tsx, post-tags.tsx      | article/                   |
| rounded-blog.css, README                                                | blog.css, README.md        |

수정 `A/blog/page.tsx`, `A/posts/[slug]/page.tsx`와 모든 소비자 import. 기존 archive UI
`F/blog/components`와 `A/posts/[slug]/post-body-renderer.tsx`는 현 경로를 유지한다.

**Interfaces:** RoundedBlog→BlogListing, PreviewPost→PostSummary, PreviewCategory→ListingCategory,
filterPreviewPosts→filterPosts, preparePreviewArticle→prepareArticle,
previewImageSizes→postImageSizes, canOptimizePreviewImage→canOptimizePostImage. 기존 인자·반환
shape·basePath `/blog`·CSS `.rounded-blog*` selector는 유지한다.

- [x] 기존 목록 모델·상세·본문·SEO 테스트를 기준선 실행한다. 이동 전용 신규 테스트는 만들지 않는다.
- [x] 표와 이름 매핑대로 이전하고 잔여 소비자를 검색한다. 임시 재수출·기존 폴더를 남기지 않는다.
- [x] Test:
      `features/blog app/posts app/public-seo-output.test.tsx app/generated-output-routes.test.ts`,
      typecheck. 제목 중복 제거·목차·이전/다음·날짜·이미지·analytics 유지 확인.

### Task 5: 목록 데이터 변환과 필터 상태 분리

**Files:** 생성 `F/blog/server/listing-service.ts`, `F/blog/listing/use-blog-filter.ts`와 동명
테스트; 수정 `A/blog/page.tsx`, `F/blog/listing/blog-listing.tsx`, `F/blog/model/post-summary.ts`.

**Interfaces:**
`loadBlogListing(): Promise<{ posts: PostSummary[]; categories: ListingCategory[] }>`. 기존
getAllPublishedPosts({ analyzeBody: false })·부모/자식 조회와 순서를 사용하며 기존 8개 요약 필드만
선택한다. `useBlogFilter(posts: PostSummary[], categories: ListingCategory[])`는 query, category,
setQuery, setCategory, filtered, available, selectedLabel, labels를 반환한다. 계산은 model의 순수
함수에 둔다.

- [x] 본문·추가 필드가 client 요약에 섞이지 않음, 부모→자식 순서, 빈 목록과 장애 전파를 고정하고
      미구현 실패 확인. 필터 테스트에 상위 category 하위 포함·제목/요약/태그 AND 검색·초기화를
      포함한다.
- [x] loader·hook을 구현한다. 필터 변경 시 기존 keyed grid 재생성·카운트·전체 글 선택을 유지한다.
- [x] Test:
      `features/blog/server/listing-service.test.ts features/blog/listing/use-blog-filter.test.tsx features/blog/model`.

### Task 6: 가상화 목록 수명과 JSX 분리

**Files:** 생성 `F/blog/listing/use-virtual-post-grid.ts`, `use-virtual-post-grid.test.tsx`; 수정
`virtual-post-grid.tsx`. post-rows·scroll-load-gate는 순수 모듈로 유지한다.

**Interfaces:** `useVirtualPostGrid(posts: PostSummary[])`는 listRef, sentinelRef, rows,
virtualizer, ready, loading, hasMore, columns, visible, focusedRow, setFocusedRow를 반환한다.
ref·observer·decode·timer·anchor 보정은 hook, 카드·skeleton·접근성 JSX는 UI가 소유한다.

- [x] observer·clock·decode fixture로 초기/추가 8개, 이미지 실패·1.5초 상한, unmount 뒤 늦은 완료
      무시, 감지 영역에 계속 머물러도 연속 추가하지 않음을 테스트하고 미구현 실패 확인.
- [x] 수명을 추출한다. 759px 열 전환·600px 감지·overscan 2·focused row·layout effect anchor 보정을
      유지한다.
- [x] Test: `features/blog/listing`. 로컬 브라우저에서 필터 reset·모바일 열 변경·포커스·스크롤 위치
      확인.

### Task 7: 공통 미디어 구독

**Files:** 생성 `S/browser/use-media-query.ts`, `use-media-query.test.tsx`.

**Interfaces:**
`useMediaQuery(query: string, serverValue: boolean): { matches: boolean; ready: boolean }`. SSR/첫
hydration은 serverValue·ready=false, 구독 후 실제 matches·ready=true. query 교체/unmount에서 이전
listener를 정리하며 module scope에서 DOM에 접근하지 않는다.

- [x] SSR/첫 hydration 일치·change·query 교체·Strict Mode cleanup 테스트를 작성하고 실패 확인.
- [x] hook을 구현한다. viewport 높이·장면·영상 오류 등 기능별 판단을 shared에 넣지 않는다.
- [x] Test: `shared/browser/use-media-query.test.tsx`. Task 8·9에서 실제 소비자 2곳을 이전한다.

### Task 8: 홈 영상 재생 수명

**Files:** 생성 `F/scroll-story/use-story-playback.ts`, `use-story-playback.test.tsx`; 수정
`scroll-story.tsx`. use-story-navigation·story-controller는 유지한다.

**Interfaces:**
`useStoryPlayback(input: { videos: RefObject<(HTMLVideoElement | null)[]>; transitionVideo: RefObject<HTMLVideoElement | null>; displayed: SceneIndex; transition: StoryState['transition']; reducedMotion: boolean; videoReady: readonly boolean[] }): void`.
현재 재생 effect·visibilitychange만 소유한다. UI는 useMediaQuery로 reduced-motion을 구독하고 기존
format·전환 id·4초 timeout·준비 상태·navigation 조합을 유지한다.

- [x] 활성 장면만 재생·숨긴 탭/모션 줄이기에서 정지·전환 영상 정지·play 거절 처리 테스트 후 실패
      확인.
- [x] 재생 hook과 공통 구독을 적용한다. hash replace·history state·fallback을 변경하지 않는다.
- [x] Test: `features/scroll-story app/home-routes.test.tsx`. 전환 중 역방향 이동·뒤로가기 장면 복원
      확인.

### Task 9: About 스크롤 연결

**Files:** 생성 `F/about/use-about-scroll.ts`, `use-about-scroll.test.tsx`; 수정 `about-story.tsx`.
about-data·scroll-video의 계산과 scrubber는 유지한다.

**Interfaces:**
`useAboutScroll(input: { mode: 'static' | 'scroll'; track: RefObject<HTMLDivElement | null>; video: RefObject<HTMLVideoElement | null>; progressLine: RefObject<HTMLDivElement | null> }): number`는
chapter를 반환한다. frame·scroll/resize/pageshow·dispose를 소유한다. mode·ready·failed·12초
fallback·goTo는 화면에 유지하고 reduced-motion 구독만 shared로 바꾼다.

- [x] frame 중복 예약 방지·chapter 갱신·static 전환/unmount의 frame 취소·구독 정리 테스트 후 실패
      확인.
- [x] hook을 적용하고 viewport 높이·모션 줄이기·영상 실패에 따른 일반 문서 fallback을 유지한다.
- [x] Test: `features/about app/about/page.test.tsx`. SSR 영상 src 없음·실제 링크, 12초 지연·540px
      이하 확인.

### Task 10: 프로젝트 바탕화면 제어

**Files:** 생성 `F/projects/desktop/use-desktop-workspace.ts`, `use-desktop-workspace.test.tsx`;
수정 `desktop-portfolio.tsx`, `desktop-data.ts`. desktop-state와 테스트는 유지한다.

**Interfaces:** `useDesktopWorkspace()`는 workspaceRef, windows, active, dispatch, open(id),
close(id), minimize(id), openShortcut(id), clearPositions(), windowPosition(item: DesktopWindow):
WindowRect, iconPosition(id: string, index: number): Point, startDrag(event, kind, id, point),
moveDrag(event), endDrag(), cancelDrag(), startResize(event, id, edge: ResizeEdge, rect:
WindowRect)를 반환한다. PointerEvent·Point·kind는 현재 함수 타입을 유지한다. openShortcut은 drag 후
click 억제까지 담당한다. iconPlacements는 desktop-data로 옮겨 좌표와 UI rotation이 같은 값을
소비하게 한다.

- [x] DOM harness로 창 열기/닫기/최소화·포커스 반환, drag 5px threshold·click 억제, pointer cancel
      뒤 새 조작 가능 테스트를 작성하고 실패 확인한다.
- [x] 상태·ResizeObserver·hash·포커스·pointer 수명을 추출한다. 기존 reducer·clamp/resize를
      재사용하고 dialog·dock·미리보기 JSX·스타일은 화면에 유지한다.
- [x] Test: `features/projects app/projects/projects-route.test.tsx`. 직접
      진입·새로고침·뒤로가기·모바일 창 경계·Escape·drag/resize·최소화 복원을 브라우저에서 확인한다.

### Task 11: 검색 BFF 서비스

**Files:** 생성 `F/blog/server/search-service.ts`, `search-service.test.ts`,
`A/api/search/route.test.ts`; 수정 `A/api/search/route.ts`.

**Interfaces:**
`searchPublicPosts(input: { query: string; categoryPath?: string; page: number; limit: number }): Promise<{ items: SearchPostItem[]; total: number; query: string }>`.
SearchPostItem은 현재 slug/title/excerpt/category/tags/publishedAt/updatedAt/readingTimeLabel/
coverImage/url 10개 필드·중첩 타입 그대로다. total=posts.length 유지. route는 trim·page/limit
정규화·빈 query 응답·공개 cache 헤더를 소유한다.

- [x] 공백 query·page 음수/소수·limit 기본 20/상한 100·category·null category·누락 필드·장애 전파
      fixture와 서비스 미구현 실패를 확인한다.
- [x] 검색/DTO 매핑을 추출한다. `public, s-maxage=60, stale-while-revalidate=300`은 유지한다.
- [x] Test:
      `features/blog/server/search-service.test.ts app/api/search/route.test.ts app/generated-output-routes.test.ts`.

### Task 12: Gemini RAG 응답 조합 서비스

**Files:** 생성 `F/rag/server/answer-service.ts`, `answer-service.test.ts`; 수정
`A/api/rag/route.ts`. 기존 Worker client `F/rag/server.ts`는 유지한다.

**Interfaces:**
`answerQuestion(query: string, context?: SearchContext, signal?: AbortSignal): Promise<RagResult & { resolvedQuery: string }>`.
conversation→follow-up→clarification/retrieve 순서를 소유한다. route는 origin·32768 bytes JSON·
query/context 검증, 상태·헤더·오류 매핑을 소유한다. 서버 컴포넌트는 서비스를 직접 호출한다.

- [x] 모호한 질문·authoritative 우선·resolvedQuery·abort 전달과 HTTP의 origin/JSON/context/크기·
      429/503 사례를 고정한다. 서비스 미구현 실패를 확인한다.
- [x] 조합을 추출한다. Worker `/answer`·35초 timeout·출처/answer 검증을 유지하고 기존 검증 오류에
      없던 헤더를 일괄 추가하지 않는다. 서버에서 자기 `/api/*`를 HTTP로 호출하지 않는다.
- [x] Test: `features/rag features/chat`. 공개 근거 재조회·client history를 근거로 사용하지 않음·키
      비노출 확인.

### Task 13: 공개 갱신 부분 성공 서비스

**Files:** 생성 `A/api/revalidate/refresh-service.ts`, `refresh-service.test.ts`,
`A/api/revalidate/route.test.ts`; 수정 `A/api/revalidate/route.ts`.

**Interfaces:**
`refreshPublicPath(path: string): Promise<{ revalidated: true; ragSyncFailed: boolean }>`. cache tag
2개·입력 경로·rewrite `/posts/:slug`를 갱신하고 설정된 경우만 sync한다. sync 실패만 부분 성공으로
반환하고 cache 실패는 전파한다. route는 secret·JSON·path 검증과 현재 JSON 문구·ok·path·시간·502
응답을 조립한다. 이 서비스는 app에서 blog와 rag를 조합한다. blog 안에 배치해 blog→rag→blog 순환을
만들지 않으며 UI·model로 export하지 않는다.

- [x] secret 없음/오류·JSON 오류·public path 거부, 목록/글 경로·sync 설정 없음·sync 실패·cache 실패
      테스트를 작성하고 서비스 미구현 실패를 확인한다. Next cache·외부 sync 경계만 mock한다.
- [x] 조합을 추출한다. 새 path 정책·retry·오류 wrapping·상태 코드 변경은 추가하지 않는다.
- [x] Test:
      `app/api/revalidate/refresh-service.test.ts app/api/revalidate/route.test.ts app/api-contract-preservation.test.ts app/public-publish-flow.test.ts`.
      갱신 성공 + sync 실패는 502·`revalidated: true`임을 별도로 확인한다.

### Task 14: 경계 감사와 정식 화면 검증

**Files:** 갱신 `apps/blog/README.md`, 관련 feature README, spec·이 계획; 기록
`docs/audits/2026-11-09-blog-feature-refactoring.md`.

**Interfaces:** 새 제품 API 없음. Task별 구현·검증 결과를 checkbox와 audit에 연결한다.

- [x] AST import 감사: navigation→blog·shared→feature·feature 순환 없음, chat→rag/contracts 타입
      참조만 존재, client의 server 실행 의존 없음, blog-rounded 잔여 소비자 없음 확인. 정상 rag→blog
      조회와 타입 참조는 허용하며 계산된 dynamic import는 수동 점검한다.
- [x] Blog `format:check`, `lint`, `typecheck`, `test`, `build` 전체 실행. 타 앱/core 변경이
      필요하면 해당 AGENTS·계약·검증 범위를 먼저 갱신한다.
- [x] 현재 수정본 로컬에서 홈·About·프로젝트 목록/상세·블로그 목록/상세·검색·taxonomy·preview·
      RSS·sitemap을 확인한다. 본문·canonical·의도한 noindex·비공개 글 제외 검사.
- [x] 데스크톱/390px에서 채팅 중지/재시도·목록 포커스·뒤로가기/새로고침·영상 fallback·창 복원 확인.
      관련 SEO 스킬로 발견→수정→재검사를 수행하고 증거를 audit에 남긴다.
- [x] 최종 diff와 요구사항별 완료 여부 검토. 미실행·환경 제약·기존 실패를 기록하고 fixture 결과를
      실제 Gemini·운영 데이터·배포 검증으로 보고하지 않는다. snapshot을 무조건 갱신하지 않는다.

## 계획 검토와 실행

- Task 1–14 구현·검증 완료다. 최종 76 files / 502 tests와 format·lint·typecheck·build가 통과했다.
  선행 삭제 작업을 새 리팩토링 완료로 집계하지 않는다.
- 직접 실행을 권장한다. 같은 앱의 타입·이동 경로·hook 인터페이스를 연속해서 이전하므로 한 실행자가
  단계별로 검증하는 방식이 적합하다.
- 구현 전 계획을 검토하고 실행 방식을 확인한다. 범위가 바뀌면 관련 Task·검증 기준을 먼저 수정한다.
  커밋·PR·배포는 별도 요청 없이는 하지 않는다.
- 실행 증거와 남은 수동/외부 검증 범위는
  [최종 audit](../../audits/2026-11-09-blog-feature-refactoring.md)에 기록했다.
