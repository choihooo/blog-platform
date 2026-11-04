# Scroll Story Home Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 승인된 3장면 스크롤 시안을 정식 홈으로 올리고 픽셀룸은 보관 경로로 옮긴다.

**Architecture:** 기존 `features/scroll-story`를 그대로 정식 기능으로 사용하며 `ScrollStoryHome`에서 스토리와 챗봇을 조합한다. 루트 페이지의 서버 SEO와 기존 상세 라우트를 유지한다. 영상 상태 처리와 hash 복원을 작은 컨트롤러에 분리하고 픽셀룸 코드는 보관 페이지에서 계속 사용할 수 있게 둔다.

**Tech Stack:** Next.js 16.2.12 App Router, React 19.2.8, TypeScript 6, 기존 Hozui/CSS, Vitest 4.1.10, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-04-scroll-story-home.md`.

## Global Constraints

- 기존 승인 장면·문구·색상·미디어를 사용한다. About `/resume`, Blog `/blog`, Portfolio `/projects`를 유지한다.
- 픽셀룸 보관 경로는 `/experiments/pixel-room`, 기존 시안 주소는 `/`로 영구 리디렉션한다.
- canonical `/`, Person JSON-LD, OG·Twitter, 분석 및 콘텐츠 조회 계약을 유지한다.
- reduced motion, 44×44px 이상 조작 영역, 정지 이미지 대체, 키보드·모바일 접근을 지원한다.
- 기존 미커밋 파일을 보존한다. 소스 수정은 apply_patch, 새 의존성·DB/R2 쓰기·영상 생성은 없다.
- 작업 시작 시 using-git-worktrees로 격리 환경을 준비하되 **현재 미추적 스크롤 소스와 미디어까지 명시적으로 가져온다**. HEAD만 체크아웃하면 시안이 누락된다.
- 커밋은 태스크별 경로만 stage한다. `git add .`로 썸네일/OG 작업이나 다른 기존 변경을 섞지 않는다.

## Review Focus

1. 상세→뒤로 가기·새로고침·직접 hash 진입에서 헤더/장면/스크롤이 어긋나지 않는다. → Task 3 QA.
2. 영상 실패·재생 거절·전환 중 재선택·늦은 이벤트에도 CTA가 복구된다. → Task 2 단위 테스트 + QA.
3. 작은 화면·모션 줄이기·JS 비활성에서도 목적지 탐색이 가능하다. → Task 2/3 SSR 및 QA.
4. 홈 진입이 챗봇의 대용량 모델 다운로드를 시작하지 않는다. → Task 4 네트워크 QA.
5. 실험 noindex 또는 픽셀룸 전용 헤더 처리가 운영 홈·상세 SEO로 새지 않는다. → Task 1 테스트 + Task 5 HTTP 확인.

---

## 파일 구조와 작업 경계

| 파일 | 책임 |
| --- | --- |
| `apps/blog/app/page.tsx` | 서버 SEO를 유지하며 정식 홈 렌더 |
| `apps/blog/features/scroll-story/scroll-story-home.tsx` (신규) | 스토리·챗봇 조합, CSS import 단일 진입점 |
| `apps/blog/features/scroll-story/scroll-story.tsx` | 기존 장면/영상/컨트롤 UI |
| `apps/blog/features/scroll-story/story-controller.ts` (신규) | 목적 장면·전환 ID·완료·취소의 순수 상태 전이 |
| `apps/blog/features/scroll-story/use-story-navigation.ts` (신규) | hash·컨테이너 위치·화면 회전 복원 |
| `apps/blog/features/scroll-story/scroll-story.css` | 정식 홈의 반응형·모션·포커스·대체화면 |
| `apps/blog/features/navigation/home-aware-shell.tsx` | 정식 홈/보관 페이지 헤더 정책 |
| `apps/blog/app/experiments/{scroll-story,pixel-room}/page.tsx` | 시안 리디렉션 / 픽셀룸 보관 |
| `apps/blog/features/pixel-room/portfolio-chat.tsx` | 최초 사용자 열기 때 모델 로드 |
| `apps/blog/features/pixel-room/integration.test.ts` | 기존 픽셀룸 자산/링크 계약 유지, 루트 PixelRoom 강제 검사 대체 |
| `apps/blog/features/scroll-story/*.test.{ts,tsx}` (신규) | 전환 상태 및 정식 홈 출력 계약 |
| `apps/blog/features/navigation/home-aware-shell.test.tsx` (신규) | pathname별 헤더 렌더 계약 |
| `apps/blog/app/home-routes.test.tsx` (신규) | 정식 홈 SEO·보관·리디렉션 계약 |

### Task 1: 정식 홈 진입점과 픽셀룸 보관 경로

**Files:** 위 표의 `app/page.tsx`, 두 실험 route, `scroll-story-home.tsx`, `home-aware-shell.tsx`, `app/home-routes.test.tsx`, 기존 `pixel-room/integration.test.ts`.

**Interfaces:**
- Consumes: 기존 `ScrollStory(): JSX.Element`, `PortfolioChat(...)`, `PixelRoom()`, `getSiteConfig()`, `personJsonLd(site)`.
- Produces: `ScrollStoryHome(): React.JSX.Element`; `/` 정식 홈, `/experiments/pixel-room` 보관, 이전 시안 주소→`/` 308.

- [ ] **Step 1: 홈/라우트 테스트를 먼저 작성한다.** `home-routes.test.tsx`에서 async Home을 실제 SSR로 렌더해 인사 제목·About 링크·Person JSON-LD를 검사하고 metadata canonical `/` 및 noindex 부재를 확인한다. 콘텐츠 공급자만 fixture로 대체한다. 다음 라우트 계약을 실행해 검사한다:

```ts
expect(metadata.alternates).toMatchObject({ canonical: "/" });
expect(metadata.robots).not.toEqual({ index: false, follow: false });
// permanentRedirect만 경계에서 대체하고 실제 route 함수를 호출한다.
expect(() => ScrollStoryPreviewPage()).toThrow("redirect:/");
expect(archiveMetadata.robots).toEqual({ index: false, follow: false });
```

기존 integration 테스트의 `home`에 PixelRoom 소스가 있어야 한다는 검사만 제거/대체한다. 보관된 픽셀룸의 실제 이미지 존재·hotspot·콘텐츠 일반 라우트 검증은 유지한다.

- [ ] **Step 2: RED 확인.** `pnpm --filter @blog-platform/blog test app/home-routes.test.tsx features/pixel-room/integration.test.ts` → 새 홈/보관 route 또는 리디렉션 미구현으로 FAIL.
- [ ] **Step 3: 홈을 연결한다.** `ScrollStoryHome()`은 현 실험 페이지와 같은 스토리/챗봇 조합을 렌더한다. 루트에서 PixelRoom만 교체하고 기존 SEO script는 보존한다. 보관 route는 기존 PixelRoom을 렌더하며 noindex를 지정한다. 실험 route는 `permanentRedirect("/")`만 실행한다. shell은 `/`, `/experiments/pixel-room`에서 공용 헤더를 숨긴다.
- [ ] **Step 4: GREEN 확인.** Step 2 명령 재실행 → PASS. 홈 HTML에 보관 픽셀룸 이미지가 출력되지 않는지도 확인한다.
- [ ] **Step 5: Commit.** 이 태스크 소스/테스트만 stage → `feat(blog): promote scroll story to home and archive pixel room`.

### Task 2: 영상 전환 실패와 접근성 보강

**Files:** `scroll-story.tsx`, `scroll-story.css`, 신규 `story-controller.ts`, `story-controller.test.ts`, `scroll-story.test.tsx`.

**Interfaces:**
- Consumes: 기존 `storyScenes`, 현재 6개 방향별 전환/3개 반복 영상의 wide/tall 파일.
- Produces: `type SceneIndex = 0 | 1 | 2`; `type StoryState = { displayed: SceneIndex; target: SceneIndex; transition: { id: number; from: SceneIndex; to: SceneIndex } | null }`.
- Produces: `reduceStory(state: StoryState, event: StoryEvent): StoryState`, `StoryEvent`는 `{type:"select";to:SceneIndex;id:number;immediate:boolean}` 또는 `{type:"complete";id:number}`. timeout/error/play 거절은 같은 complete 이벤트로 처리한다.

- [ ] **Step 1: 상태 테스트 작성.** `0→1` 선택 시 displayed 0/target 1/전환 from 0 to 1; 같은 전환 ID complete 시 displayed 1/transition null. `0→1(id1)→0(id2)` 뒤 complete(id1)는 displayed 0을 유지한다. immediate 선택은 영상 없이 target 장면으로 바뀐다. 같은 장면 재선택은 전환을 제거한다. 실제 reducer에 literal 값을 넣어 검사한다.
- [ ] **Step 2: RED 확인.** `pnpm --filter @blog-platform/blog test features/scroll-story/story-controller.test.ts` → reducer 미구현으로 FAIL.
- [ ] **Step 3: 전환 상태를 통합한다.** reducer를 기존 효과의 상태 변경 지점에 연결한다. 전환 시작마다 최대 4초 watchdog을 설정하고 완료·취소·unmount에서 해제한다. 오래된 DOM 이벤트는 ID가 다르면 무시한다. 모든 실패 경로에서 inert/전환 overlay가 해제되어 CTA를 다시 누를 수 있어야 한다.
- [ ] **Step 4: SSR 접근성 테스트를 추가하고 먼저 실패를 확인한다.** `renderToStaticMarkup(<ScrollStory />)` 결과에서 `<h1>` 1개, 나머지 제목 `<h2>` 2개, 접근 가능한 인사 제목, JS 미실행용 `/resume`·`/blog`·`/projects` 일반 링크를 검사한다. 테스트는 소스 문자열 대신 실제 생성 HTML을 검사한다.
- [ ] **Step 5: 출력·미디어를 보강한다.** main 이름을 `호조리카 소개`로 바꾸고 공통 제목 class로 h1/h2 스타일을 유지한다. noscript 일반 링크를 추가한다. 초기 media-query 판정 전/모션 줄이기에는 JPG가 보이도록 하며 비활성 동영상 preload는 `none`, 활성 영상만 로드한다. 현재 활성 링크만 포커스를 받고 문구·레이아웃은 승인안과 동일해야 한다.
- [ ] **Step 6: GREEN 및 브라우저 확인.** 위 두 test 파일 PASS. 실제 브라우저에서 전환 MP4 차단, play 거절, 빠른 0→1→0, 4초 stalled 재현 → 마지막 선택의 제목/CTA가 복구됨. reduced motion 및 탭 숨김에서 영상 정지 확인.
- [ ] **Step 7: Commit.** 태스크 파일만 stage → `fix(blog): harden home scene transitions and static fallback`.

### Task 3: 장면 주소·헤더·뒤로 가기·모바일

**Files:** 신규 `use-story-navigation.ts`, `use-story-navigation.test.ts`, `home-aware-shell.test.tsx`, `scroll-story.tsx`, `scroll-story.css`, `home-aware-shell.tsx`.

**Interfaces:**
- Consumes: Task 2 `SceneIndex`, 기존 스크롤 컨테이너 ref.
- Produces: `sceneFromHash(hash: string): SceneIndex` (동일 hook 파일 export); `useStoryNavigation(root: RefObject<HTMLElement | null>, reducedMotion: boolean): { target: SceneIndex; goTo: (index: SceneIndex) => void }`.

- [ ] **Step 1: literal 계약 테스트 작성.** `sceneFromHash("")/"#about"/"#unknown"`→0, `"#blog"`→1, `"#work"`→2. shell 테스트는 Next `usePathname`만 대체하고 실제 SSR 결과에 전달한 `<header>메뉴</header>`가 `/`·보관 경로에서 없고 `/blog`·`/projects`·`/resume`·일반 미존재 경로에서는 있는지 검사한다.
- [ ] **Step 2: RED 확인.** 두 새 test 파일을 Vitest로 실행 → hash 함수 미구현 등 예상 FAIL 확인.
- [ ] **Step 3: hook을 연결한다.** 초기 hash 장면은 즉시 복원한다. 확정한 장면을 hash로 replace하며 기존 `history.state`를 보존한다. 일반 `/`는 인사로 시작한다. 사용자 이동만 기존 휠/버튼/touch/키보드 스크롤 정책을 적용한다. ResizeObserver에서는 변경 전 장면 인덱스에 맞춰 새 높이로 즉시 정렬하고 미디어 비율 변경 시 정지 이미지부터 복원한다. effect listener를 정리한다.
- [ ] **Step 4: GREEN 확인.** 두 test 파일 PASS. `360×800`, `390×844`, `1440×900`에서 가로 넘침·CTA/챗봇 겹침 없음. 모바일 세로→가로 회전 후 동일 장면 유지. Tab/Shift+Tab/Enter/PageDown으로 탐색하고 숨겨진 장면 링크에 포커스가 가지 않는지 확인한다.
- [ ] **Step 5: 탐색 QA.** `/#blog` 직접 진입→Blog, CTA `/blog`→글 상세→뒤로 가기 두 번→Blog 장면 복원; `/#work` 새로고침→Work. 헤더/영상/버튼이 중복되지 않고 상세에서는 문서 스크롤이 정상 동작해야 한다. 각 장면을 오가도 브라우저 기록이 장면별로 늘지 않는지 확인한다.
- [ ] **Step 6: Commit.** 태스크 파일만 stage → `fix(blog): preserve home scene navigation across routes and resize`.

### Task 4: 챗봇을 유지하면서 초기 모델 다운로드 지연

**Files:** `features/pixel-room/portfolio-chat.tsx`, `features/scroll-story/scroll-story-home.tsx`, `scroll-story.css`.

**Interfaces:**
- Consumes: 기존 `PortfolioChat({diagnostics?})`, 기존 open/close/loadModel 및 RAG 계약.
- Produces: 공개 props 변경 없음. 지원되는 브라우저에서 최초 open 때만 기존 모델 로드가 시작된다.

- [ ] **Step 1: 네트워크 RED 재현.** 새 브라우저 프로필/캐시 비우기 후 홈을 열고 채팅을 열지 않는다. 현재 mount의 GGUF 요청을 기록한다. 이 브라우저 회귀 체크를 테스트로 사용하며 Node 환경에 DOM 라이브러리를 추가하지 않는다.
- [ ] **Step 2: 자동 로드 시점만 변경한다.** mount의 브라우저 지원 판정·정리 효과는 유지하고 모델 시작을 최초 open 후 effect로 이동한다. effect의 취소/중복 방지로 Strict Mode와 빠른 열기·닫기에서 다운로드가 중복되지 않게 한다. 열기 전에는 동적 kanana import도 실행하지 않는다. 챗봇은 고정 스토리 컨테이너 밖에 둔다.
- [ ] **Step 3: GREEN 브라우저 QA.** 홈 진입만으로 GGUF 요청 0개; 첫 열기에서 로드 1회; 닫았다 열면 기존 모델 유지; 지원하지 않는 환경에서는 기존 안내. 챗봇 안 스크롤이 장면을 바꾸지 않고 Escape 후 트리거에 포커스가 돌아오는지 확인한다.
- [ ] **Step 4: 회귀 검사.** `pnpm --filter @blog-platform/blog test features/pixel-room` → PASS. 장면 전환 중 열린 채팅 UI가 유지되고 상세 이동 후 모델 작업이 정리되는지 확인한다.
- [ ] **Step 5: Commit.** 태스크 파일만 stage → `perf(blog): load portfolio chat model after user opens chat`.

### Task 5: 전체 검증·문서·배포·롤백

**Files:** `apps/blog/README.md`, `apps/blog/AGENTS.md`, `features/scroll-story/README.md`, `docs/pixel-room-integration.md`, 신규 `docs/deployment-2026-11-04-scroll-story-home.md`; 필요 시 실제 관련 route 계약 문서만 갱신.

**Interfaces:**
- Consumes: Tasks 1–4 변경, 기존 Vercel `hochois-projects/blog` (`apps/blog` root) 배포 경로.
- Produces: 검증 결과·직전/신규 배포 ID·포함 파일/미디어 목록·롤백 명령을 담은 runbook.

- [ ] **Step 1: 문서를 갱신한다.** 정식 홈/시안 리디렉션/픽셀룸 보관 위치를 기록하고 AGENTS의 픽셀룸=현행 홈 문구를 새 계약으로 바꾼다. 기존 `plates-centered`만 정식 홈의 미디어 의존임을 기록한다. 다른 미완료 변경의 포함/제외 목록을 확정한다.
- [ ] **Step 2: 전체 검사 실행.** Blog `format:check`, `lint`, `typecheck`, `test`, `build`를 각각 실행 → 모든 종료 코드 0. 사용하지 않는 픽셀룸 홈 강제 검사가 남아 실패하지 않아야 한다. 현재 미커밋 SEO 작업의 통과 여부와 이번 변경을 구분해 기록한다.
- [ ] **Step 3: 운영 전 미리보기 확인.** 격리 배포에 승인된 소스와 `plates-centered` MP4 18개/JPG 6개를 포함한다. 원본 생성물·예전 plates/loop 미디어는 기존 시안 백업에 보존하되 신규 홈에서 요청하지 않는다. 실제 Vercel 보호 배포에서 데스크톱/모바일·전체 링크·영상 MIME/Range·정지 이미지·키보드·모션 줄이기·챗봇 첫 열기를 확인한다.
- [ ] **Step 4: SEO/라우트 HTTP 확인.** `/` 200/canonical `/`/noindex 없음/Person JSON-LD/기존 OG·Twitter, `/experiments/scroll-story` 308 Location `/`, 보관 페이지 200/noindex, `/blog`·`/projects`·`/resume` 200. 기존 글 35개의 R2 썸네일과 공유 OG URL이 바뀌지 않았는지도 대표 글로 확인한다.
- [ ] **Step 5: Commit 및 운영 전환.** 검증된 변경만 최종 커밋한다. 사용자 실행 요청 범위가 배포까지 포함되면 직전 배포 ID를 기록한 뒤 검증한 배포를 promote한다. 계획 승인만 받은 단계에서는 여기까지 자동 실행하지 않는다.
- [ ] **Step 6: 운영 검증·롤백 기록.** 운영 도메인에서 Step 4와 대표 장면/상세 왕복을 확인한다. 장애 시 직전 배포 URL을 `vercel promote <previous-url> --scope hochois-projects --yes`로 복원한다. DB/R2 변경이 없어 데이터 롤백은 없다. 픽셀룸 원본은 보관하며 삭제는 후속 작업이다.

## 계획 자체 검토 결과

- 사양의 화면·주소·영상·접근성·모바일·챗봇·SEO·보관·롤백을 Tasks 1–5에 배정했다.
- 모달 재구현·새 About 주소·새 영상 생성·챗봇 폴더 전체 이동은 필요하지 않아 제외했다.
- 전환 ID, hash, shell 정책은 각각 단위/SSR 테스트로 검증하며 실제 미디어·네트워크·뒤로 가기·회전은 브라우저 QA로 검증한다.
- 현재 페이지/스크롤 시안 소스 및 정식 미디어는 미커밋 상태다. 격리 환경과 배포에서 이를 누락하지 않는 것이 실행 시작 조건이다.
