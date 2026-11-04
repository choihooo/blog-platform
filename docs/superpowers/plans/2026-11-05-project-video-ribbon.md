# Hozorica Project Video Ribbon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/projects`를 실제 Hozorica 작업들이 3D 리본으로 지나간 뒤 대표 6개 그리드에 착지하는
포트폴리오로 바꾸되, 전체 11개 프로젝트의 상세 탐색을 보존한다.

**Architecture:** 기존 Next.js/React 서버 페이지와 일반 HTML 프로젝트 목록을 기본으로 유지하고,
클라이언트에서만 Three.js 연출을 점진적으로 추가한다. 데이터·순수 타임라인/기하·WebGL 리소스·HTML
탐색을 분리한다. 먼저 noindex 실험 경로에 만들고 사용자가 검토한 후 `/projects`에 연결한다.

**Tech Stack:** 기존 Next.js 16 / React 19 / TypeScript / SUIT / Vitest / CSS, 동적 import하는
`three@0.170.0` 및 개발 의존성 `@types/three@0.170.0`.

**Spec:** [2026-11-05-project-video-ribbon.md](../specs/2026-11-05-project-video-ribbon.md). 사용자
원문은 specs/references에 함께 보관했다.

## Global Constraints

- 계획만 작성한다. 아래 체크박스는 구현 시작 후 진행 상황을 표시한다.
- 기준 checkout: `/Users/choiho/.codex/worktrees/scroll-story-home/blog`, 계획 시점 HEAD `3a5a6a8`.
  원본 `/Users/choiho/coding/blog`의 미커밋 작업은 보존한다.
- 구현 시작 때 worktree/branch 상태를 확인한다. 현재 운영 변경을 포함하지 않은 원본 main을 기준으로
  새로 만들지 않는다.
- `/`, `/blog`, `/resume`, `/projects/[slug]` 내용과 기존 URL·OG·캐릭터 홈 동작은 유지한다.
- 사용자 추가 요청: 배경 아이보리 `#f5f3ed`, 본문 남색 `#172c52`, 보조 `#53647b`, 선
  `rgba(23,44,82,.18)`, 강조·포커스 블루 `#3d6ed5`를 해당 화면에만 적용한다. html/body의 저장된
  테마는 변경하지 않는다.
- SUIT 유지, Google Fonts/CDN import map/R3F/GSAP 추가 없음. Three.js는 연출이 가능한
  클라이언트에서만 동적 import한다.
- 데스크톱 여백 64px, 1024px 미만 24px. 일반 document scroll 사용. wheel/touch 이벤트로 기본
  스크롤을 막지 않는다.
- 긴 track은 WebGL 준비 후에만 900svh로 활성화한다. 준비 전/실패/모션 줄이기/saveData는 일반 정적
  목록이다.
- 대표 6개와 리본 8개의 선정/순서/자산은 Spec 표를 따른다. 전체 11개 목록의 기존 순서는 유지한다.
- 동영상 3개+이미지 5개로 시작한다. Vante 상표·샘플 영상·가짜 버튼·허구 성과를 복사하지 않는다.
- 원격 DB/R2 쓰기, 영상 생성/녹화, 비밀키·모델 커밋은 이 범위에 없다.
- 배포는 실험 결과와 최종 운영 후보를 검토한 뒤 진행한다. 이번 계획 단계에서 앱 변경·운영 배포를
  하지 않는다.

## Review Focus

1. JS 미실행/WebGL 불가/초기화 실패/context loss에서 빈 900화면 대신 전체 프로젝트 링크가 즉시
   보여야 한다 → Task 4 SSR 및 브라우저 복구 검증.
2. 중간 위치 새로고침·역스크롤·화면 회전·상세에서 뒤로 가기에도 같은 프로젝트와 진행률을 복원해야
   한다 → Task 2 순수 함수 + Task 4 브라우저 검증.
3. 영상 하나 실패·자동재생 거절·화면 밖 카드·hidden 탭에서도 링크가 살아 있고 불필요한 영상이
   재생되지 않아야 한다 → Task 3 정책 테스트 + Task 4 실제 미디어 검증.
4. 모바일 터치·키보드·모션 줄이기 사용자는 호버나 WebGL canvas 없이 모든 작업에 접근해야 한다 → Task
   4 접근 가능한 HTML + Task 5 브라우저 검증.
5. 카드 뒷면·색 공간·긴 프로젝트명·울트라와이드에서 영상 글자가 뒤집히거나 바래거나 다른 카드에
   링크가 붙지 않아야 한다 → Task 2 기하 테스트 + Task 3/5 시각 및 링크 좌표 검증.

---

## 파일 구조와 책임

기존 `features/projects/`에 `ribbon/`을 둔다. 기존 상세 블록/AutoplayVideo는 변경하지 않는다.

| 경로 (`apps/blog/` 기준)                           | 책임                                                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `features/projects/project-card-assets.ts`         | 현재 projects-page 내부 자산 맵을 분리해 기존 목록과 새 목록이 공유                      |
| `features/projects/ribbon/ribbon-data.ts`          | 대표/리본 slug 및 실제 로컬 포스터·영상, 타입                                            |
| `features/projects/ribbon/ribbon-timeline.ts`      | 진행률, 프레임 독립 보간, 카드 이탈/착지 상태, CSS 좌표의 그리드 계산; Three import 없음 |
| `features/projects/ribbon/ribbon-rail.ts`          | 참조 CatmullRom 레일, arc-length 샘플링, 카드 정점 계산; lazy renderer 전용              |
| `features/projects/ribbon/ribbon-media-policy.ts`  | 가시성/탭 상태에 따른 최대 3개 재생 대상 결정                                            |
| `features/projects/ribbon/ribbon-renderer.ts`      | Three scene/shader/texture/video/RAF 수명, HTML에 전달할 상태                            |
| `features/projects/ribbon/ribbon-stage.tsx`        | 클라이언트 초기화, 미디어 선호/실패 분기, canvas와 착지 링크                             |
| `features/projects/ribbon/project-index.tsx`       | SSR 전체 프로젝트 11개 목록과 실제 상세 링크                                             |
| `features/projects/ribbon/project-ribbon-page.tsx` | 서버 페이지 구성, Hozorica 헤더/문구/목록                                                |
| `features/projects/ribbon/project-ribbon.css`      | 스코프된 어두운 화면, sticky/정적 모드, 반응형/포커스                                    |
| `app/experiments/project-ribbon/page.tsx`          | noindex 실험 진입점                                                                      |
| `app/projects/page.tsx`                            | 사용자 실험 검토 후 새 페이지로 교체, 기존 canonical 유지                                |
| `features/navigation/home-aware-shell.tsx`         | 위 두 정확한 경로에서만 기존 공통 헤더 중복 방지                                         |
| `features/projects/README.md`                      | 자산/연출/정적 폴백/검증 절차 기록                                                       |

테스트는 대상 파일과 같은 폴더에 `*.test.ts(x)`로 둔다. 브라우저 테스트 런타임을 새로 설치하지 않고
실제 브라우저 QA 증거를 남긴다.

### Task 1: 프로젝트 자산과 대표 작업 계약

**Files:**

- Create: `apps/blog/features/projects/project-card-assets.ts`
- Modify: `apps/blog/features/projects/projects-page.tsx` (자산 맵만 추출, 기존 목록 모습 유지)
- Create/Test: `apps/blog/features/projects/ribbon/ribbon-data.ts`, `ribbon-data.test.ts`

**Interfaces:**

- Consumes: `projects: readonly ProjectCaseStudy[]`, `getProject(slug)` from `../project-data`.
- Produces: `projectCardAssets` (기존 맵의 동일 구조),
  `RibbonItem = { slug: string; title: string; href: string; poster: string; videoSrc?: string }`,
  `ribbonItems: readonly RibbonItem[]`, `featuredItems: readonly RibbonItem[]` (앞 6개).

- [ ] **Step 1: 실패할 데이터 계약 테스트를 작성한다.** `featuredItems` slug는 정확히
      `['afterimage','still','kusting','comma','geobugirin','ai-workflow']`, `ribbonItems`는 뒤에
      `forensic-agent`, `nexacro-react-poc`이 붙은 8개인지 검사한다. 각 `href`는
      `/projects/${slug}`, slug는 등록된 데이터에 존재하며 중복이 없고, 모든 포스터/영상은 `public`
      아래 실제 파일인지 확인한다. 동영상 보유 slug는 `afterimage/comma/geobugirin` 세 개인지
      검사한다.
- [ ] **Step 2: RED를 확인한다.**
      `pnpm --filter @blog-platform/blog test features/projects/ribbon/ribbon-data.test.ts` → 아직
      없는 모듈로 FAIL.
- [ ] **Step 3: 자산 맵을 추출하고 Spec의 미디어 표를 구현한다.** 목록의 자산 선택 로직/프로젝트
      순서는 그대로 둔다. 로고형과 실사형 표시 방식도 유지한다.
- [ ] **Step 4: GREEN을 확인한다.** 위 테스트 및 `features/projects/project-content.test.ts` 통과.
      기존 `/projects` 목록 스냅샷을 한 번 확인해 추출에 의한 시각 변경이 없는지 검사한다.
- [ ] **Step 5: 커밋한다.** `refactor(projects): share project media and define ribbon selection`.

### Task 2: 스크롤 타임라인과 고정 3D 레일

**Files:**

- Create/Test: `ribbon/ribbon-timeline.ts`, `ribbon-timeline.test.ts`, `ribbon-rail.ts`,
  `ribbon-rail.test.ts` under `apps/blog/features/projects/`.
- Modify: `apps/blog/package.json`, `pnpm-lock.yaml`.

**Interfaces:**

- Consumes: `ribbonItems.length` (8), 카드 인덱스 0–7.
- Produces from timeline: `readRibbonProgress(scrollY, trackTop, trackHeight, stageHeight): number`,
  `smoothProgress(current, target, deltaMs): number`,
  `getCardPhase(progress, index, pathLength): { mode: 'hidden'|'ribbon'|'grid'; amount: number }`.
- Produces from timeline:
  `getGridRects(width, height): readonly { left: number; top: number; width: number; height: number }[]`
  (6개, stage 내부 CSS px).
- Produces from rail:
  `createRibbonRail(): { length: number; sample(distance: number): { position: readonly [number,number,number]; tangent: readonly [number,number,number] } }`.
  renderer와 그리드는 같은 좌표 계산을 사용한다.

- [ ] **Step 1: 순수 함수의 실패 테스트를 작성한다.** 진행률 `(500,100,1000,200)`은 `.5`, 분모
      0/음수는 0, 범위 밖은 0/1로 제한한다. 60Hz 두 번 보간과 30Hz 한 번 보간 값은 소수점 오차
      이내로 같아야 한다. 카드 0은 p=0에서 hidden, 앞 6개는 p=1에서 grid/amount=1, 나머지 2개는
      hidden. 같은 p 입력은 접근 방향과 무관하게 같은 상태를 반환한다.
- [ ] **Step 2: 기하 실패 테스트를 작성한다.** 1440×900은 3열/2행, 390×844는 2열/3행의 6개 사각형이
      서로 겹치지 않고 stage 안에 있어야 한다. 2558×974와 844×390에도 같은 조건을 검사한다. 레일
      양끝/중간/범위 밖 샘플의 좌표는 유한하고 tangent 길이는 1, depth는 5.4–24 범위인지 검사한다.
- [ ] **Step 3: RED를 확인한다.**
      `pnpm --filter @blog-platform/blog test features/projects/ribbon/ribbon-timeline.test.ts features/projects/ribbon/ribbon-rail.test.ts`
      → 미구현 함수로 FAIL.
- [ ] **Step 4: 의존성과 순수 계산을 구현한다.**
      `pnpm --filter @blog-platform/blog add three@0.170.0` 및
      `pnpm --filter @blog-platform/blog add -D @types/three@0.170.0`. 설치된 버전의 보안/빌드
      호환성을 확인한다. Spec의 모션 수치와 원문의 레일식을 사용하되 timeline에는 Three를 import하지
      않는다. `deltaMs`는 0–50ms로 제한하며 hidden→visible 복귀 시 큰 점프를 막는다. 카드 착지
      시점은 원문의 pathLength/카드 간격 공식으로 계산한다.
- [ ] **Step 5: GREEN을 확인한다.** 두 테스트 파일과 typecheck 통과. 타임라인의 p=0/.14/.4/.63/.86/1
      및 역순 결과를 동일한 입력 계약으로 검사한다.
- [ ] **Step 6: 커밋한다.** `feat(projects): model reversible ribbon timeline and rail`.

### Task 3: WebGL 렌더러와 미디어 수명

**Files:**

- Create/Test: `apps/blog/features/projects/ribbon/ribbon-media-policy.ts`,
  `ribbon-media-policy.test.ts`.
- Create: `apps/blog/features/projects/ribbon/ribbon-renderer.ts`.

**Interfaces:**

- Consumes: Task 1 `RibbonItem[]`, Task 2 timeline/rail/grid functions.
- Produces:
  `selectPlayingSlugs(cards: readonly {slug: string; visible: boolean; priority: number; hasVideo: boolean; failed: boolean}[], active: boolean): readonly string[]`
  (priority 오름차순, 최대 3개).
- Produces:
  `mountProjectRibbon(canvas: HTMLCanvasElement, options: { items: readonly RibbonItem[]; onProgress: (p: number) => void; onFatalError: () => void }): { setTarget(p: number): void; resize(width: number, height: number): void; setActive(active: boolean): void; dispose(): void }`.

- [ ] **Step 1: 재생 정책 실패 테스트를 작성한다.** active=false는 빈 배열; 숨김/이미지/실패 카드는
      제외; 4개 이상 영상이 보이면 priority 앞 3개만; 같은 우선순위는 입력 순서를 유지한다. 정책은
      입력 배열을 바꾸지 않아야 한다.
- [ ] **Step 2: RED를 확인한다.**
      `pnpm --filter @blog-platform/blog test features/projects/ribbon/ribbon-media-policy.test.ts`
      → 미구현 함수로 FAIL.
- [ ] **Step 3: 정책과 renderer를 구현한다.** module 내부에서만 Three를 import한다. 원문의 28×3
      mesh와 양면 UV 뒤집기/cover/rounded-edge shader를 사용한다. 이미지 Texture와 VideoTexture 모두
      지원한다. 포스터를 먼저 표시하고 영상은 보이는 순간 필요 시 소스를 연결한다. play 거절/error는
      해당 포스터를 유지한다. 최대 DPR 1.5, 최대 3개 영상, 빈 화면·hidden 탭에서는 pause한다.
- [ ] **Step 4: 정리와 실패 계약을 구현한다.** `dispose()`는 두 번 호출해도 안전하게
      RAF/listener/texture/material/geometry/renderer를 정리하고 video pause→src 해제→load를
      수행한다. context loss에서 preventDefault 후 `onFatalError()`를 호출한다. constructor 실패는
      throw하여 Stage가 정적 모드로 처리하게 한다. 동작이 없는 정지 프레임에서는 불필요한
      geometry/DOM 재계산을 피한다.
- [ ] **Step 5: GREEN을 확인한다.** 미디어 정책 테스트와 typecheck 통과. 색 공간은 renderer/shader
      출력과 실제 소스 포스터를 나란히 캡처해 대비·밝기를 확인할 항목으로 Task 5에 넘긴다. 실제
      video/GL 수명 검증은 Stage가 연결되는 Task 4에서 수행한다.
- [ ] **Step 6: 커밋한다.** `feat(projects): render ribbon media with bounded playback and cleanup`.

### Task 4: SSR 탐색을 보존하는 독립 실험 페이지

**Files:**

- Create:
  `apps/blog/features/projects/ribbon/{ribbon-stage.tsx,project-index.tsx,project-ribbon-page.tsx,project-ribbon.css}`.
- Create/Test: `apps/blog/features/projects/ribbon/project-ribbon-page.test.tsx`.
- Create: `apps/blog/app/experiments/project-ribbon/page.tsx`.
- Modify/Test: `apps/blog/features/navigation/home-aware-shell.tsx`, `home-aware-shell.test.tsx`.
- Modify: `apps/blog/features/projects/README.md`.

**Interfaces:**

- Consumes: Task 1 data, Task 2 `getGridRects`, lazy-import Task 3 `mountProjectRibbon`.
- Produces: server `ProjectRibbonPage(): React.JSX.Element`, server
  `ProjectIndex(): React.JSX.Element`, client
  `RibbonStage({items}: {items: readonly RibbonItem[]}): React.JSX.Element`.
- Produces: `#project-index` anchor and noindex experimental route. `/projects` remains the existing
  page until Task 6.

- [ ] **Step 1: SSR의 실패 테스트를 작성한다.** `renderToStaticMarkup(<ProjectRibbonPage />)`에 h1이
      1개, `id="project-index"`가 1개이며 `projects`의 각 `/projects/${slug}` 링크와 이름이 모두
      존재하는지 검사한다. HOZORICA `/`, About `/resume`, Blog `/blog` 링크가 있어야 한다. SSR
      문자열에 MP4 `<source>`/`preload="auto"`가 없어야 한다. canvas 없이도 프로젝트 내용을 읽을 수
      있어야 한다.
- [ ] **Step 2: 셸 정책 실패 테스트를 추가한다.** 실험 경로에서는 공통 헤더가 숨겨지고 `/projects`,
      `/projects/kusting`, `/blog`, `/resume`, unknown에서는 기존 헤더가 남도록 기존 테이블을
      확장한다. `/projects` 숨김은 아직 추가하지 않는다.
- [ ] **Step 3: RED를 확인한다.** 두 테스트 파일을 실행해 새 페이지 부재와 실험 경로 정책 때문에
      실패하는지 확인한다.
- [ ] **Step 4: 정적 페이지와 점진적 향상을 연결한다.** 최초 SSR/첫 클라이언트 렌더는 정적
      포스터+목록으로 일치시킨다. effect에서 reducedMotion/saveData/WebGL 여부를 확인한 뒤
      renderer를 import한다. 성공 후에만 `data-enhanced`를 붙여 900svh track을 켠다. 긴 track 전환
      시 현재 `#project-index`/상세 복귀 위치가 흐트러지지 않게 처리한다. cleanup과 실패 시 해당
      속성을 제거한다. 실험 route는 robots noindex/nofollow, canonical `/projects`로 둔다.
- [ ] **Step 5: 실제 HTML 탐색/레이아웃을 연결한다.** Spec 문구와 여백/폰트를 구현한다.
      `getGridRects()`를 renderer와 공유해 p≥.86에서만 대표 6개 native Link를 카드에 일치시킨다. 그
      전에는 inert/aria-hidden으로 중복 포커스를 막는다. 항상 보이는 '모든 작업' 앵커와 하단 11개
      링크는 연출 상태와 독립적으로 작동시킨다. 포인터 이름표는 화면 밖으로 나가지 않게 제한하고
      터치에서는 생략한다.
- [ ] **Step 6: GREEN과 실제 폴백을 확인한다.** SSR/셸 테스트 통과. 브라우저에서 JS 비활성, WebGL
      초기화 거절, context loss, reduced-motion 및 saveData 각각에 긴 빈 track 없이 목록이
      표시되는지 확인한다. 동영상 하나의 요청을 실패시키고 play를 거절해도 포스터/링크가 남는지
      확인한다. 탭 숨김과 실험→상세→뒤로, 다른 페이지 이동 후 video/RAF 정리를 확인한다. 각
      시나리오의 조건과 스크린샷/로그를 README 검증표에 남긴다.
- [ ] **Step 7: 검토용 상태로 커밋한다.**
      `feat(projects): add accessible ribbon experiment with static fallback`.

### Task 5: 실험 시각·스크롤·접근성 검증 및 사용자 검토

**Files:**

- Modify as needed: `apps/blog/features/projects/ribbon/*`.
- Create: `docs/project-ribbon-review-2026-11-05.md` (실행 날짜가 다르면 실제 날짜).

**Interfaces:**

- Consumes: `/experiments/project-ribbon`, Spec 완료 기준.
- Produces: 화면 증거/측정/문제 수정과 사용자 검토 가능한 실험 링크. 운영 목록은 아직 교체하지
  않는다.

- [ ] **Step 1: 정방향/역방향 장면을 한 번에 캡처한다.** 1440×900, 1664×634, 2558×974, 390×844,
      844×390에서 p=0/.24/.5/.86/1을 확인한다. 한 번의 배치 점검에서 발견한 잘림·글자/카드 충돌을
      묶어서 수정하고 한 번 재확인한다. 900svh 길이와 초기 제목 잘림이 사용자에게 맞는지도 검토
      항목으로 명시한다.
- [ ] **Step 2: 시각 계약을 검사한다.** 근접 카드가 얇게 접히지 않는지, 뒷면에서도 실제 UI 텍스트가
      정상으로 보이는지, 영상/포스터 색과 밝기가 일치하는지 확인한다. 긴 이름 테스트 fixture
      `국제화 검증 및 다국어 배포 자동화 프로젝트`가 카드 밖으로 넘치지 않아야 한다. 최종 6개 각각을
      클릭해 올바른 `/projects/{slug}`로 이동하는지 확인한다.
- [ ] **Step 3: 입력/복원을 검사한다.** Tab/Shift+Tab/Enter만으로 전체 작업과 상세 진입, 터치에서
      hover 없는 탐색, 모든 작업 앵커 이동을 확인한다. p=.5에서 새로고침, 역스크롤, 세로↔가로 회전,
      상세 후 뒤로 가기에서 진행률과 목적지가 유지되는지 기록한다. 필요 시 Task 2 계산과 Task 4 복원
      코드를 함께 수정한다.
- [ ] **Step 4: 실제 성능을 측정한다.** 가로 데스크톱에서 연출 구간 10초 trace로 프레임 간격
      p95≤33ms 목표를 확인하고 장비/viewport를 기록한다. 탭 hidden 재생 0개, 전체 동시 재생≤3개,
      정적 모드 MP4 요청 0개를 네트워크/DOM에서 확인한다. 초과 시 DPR/미디어 해상도를 줄이고
      재측정한다. 필요 이상 고해상도 원본을 재다운로드하지 않는다.
- [ ] **Step 5: 기존 앱의 경계를 검사한다.** 홈/블로그 새로고침 네트워크에 Three chunk가 없는지,
      root 테마를 건드리지 않는지, 기존 프로젝트 상세와 `/projects` 목록이 정상인지 확인한다. 로컬
      테스트/lint/typecheck/format:check를 통과시킨다.
- [ ] **Step 6: 사용자에게 실험 링크와 핵심 화면을 보여준다.** 대표 선정/어두운 색상/제목/모바일
      길이/착지 느낌을 검토받는다. 사용자가 변경을 요청하면 이 실험 안에서 수정하고, `/projects`
      적용을 요청한 뒤에 Task 6으로 간다.
- [ ] **Step 7: 검증 및 수정 사항을 커밋한다.**
      `fix(projects): validate responsive ribbon interaction and recovery`.

### Task 6: `/projects` 교체와 운영 검증

**Files:**

- Modify: `apps/blog/app/projects/page.tsx`.
- Modify/Test: `apps/blog/features/navigation/home-aware-shell.tsx`, `home-aware-shell.test.tsx`.
- Create/Test: `apps/blog/app/projects/projects-route.test.tsx`.
- Modify: `apps/blog/AGENTS.md`, `apps/blog/features/projects/README.md`.
- Create: `docs/deployment-2026-11-05-project-ribbon.md` (실행 날짜 기준).

**Interfaces:**

- Consumes: 사용자 검토를 마친 `ProjectRibbonPage`, 기존 `ProjectsPage` (롤백용 보관).
- Produces: 기존 `/projects` URL/canonical에서 새 목록. `/projects/[slug]`와 홈의 Portfolio 링크는
  동일하다.

- [ ] **Step 1: 전환의 실패 테스트를 작성한다.** route 테스트는 `app/projects/page`의 실제 출력을
      렌더링해 새 hero 제목/전체 프로젝트 링크를 확인한다. metadata canonical은 `/projects`인지
      검사한다. 셸 테이블은 정확히 `/projects`와 실험 경로에서만 별도 공통 헤더를 숨기고
      `/projects/kusting`에는 유지하도록 바꾼다.
- [ ] **Step 2: RED를 확인한다.** route/셸 테스트가 아직 기존 목록/헤더 때문에 실패하는지 확인한다.
- [ ] **Step 3: 진입점과 셸만 교체한다.** 기존 `ProjectsPage`는 삭제하지 않는다. 헤더 판별은
      `startsWith('/projects')`가 아닌 정확한 경로 일치로 처리한다. metadata와 상세 URL을 보존하고
      README/AGENTS에 새 목록 진입점을 기록한다.
- [ ] **Step 4: 전체 필수 검증을 실행한다.**

  ```bash
  pnpm --filter @blog-platform/blog format:check
  pnpm --filter @blog-platform/blog lint
  pnpm --filter @blog-platform/blog typecheck
  pnpm --filter @blog-platform/blog test
  pnpm --filter @blog-platform/blog build
  ```

  모두 exit 0. 테스트 수는 기준 393개에 새 회귀 테스트가 더해져야 하며 기존 테스트를 삭제해 맞추지
  않는다.

- [ ] **Step 5: 검증된 소스를 커밋하고 운영 후보를 배포한다.**
      `feat(projects): promote ribbon showcase to projects index`. Blog 전용 Vercel 프로젝트
      `prj_EeQ41fKsfraKfkGhVV5CUfY5WeaJ`를 사용한다. 원본 checkout의 CMS 프로젝트 연결을 사용하지
      않는다. 배포 snapshot에 실제 `apps/blog` 소스와 `.vercel/project.json`이 존재하는지 배포 전에
      검사한다. env/개인 모델은 복사하지 않는다.
- [ ] **Step 6: 후보에서 운영 전 검증한다.** `/projects` HTTP 200/canonical/11개 링크, 자산 HTTP 200
      및 영상 Range 206, 실험 noindex, 대표 상세 6개와 홈/블로그/이력서, 실제 넓은 화면/모바일
      연출을 확인한다. build가 정적 빈 배포가 아닌 Next 앱인지와 프로젝트명이 blog인지 검사한다.
- [ ] **Step 7: 검토된 후보를 운영에 반영하고 결과를 기록한다.** 실제 배포 id/URL/검증/미측정
      항목/롤백 주소를 runbook에 남긴다. 코드 롤백은 `app/projects/page.tsx`를 기존 `ProjectsPage`로
      되돌리고 `/projects` 헤더 숨김을 제거하는 것. 운영 롤백은 이 전환 직전 배포를 promote하는 것.
      원본 checkout merge/push는 별도 통합 의도를 확인하고 진행한다.

## 자체 검토

- Spec의 브랜드/타이포/미디어/레일/시간/그리드/실패/접근성/출시 요구를 Tasks 1–6에 배치했다.
- 원문과 달라지는 지점(SUIT, Hozorica 문구, 실제 8개 미디어, SSR 11개 목록, 프레임 독립 보간, lazy
  로드)을 Spec에 명시했다.
- Review Focus 다섯 항목은 각 담당 Task의 구체적인 테스트/브라우저 조건으로 연결했다.
- Three import가 timeline이나 서버 데이터에서 새어 나가지 않도록 경계를 고정했다.
- 구현/배포는 실행하지 않았다. 최종 문구·대표 선정·모바일 연출 길이는 계획 검토 및 실험 검토 시 바꿀
  수 있는 제안이다.
