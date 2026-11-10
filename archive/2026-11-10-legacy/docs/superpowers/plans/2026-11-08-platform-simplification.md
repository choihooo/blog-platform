# 블로그 플랫폼 구조 단순화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [x]`) syntax for tracking.

**Goal:** 기존 기능·공개 URL·저장 데이터를 보존하면서 앱 사이의 직접 참조와 과거 저장소 호환 계층을
제거하고, 공유 패키지 3개를 `@blog-platform/core` 하나로 통합한다.

**Architecture:** Blog·CMS·RAG Worker의 실행·배포 경계는 유지한다. 공통 코드는 core의 용도별
subpath로 제공하고, Next.js 캐시·CMS 인증·Cloudflare binding 조립은 각 앱이 소유한다. 기존 진입점은
소비자 이전 동안만 얇은 재수출로 유지하고, 같은 동작을 검증한 뒤 제거한다.

**Tech Stack:** 현재 pnpm workspace·Turborepo·TypeScript NodeNext·Next.js App
Router·Vitest·Cloudflare Worker/D1/R2/Vectorize를 유지한다. 외부 의존성과 인프라는 추가하지 않는다.

**Spec:** 사용자가 승인한 「앱 3개 유지 + 공통 패키지 통합 + 콘텐츠·미디어 경로 정리」를 구현한다.
보존할 계약은
[콘텐츠 adapter](../../../specs/014-d1-r2-migration/contracts/content-adapter-contract.md),
[공개 라우트](../../../specs/001-repo-foundation/contracts/app-routes.md),
[미디어 action](../../../specs/008-media-upload/contracts/media-upload-action.md),
[공개 갱신](../../../specs/009-publish-workflow/contracts/public-refresh.md)이다. 이 문서의 보존
조건과 현 구현이 초기 문서의 legacy 설명보다 우선한다.

**Status:** Task 0–6 구현·검증 완료. 기존 포맷 실패와 미검증 범위는 audit에 별도 기록했다. 기존 ADR
디렉터리는 확인되지 않았으며, 이번 계획을 위해 별도 ADR 체계를 추가하지 않는다.

## Global Constraints

- 기존 기능과 공개 URL을 유지한다. UI 재설계·앱 통합·실험 페이지 삭제는 포함하지 않는다.
- D1 schema, 글 id/slug/본문/상태/날짜, R2 key/공개 URL, 콘텐츠 version-1 JSON을 변경하지 않는다.
- CMS 기본 `d1r2`, Blog의 `BLOG_CONTENT_PROXY_URL` 유무에 따른 `remote`/`d1r2` 선택을 유지한다.
- `/api/public-content`의 `{ posts, total, categories }`, 목록 8개·사이트맵 순회 100개·RSS 20개를
  유지한다.
- 관리자 인증·mutation guard·secret redaction·preview HMAC/30분 TTL·캐시/색인 정책을 유지한다.
- 발행 저장 성공과 공개 갱신 실패를 분리하고 retry token·실패 대상·기존 deploy hook 우선순위를
  유지한다.
- 임베딩 `@cf/baai/bge-m3`, 1024차원, namespace `public-v1`, sync batch 16개와 chunk id를 유지한다.
- 현재 수정·미추적 파일을 기준선에 포함한다. 사용자 작업을 stash/reset/임의 커밋하거나 HEAD로 덮지
  않는다.
- 소스는 `apply_patch`로 수정하며 생성물·비밀키·`.env`·모델 파일을 직접 편집하거나 커밋하지 않는다.
- 원격 발행·revalidate·배포·D1/R2 쓰기·Vectorize sync는 실행하지 않는다. 로컬 fixture/mock만
  사용한다.

## Review Focus

1. 저장소 장애가 빈 목록·404로 바뀌는 회귀: 정상 미존재와 D1 설정 누락·remote 5xx를 구분한다.
   Task 2.
2. 새 core 경로를 통해 Node 전용 저장소·환경변수가 브라우저/Worker로 유입되는 회귀. Task 1·3.
3. 이미지 업로드 경로·서명·인증·로컬 미디어 제공 동작이 달라지는 회귀. Task 4.
4. 검색 문서 내용·순서·chunk id가 바뀌어 기존 Vectorize 검색이 무효화되는 회귀. Task 3.
5. 이동 중 preview·rich content·홈 챗봇·뒤로 가기·색인 계약이 손상되는 회귀. Task 0·5·6.

## 목표 구조와 경계

```text
apps/
  blog/                         공개 UI·Next.js route·cache·RAG 호출
  cms/                          관리자 UI·auth·action·발행 orchestration
  rag-worker/                   Cloudflare binding·검색·동기화 HTTP handler
packages/
  core/
    src/
      content/                  editor model·직렬화·validation·공통 데이터 타입
        catalog/                프로젝트·프로필·이력서 TypeScript 원본
      storage/                  D1 adapter·R2/로컬 미디어 저장·서버 설정 로더
      seo/                      기존 seo-engine
      analytics/                기존 analytics
      search/                   corpus·chunking·검색 공통 계약
content/                        기존 site.json·taxonomy·legacy 원본 유지
scripts/                        기존 개발·migration·portfolio 명령 유지
docs/                           현재 작업 가이드·운영 기록·이 실행 계획
```

프로젝트·이력서 원본은 별도 JSON 변환 없이 `core/src/content/catalog`에 옮긴다. root `content/`의
기존 설정 원본은 유지한다. core가 앱 파일이나 workspace 밖 TypeScript를 import하게 만들지 않는다.

### 공개할 core subpath

| Import                                | 파일                           | 환경과 API                                                                        |
| ------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------- |
| `@blog-platform/core/content`         | `src/content/index.ts`         | 순수 모델·serializer·현재 editor export 전체, 공통 PostRecord/ContractResult 타입 |
| `@blog-platform/core/content/catalog` | `src/content/catalog/index.ts` | 현재 projects·profile·resume export와 타입, UI import 없음                        |
| `@blog-platform/core/seo`             | `src/seo/index.ts`             | 현재 seo-engine export 전체                                                       |
| `@blog-platform/core/analytics`       | `src/analytics/index.ts`       | 현재 analytics export 전체                                                        |
| `@blog-platform/core/search`          | `src/search/index.ts`          | corpus와 검색 계약, Web API만 사용                                                |
| `@blog-platform/core/storage`         | `src/storage/index.ts`         | Node 서버 전용 D1·미디어·설정 로더, 브라우저/Worker import 금지                   |

core 루트 `.` export와 wildcard `src/*` export는 만들지 않는다. 내부 상대 import는 NodeNext의 `.js`
규칙을 따른다. storage는 content 타입·순수 함수에 의존할 수 있으나 역방향은 금지한다. search는
content/catalog을 사용할 수 있으나 storage·Next.js·CMS auth를 참조하지 않는다.

### URL·기능 보존 표

| 표면                                                                          | 보존 내용과 기존 검증 위치                                                                                                                                  |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`, `/#about`, `/#blog`, `/#work`, `/about`, `/resume`                       | 스크롤 복원·모션 줄이기·일반 문서 fallback, `home-routes.test.tsx`, `app/about/page.test.tsx`, `features/scroll-story/*.test.*`                             |
| `/projects`, `/projects/[slug]`, `/portfolio/preview`, `/portfolio/print`     | 프로젝트 내용·상세 직접 진입·복귀·출력, `app/projects/projects-route.test.tsx`, `features/projects/project-content.test.ts`                                 |
| `/blog`, `/blog/page/[page]`, `/blog/search`, `/blog/[slug]`, taxonomy 페이지 | 본문·필터·페이지 수·공개 상태·canonical, `app/posts/[slug]/page.test.tsx`, `app/posts/[slug]/post-body-renderer.test.tsx`, `features/blog/server/*.test.ts` |
| `/blog/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/og/[slug]`                  | 공개 글만 포함·기존 이미지와 헤더, `app/generated-output-routes.test.ts`, `app/public-seo-output.test.tsx`                                                  |
| 기존 host·티스토리 ID·`/posts`·`/tags`·`/categories`·`/rss.xml`               | `next.config.mjs`와 `legacy-post-redirects.mjs`의 조건·상태·Location·rewrite 순서 그대로 유지                                                               |
| `/experiments/*`의 현재 모든 경로                                             | 보관 UI·noindex·기존 redirect 유지, 실험 폴더는 삭제하지 않음                                                                                               |
| Blog API·`/preview/[slug]`                                                    | 상태 코드·cache·HMAC·stale 거부, `features/rag/*.test.ts`, `features/blog/server/preview*.test.ts`, `app/preview/[slug]/page.test.tsx`                      |
| CMS 기존 화면·action·`/api/public-content`·`/media/[...path]`                 | 인증·rich 편집·저장·발행·분석·미디어 결과 유지, `app/actions/editor-actions.test.ts`, editor/auth/media/analytics 기존 suite                                |
| Worker `/health`, `/search`, `/sync`, `/__local/d1`                           | method·인증·로컬 제한·batch/revision·최신 발행 상태 확인, `apps/rag-worker/src/index.test.ts`                                                               |

## 단계와 추정 시간

시간은 숙련 개발자 1명과 AI의 집중 작업 기준이며 배포·원격 데이터 변경은 제외한다. P30/P50/P80은
통계적으로 보정되지 않은 계획 추정치다. Task 0에서 기준선과 환경 제약을 확인한 뒤 다시 추정한다.

| 단계           | Task    |        P50 | 완료 후 상태                                        |
| -------------- | ------- | ---------: | --------------------------------------------------- |
| 기준선         | 0       |      3시간 | 기능·URL·실패·되돌릴 지점이 기록됨                  |
| 패키지 통합    | 1       |      3시간 | core 사용, 기존 앱 동작 유지                        |
| 콘텐츠 경계    | 2       |      4시간 | Blog → CMS 내부 import 제거                         |
| 검색 경계      | 3       |      3시간 | Worker → Blog 내부 import 제거                      |
| 미디어 경로    | 4       |      4시간 | R2·로컬 업로드가 repository 호환 계층을 거치지 않음 |
| 챗봇 위치      | 5       |      1시간 | 현재 홈 기능과 보관 픽셀룸 코드가 분리됨            |
| 제거·종합 검증 | 6       |      2시간 | workspace 4개·전체 회귀 확인·문서 정합성 확보       |
| **전체**       | **0–6** | **20시간** | **P30 12시간 / P50 20시간 / P80 36시간**            |

순서는 `0 → 1 → 2 → 3 → 4 → 5 → 6`이다. 각 단계의 검사·review를 통과하기 전 다음 단계의 삭제를
시작하지 않는다. 단계별 변경을 독립 diff/커밋 후보로 유지하며, 기존 사용자 변경을 포함해 커밋하지
않는다. 환경 제약·기존 실패가 있으면 완료 표시에 미검증 항목을 함께 남긴다.

### 단계별 실행할 검사 명령

Task 1 이후 core의 공통 검사는 다음과 같다. core의 scripts는 기존 공유 패키지와 같은 이름으로
만든다.

```sh
pnpm --filter @blog-platform/core format:check
pnpm --filter @blog-platform/core build
pnpm --filter @blog-platform/core lint
pnpm --filter @blog-platform/core typecheck
pnpm --filter @blog-platform/core test
```

각 단계에서 언급한 앱 필수 검사는 해당 앱 AGENTS의 전체 명령을 뜻한다. 아래는 새 경계와 보존 조건을
집중 검사할 명령이다. 모두 종료 코드 0과 해당 테스트 통과가 기대 결과다. 새 경계 테스트를 먼저
추가한 단계에서는 명시한 이전 구조의 참조 때문에 실패하는지 확인한 뒤 이동을 시작한다.

| Task | 집중 검사 명령                                                                                                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | `pnpm --filter @blog-platform/blog exec vitest run app/url-preservation.test.ts app/api-contract-preservation.test.ts features/rag/corpus-preservation.test.ts` |
| 1    | `pnpm --filter @blog-platform/core exec vitest run src/module-boundaries.test.ts src/content src/seo src/analytics`                                             |
| 2    | `pnpm --filter @blog-platform/core exec vitest run src/module-boundaries.test.ts src/storage/d1-content-store.test.ts src/storage/site-config.test.ts`          |
| 2    | `pnpm --filter @blog-platform/blog exec vitest run features/blog/server app/preview app/generated-output-routes.test.ts`                                        |
| 3    | `pnpm --filter @blog-platform/core exec vitest run src/module-boundaries.test.ts src/search/corpus-preservation.test.ts`                                        |
| 3    | `pnpm --filter @blog-platform/rag-worker test`                                                                                                                  |
| 4    | `pnpm --filter @blog-platform/core exec vitest run src/storage/media-store.test.ts`                                                                             |
| 4    | `pnpm --filter @blog-platform/cms exec vitest run app/actions/editor-actions.test.ts components/editor lib/editor lib/auth app/media`                           |
| 5    | `pnpm --filter @blog-platform/blog exec vitest run features/chat features/pixel-room app/home-routes.test.tsx features/scroll-story`                            |
| 6    | `pnpm --filter @blog-platform/core exec vitest run src/module-boundaries.test.ts` 후 root 검사 전체                                                             |

---

### Task 0: 현재 작업본의 기능·URL·검증 기준선 확보

**Files:**

- Create: `docs/audits/2026-11-08-platform-simplification.md`
- Create: `apps/blog/app/url-preservation.test.ts`
- Create: `apps/blog/app/api-contract-preservation.test.ts`
- Create: `apps/blog/features/rag/corpus-preservation.test.ts`
- Read: `apps/blog/next.config.mjs`, `apps/blog/features/blog/data/legacy-post-redirects.mjs`, 기존
  검증 표의 tests
- Read: `specs/013-security-hardening/contracts/*`, `specs/014-d1-r2-migration/contracts/*`

**Interfaces:** 변경 없음. 이후 단계가 비교할 입력은 공개/초안 글, rich content, taxonomy, 고정
시각, 프로젝트·이력서 데이터다. 새 baseline fixture는 현재 구현에서 만들어 검토하고, 이후 단계에서
기대값을 다시 생성해 차이를 덮지 않는다.

- [x] `git status --short`와 관련 diff·미추적 파일을 확인해 audit에 기준 시점과 보존할 작업을
      기록한다. 실행 시 `using-git-worktrees` 절차를 따르되 HEAD만 복제해 현재 작업본을 잃지 않게
      한다. 비밀값 없는 필요한 diff·파일만 검토해 옮기며 원래 작업본은 수정하지 않는다.
- [x] 현재 redirect/rewrite 전체 배열을 고정 fixture로 보존하는 `url-preservation.test.ts`를
      추가한다. `redirects_and_rewrites_preserve_conditions_order_status_and_destination`은
      host/query 조건·순서·목적지와 티스토리 매핑을 비교한다. 기존 정상 redirect와 알 수 없는
      slug/ID의 404를 함께 기록한다.
- [x] `api-contract-preservation.test.ts`에 mock 저장소를 사용한
      `preview_rejects_expired_stale_and_other_slug_tokens`와
      `public_surfaces_never_expose_draft_or_archived_content`를 추가한다. 기존 preview/SEO tests의
      fixture를 재사용하고 응답 status·cache·robots·canonical을 비교한다.
- [x] `corpus-preservation.test.ts`에서 고정 글·현재 정적 catalog의 문서 순서, text/url/taxonomy,
      `embeddingText`와 `chunkDocuments`의 전체 id 배열을 고정한다.
      `corpus_move_preserves_chunk_ids` 라는 동일 사례를 Task 3에서 옮겨 재사용한다. 실제
      임베딩·원격 sync는 호출하지 않는다.
- [x] 기존 동작에 대한 특성 검사는 현재 코드에서 통과시킨다. 기능 변경이 없는 기준선 작업이므로
      일부러 현재 동작을 깨뜨리는 실패 테스트를 만들지 않는다. 각 앱·패키지 하위 AGENTS의 필수
      검사와 아래 종합 명령을 실행해 기존 실패·실행 불가·실행 시간을 audit에 구분한다.

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

**Gate / rollback:** 기존 실패를 이번 작업의 통과로 간주하지 않는다. 계획과 관계없는 실패는
기록하고, 이번 변경의 회귀를 판별할 수 없으면 해당 단계 착수 전에 원인을 좁힌다. 기준선 테스트·audit
추가만 있으므로 해당 파일의 이번 diff만 되돌릴 수 있다. Task 0 결과에 따라 남은 P30/P50/P80을
재추정한다.

### Task 1: core 패키지 생성과 기존 공유 코드의 동작 없는 이동

**Files:**

- Create: `packages/core/{package.json,tsconfig.json,vitest.config.ts,README.md,AGENTS.md}`
- Move: `packages/editor/src/*` → `packages/core/src/content/*`
- Move: `packages/seo-engine/src/*` → `packages/core/src/seo/*`
- Move: `packages/analytics/src/*` → `packages/core/src/analytics/*`
- Create: `packages/core/src/module-boundaries.test.ts`
- Modify: 세 기존 패키지의 `src/index.ts`, `package.json`, 세 앱의 `package.json`과 import,
  `pnpm-lock.yaml`
- Read: `turbo.json`, `tsconfig.base.json`, 기존 패키지 README·AGENTS

**Interfaces:** 기존 export의 함수 이름·인자·반환 타입을 그대로 유지하며 import 주소만 앞의 subpath
표대로 바꾼다. `loadPostContent`, `serializePostContent`, `evaluateSeo`, `generatePageMetadata`,
`createBlogEvent` 등의 구현 변경과 이름 정리는 이 단계에 섞지 않는다.

- [x] `module-boundaries.test.ts`에 `pure_entries_do_not_reach_storage_or_node_builtins`와
      `core_never_imports_apps`를 작성한다. 실제 import graph를 검사해 content/seo/analytics가
      storage·`node:*`·앱 소스에 닿지 않는지 확인한다. core 파일이 없는 초기 상태의 실패를 확인한다.
- [x] core를 기존 TypeScript 빌드 방식으로 추가하고 순수 코드·테스트를 이동한다. 현재
      markdown-it·parse5와 해당 타입/테스트 의존성만 이전한다. ESM `.js`, declaration 출력과
      subpath별 `types/default`를 맞춘다.
- [x] 기존 세 패키지는 core 해당 subpath를 재수출하는 임시 wrapper로 바꾼다. core → 기존 패키지
      역참조는 금지한다. 앱 소비자는 core로 이전하되 아직 scripts가 쓰는 이전 경로는 wrapper로
      연결한다. `packages/editor/src/post-content` 같은 직접 소스 import도 이 단계에서
      core/content로 바꾸거나 소비자 이전 시점까지 같은 export의 얇은 재수출 파일을 둔다. 중간
      단계에서 깨진 import를 남기지 않는다.
- [x] core의 format/lint/typecheck/test/build, 영향받는 Blog·CMS의 테스트와 빌드를 실행한다. 함수
      fixture와 rich-content round-trip·SEO output·analytics 이벤트가 기준선과 같은지 확인한다.
- [x] core README/AGENTS에 subpath와 환경 경계를 기록하고 독립 review 가능한 diff로 정리한다.

**Gate / rollback:** 이전 패키지는 아직 제거하지 않는다. build 순서는 core → wrapper/app이며 같은
코드를 두 벌 유지하지 않는다. 실패하면 이 단계의 import·manifest·lockfile·이동 diff를 함께 되돌린다.

### Task 2: 공통 콘텐츠 저장소를 이동해 Blog → CMS 참조 제거

**Files:**

- Move: `apps/cms/lib/content-adapter/content-adapter.interface.ts` →
  `packages/core/src/content/records.ts`
- Move: `apps/cms/lib/content-adapter/d1-r2-adapter.ts` →
  `packages/core/src/storage/d1-content-store.ts`
- Move tests: `apps/cms/lib/content-adapter/d1-r2-adapter.test.ts` →
  `packages/core/src/storage/d1-content-store.test.ts`
- Create: `packages/core/src/storage/{index.ts,site-config.ts,site-config.test.ts}`
- Modify: `apps/cms/lib/{site-config.ts,content-adapter/content-adapter.ts}`
- Create: `apps/blog/shared/config/site-config.ts`
- Modify:
  `apps/blog/features/blog/server/{content-source.ts,content-source-d1r2.ts,content-source-remote.ts,content-source-types.ts,content-source-utils.ts,preview.ts}`
- Modify: `apps/cms/lib/site-config.test.ts`,
  `scripts/migration/{import-tistory.ts,convert-mdx-content-to-editor-json.ts}`
- Modify: `packages/core/src/module-boundaries.test.ts`, 관련 참조와 mock

**Interfaces:** `PostRecord`, `ContractResult<T>`, `ContentAdapter`는 `core/content`로 옮긴다.
`createD1R2ContentAdapter(): ContentAdapter`는 `core/storage`에서 제공하고 기존 CRUD 메서드는
유지한다. 설정 로더는 다음 계약으로 만든다.

```ts
type SiteConfigLoadOptions = {
  root?: string;
  bundled: unknown;
};
function loadSiteConfig(options: SiteConfigLoadOptions): Promise<SiteConfig>;
```

앱의 `loadSiteConfig(root?: string): Promise<SiteConfig>` wrapper는 기존 `content/site.json`을 정적
import해 `bundled`로 전달한다. 명시적 root 읽기 실패 시 default, 암시적 root 읽기 실패 시 bundled
fallback이라는 현 동작과 환경변수 우선순위를 유지한다. Next.js tracing 설정도 유지한다.

- [x] `module-boundaries.test.ts`에 `blog_never_imports_cms_internals`를 추가하고 현재 코드에서
      실패를 확인한다. 기존 content-source 테스트를 확장해
      `remote_and_d1_preserve_rich_content_and_totals`,
      `storage_errors_never_become_empty_success_or_404`를 고정한다.
- [x] 공통 타입·D1 구현을 이동하고 CMS의 기존 factory는 같은 core factory를 부르는 wrapper로
      유지한다. D1 binding / 로컬 proxy / Cloudflare REST 선택, SQL, 정렬, 에러 mapping을 바꾸지
      않는다.
- [x] core 설정 로더를 주입 가능한 bundled 입력으로 만들고 Blog·CMS 각각의 작은 wrapper를 연결한다.
      파일 누락·명시적 root·번들 fallback을 테스트한다. core가 root JSON이나 앱의 모듈 위치를 추정해
      import하지 않도록 한다.
- [x] Blog의 CMS 참조를 core와 Blog 설정 wrapper로 바꾼다. `unstable_cache`, cache tag,
      `revalidatePath`는 Blog에 남긴다. remote HTTP 구현·환경변수·CI의 공개 proxy 사용은 유지한다.
- [x] core 검사와 Blog·CMS 필수 검사를 실행한다. D1/remote mock 각각에서 정상 미존재·5xx·설정 누락,
      published-only·pagination·preview·본문·목록·RSS/사이트맵을 검증한다. migration scripts는
      import/type 해석을 확인하되 실행하지 않는다.

**Gate / rollback:** Blog의 CMS import는 0개, storage의 Next.js import는 0개다. 원격 설정 변경이나
데이터 변환이 없어 해당 단계 코드와 lockfile만 되돌리면 된다. 기존 CMS factory wrapper는 남겨도
되지만 Blog가 그 wrapper를 사용해서는 안 된다.

### Task 3: 공통 catalog·검색 계약을 이동해 Worker → Blog 참조 제거

**Files:**

- Move: `apps/blog/features/projects/{project-data.ts,project-types.ts,data/*.ts}` →
  `packages/core/src/content/catalog/projects/`의 같은 상대 구조
- Move: `apps/blog/features/resume/{profile-data.ts,resume-data.ts}` →
  `packages/core/src/content/catalog/`
- Create: `packages/core/src/content/catalog/index.ts`
- Move:
  `apps/blog/features/rag/{corpus.ts,corpus-types.ts,corpus-documents.ts,corpus-chunking.ts,corpus-matching.ts,contracts.ts,identity.ts}`
  → `packages/core/src/search/`
- Create: `packages/core/src/search/index.ts`
- Move test: `apps/blog/features/rag/corpus-preservation.test.ts` →
  `packages/core/src/search/corpus-preservation.test.ts`
- Modify: `apps/rag-worker/src/{index.ts,index.test.ts}`, Blog의 catalog/search 소비자·테스트
- Modify: `scripts/portfolio/export-projects-json.ts`,
  `scripts/migration/{recover-published-content.ts,content-recovery.ts}`
- Modify: `packages/core/src/module-boundaries.test.ts`

**Interfaces:** search는 기존 `staticDocuments(): RagDocument[]`,
`postDocument(row: PublicPostRow): RagDocument`,
`chunkDocuments(documents: RagDocument[]): Promise<RagChunk[]>`,
`embeddingText(document: RagDocument): string`, `currentMatches`와 contracts/identity의 현재 전체
export를 그대로 제공한다. `projects`, `profile`, `workExperiences`, `activities`, `awards`,
`skillGroups`도 보존한다. Blog의 검색 응답 orchestration·대화 상태·HTTP 호출은 `features/rag`에
남긴다.

- [x] `worker_never_imports_blog_internals`와 `search_entry_is_worker_compatible` 경계 검사를
      추가하고 현재 참조에 대한 실패를 확인한다. Task 0의 corpus fixture를 읽어 전체 문서·chunk id
      동등성을 비교한다. Node/Web API의 hash 실행 환경 차이를 fixture 갱신으로 숨기지 않는다.
- [x] catalog의 TypeScript 데이터·타입을 원문 그대로 이동한다. 이미지·영상 URL과 배열 순서는 바꾸지
      않는다. Blog의 기존 UI 옆 데이터 파일은 전환 중 재수출만 할 수 있고 원본은 core에 하나만 둔다.
- [x] 순수 검색 모듈을 이동하고 상대 경로를 core/content/catalog으로 연결한다. 현재
      `contracts → identity     → profile` 의존까지 옮겨 숨은 앱 참조를 제거한다. 패키지 `src`를
      직접 가리키는 editor import도 없앤다.
- [x] Worker와 Blog·portfolio script를 core subpath로 연결한다. Worker의 DB query·인증·API
      payload·최신 발행 상태 재조회·sync revision 계산은 변경하지 않는다.
- [x] core 테스트·Blog 필수 검사와 Worker의 typegen/typecheck/test/build를 실행한다. Worker build는
      `wrangler deploy --dry-run`만 사용한다. corpus와 chunk id 일치·고정 visitor 질의·비공개 검색
      배제를 확인하고 Worker bundle에 Node fs 또는 Next.js가 유입되지 않았는지 확인한다.

**Gate / rollback:** Worker의 Blog import 0개, core의 앱 import 0개이며 chunk id 배열이 완전히 같다.
같지 않으면 원격 index를 재생성하지 말고 이동의 차이를 수정한다. 이 단계 변경만 되돌려 복원할 수
있다.

### Task 4: 미디어 저장을 repository adapter에서 분리

**Files:**

- Create: `packages/core/src/storage/{media-store.ts,media-store.test.ts}`
- Modify: `apps/cms/app/actions/{editor-actions.ts,editor-actions.test.ts}`
- Modify: `apps/cms/lib/editor/{editor-media.ts,editor-media.test.ts}`
- Modify: `apps/cms/lib/auth/{index.ts,protected-content-operations.ts}`와 해당 tests
- Read/reuse: `apps/cms/lib/editor/{media-file.ts,media-path.ts}`,
  `apps/cms/lib/content-adapter/{runtime-adapter.ts,local-adapter.ts,paths.ts,repository-error.ts}`
- Keep/Test: `apps/cms/app/media/[...path]/{route.ts,route.test.ts}`와 editor 미디어 flow/failure
  tests
- Modify: `specs/008-media-upload/contracts/media-upload-action.md`

**Interfaces:** 새 저장 계약은 core의 `ContractResult`로 통일한다. 환경변수 선택과 R2 서명은 현재
구현을 재사용하고, 이미지 decode·2MB 검증·webp 정규화·공개 참조 조립은 현재 CMS 계층을 유지한다.

```ts
type MediaWrite = { path: string; contentBase64: string; expectedSha?: string };
type StoredMedia = { path: string; publicPath: string; sha: string; sizeBytes: number };
type MediaStore = { put(input: MediaWrite): Promise<ContractResult<StoredMedia>> };
function createMediaStore(root: string): MediaStore;
```

`createMediaStore`는 현행과 같이 development이고 R2 설정이 없으면 로컬 파일 저장, 그 외는 R2 저장을
선택한다. production에서 설정 누락을 로컬 성공으로 바꾸지 않는다. 공개 action의
`UploadEditorMediaResult`는 필드·오류 코드·retryable·message를 포함해 기존 계약을 유지한다.

- [x] 새 store가 없는 상태에서 R2 request 경로·서명, 로컬 경로·동일 파일 재업로드·`expectedSha`
      충돌, 경로 traversal 거부와 설정 누락 실패를 검증하는 `media-store.test.ts`의 실패를 확인한다.
- [x] R2 PUT과 로컬 `public/media` 저장 로직만 추출한다. content CRUD·GitHub token·D1을 구성할
      필요가 없는 `MediaStore`를 구현한다. hash·R2 key·public URL·캐시 헤더·파일 권한 규칙을
      보존한다.
- [x] `uploadEditorMediaAction`은 기존 `evaluateAccess`/`guardMutation`으로 store.put을 감싼다.
      `unauthorized_media_upload_never_calls_store`에서 인증 거부 시 파일/네트워크 쓰기 0회를
      단언한다. guard를 줄이거나 새 인증 체계를 만들지 않는다.
- [x] store 실패를 기존 `UploadMediaCode`로 변환하고, 업로드 성공 시에만 본문/표지 참조를 반환한다.
      `commitId` 같은 기존 선택 필드는 의미 없이 만들어 넣지 않는다. 실패 문서·secret redaction과
      업로드 뒤 저장 필요 상태를 보존한다.
- [x] core 검사·CMS 필수 검사와 media action/UI failure/local route tests를 실행한다. 실제 R2 대신
      mock, 로컬 쓰기는 임시 디렉터리를 사용한다. 계약 문서의 legacy 경로 설명과 실제 R2 절대 URL
      허용을 현재 동작에 맞게 함께 명시한다.

**Gate / rollback:** 실서비스 호출부의 `createRuntimeContentAdapter`·`commitMedia` 의존이 0개다.
파일·GitHub CRUD 삭제는 Task 6까지 미룬다. 새 store/action 변경만 되돌리면 이전 업로드 경로로
복귀한다.

### Task 5: 현재 챗봇을 보관 픽셀룸 폴더에서 분리

**Files:**

- Move: `apps/blog/features/pixel-room/portfolio-chat*.{ts,tsx}`, `kanana*.{ts,json}`,
  `chat-{model,answer}.{ts,tsx}` → `apps/blog/features/chat/`
- Move tests: `kanana-load.test.ts`, `kanana-model-source.test.ts`, `chat-answer.test.tsx` → 같은
  chat 폴더
- Create: `apps/blog/features/chat/chat.css`, `apps/blog/features/chat/chat-entrypoints.test.tsx`
- Modify: `apps/blog/features/pixel-room/{pixel-room.tsx,pixel-room.css}`
- Modify: `apps/blog/features/scroll-story/scroll-story-home.tsx`와 실제 chat import 소비자
- Keep: `apps/blog/scripts/prepare-wllama.mjs`, 기존 모델 설정·WASM public URL·실험 route

**Interfaces:** `PortfolioChat`의 현재 props와 사용법을 그대로 유지한다. CSS는 chat 클래스만 원래
순서·선택자·변수 범위를 보존해 추출하고 홈과 픽셀룸 양쪽이 chat 진입점을 사용한다.

- [x] `chat-entrypoints.test.tsx`에 `home_and_pixel_room_share_chat_without_auto_loading_model`을
      추가한다. 두 진입점에서 열린 뒤에만 런타임 다운로드를 시작하고, 닫기·재열기·unmount cleanup을
      보존한다.
- [x] chat 파일·테스트·CSS를 이동한다. 백업 시안과 함께 삭제하거나 모델 크기·양자화·로딩 정책을
      바꾸지 않는다. 픽셀룸 전용 레이아웃·배경 에셋은 그대로 둔다.
- [x] Blog 필수 검사와 홈/픽셀룸/kanana tests를 실행한다. 현재 로컬 페이지에서 모바일·데스크톱 챗봇,
      CSS 순서, hash 복귀·모션 줄이기를 확인한다. 대용량 모델의 실제 생성 검증 가능 여부를 별도
      기록한다.

**Gate / rollback:** 홈이 pixel-room CSS와 chat 내부 파일을 직접 import하지 않는다. 기존 실험 URL은
여전히 동작한다. 이 단계의 이동·CSS import만 함께 되돌린다.

### Task 6: 호환 wrapper 제거·문서 정합성·전체 검증

**Files:**

- Remove after references=0: `packages/{editor,seo-engine,analytics}/`의 wrapper·manifest·설정
- Remove after references=0: CMS의 `github-adapter.ts`, `github-app-token.ts`,
  `d1-repository-adapter.ts`, `runtime-adapter.ts`와 더 이상 쓰지 않는 legacy content CRUD/전용
  fixture
- Modify/retain by consumer: `local-adapter.ts`, `types.ts`, `paths.ts`, `repository-error.ts`,
  `commit-intent.ts`, `protected-content-operations.ts`, `content-adapter/index.ts`
- Modify: `package.json`, 세 앱 `package.json`, `pnpm-lock.yaml`, `turbo.json`,
  `.github/workflows/ci.yml`
- Modify: `README.md`, 각 앱 README/AGENTS, `packages/AGENTS.md`, core README/AGENTS,
  `docs/development-guide.md`, `specs/001-repo-foundation/contracts/workspace-commands.md`,
  `specs/014-d1-r2-migration/contracts/content-adapter-contract.md`
- Update: `docs/audits/2026-11-08-platform-simplification.md`, 이 계획의 체크박스

**Interfaces:** 최종 workspace는 Blog·CMS·Worker·core의 4개다. 기존 root 명령·개발 port·
환경변수명과 storage/공개 API의 요청·응답 형태는 유지한다.

- [x] 전체 소스·tests·scripts·docs의 import를 검색해 이전 패키지와 앱 내부를 가리키는 참조를 core
      subpath로 옮긴다. root script가 core를 import하면 root devDependency에 workspace 참조를
      추가한다. 테스트에서만 남은 미사용 GitHub/file CRUD는 유지용 fixture와 함께 제거하고 인증·경로
      안전성의 유용한 사례는 새 store/action tests로 옮긴다. 소비자가 남은 타입·redaction은 책임에
      맞는 곳에 둔다.
- [x] 테스트 import·mock 갱신 후 wrapper와 이전 패키지 설정을 제거한다. `createContentAdapter`의
      무효한 legacy mode 인자는 전체 소비자를 확인해 내부 API에서 제거한다. 외부 payload의
      `repository`/`sha`/retry token 호환 이름은 별도 작업까지 유지한다.
- [x] lockfile을 정상 pnpm 절차로 갱신하고 `pnpm install --frozen-lockfile`,
      `pnpm -r list --depth -1`로 root 외 workspace 4개를 확인한다. Turbo의 core 선행 build를
      유지한다. CI의 remote build와 30개 globalEnv를 일괄 삭제하지 않고 소비자가 없어진 GitHub
      content-write 변수만 근거와 함께 정리한다. OAuth 변수는 유지한다.
- [x] README를 현재 구성으로 갱신하고 editor/SEO/analytics AGENTS 규칙을 core의 적절한 범위로
      인계한다. root AGENTS는 짧게 유지한다. 이전 설계·migration rollback 계약은 이력으로 보존하되,
      현재는 legacy runtime switch로 복귀할 수 없다는 점과 새 코드 rollback 방법을 주석으로
      명시한다.
- [x] core·Blog·CMS의 format/lint/typecheck/test/build, Worker의 typegen/typecheck/test/build,
      root의 format/lint/typecheck/test/build를 실행한다. 같은 성과물의 검사를 이유 없이 반복하지
      않고, 마지막 수정 후 영향받은 검사를 재실행한다. 미실행은 통과로 처리하지 않는다.
- [x] 관련 `claude-seo-for-codex` 스킬을 읽고 현재 로컬/preview에서 보존 표의 대표 페이지를
      검사한다. `/`, `/about`, `/blog`, 공개 상세, taxonomy, `/projects`와 상세, `/resume`,
      RSS·sitemap·robots·OG와 의도한 noindex를 확인한다. D1과 remote는 mock에 더해 가능한 로컬
      구성에서 확인한다. 운영 사이트를 미배포 변경의 증거로 쓰지 않는다. 브라우저 조작에는
      `aside-browser` 스킬을 적용한다.
- [x] audit에 단계별 변경·명령·실행 시간·결과·기존 실패·미검증·남은 위험을 기록한다. URL·본문·검색
      문서·업로드의 확인된 회귀가 남아 있으면 완료로 처리하지 않는다.

**Gate / rollback:** 이전 workspace 참조 0개·앱 간 source import 0개·core → apps import 0개이며,
workspace 4개로 검증할 수 있다. schema·본문·R2 key·chunk id를 바꾸지 않으므로 단계별 diff의
역적용으로 코드를 되돌린다. 기존 작업까지 지우는 `git reset --hard`는 쓰지 않는다. 실제 배포는 이번
완료 조건에 포함하지 않는다. 별도 명시 요청 시 runbook id·코드 rollback 지점·데이터 변경 없음·재실행
방법을 기록하고 배포한다.

## 이번에 보류하는 판단

- Blog/CMS의 단일 Next.js 앱 통합, RAG/브라우저 모델 폐지, 실험 URL/에셋 삭제.
- remote 콘텐츠 소스 삭제, CI용 공개 proxy 폐지, 기존 환경변수명 변경.
- deploy hook에서 revalidate 우선으로 바꾸는 운영 변경, preview token/result payload 개편.
- D1 schema 변경, 본문 변환·복구, 이미지 재업로드, Vectorize 재구축.

## 계획 자기 검토

- [x] 승인 범위를 Task 0–6에 대응시키고 기능 삭제·URL 변경·원본 데이터 변경을 제외했다.
- [x] 앱 내부 직접 import와 legacy 미디어 경로에 이동 대상·소비자·검증·rollback을 배정했다.
- [x] core export·환경 경계, site-config 주입, media-store signature를 태스크 간 일치시켰다.
- [x] Review Focus의 5개 항목에 담당 Task와 구체적인 검증을 배정했다.
- [x] 기존 테스트를 재사용하고 단순 이동의 구현을 따라 쓰는 테스트와 새 provider framework를
      배제했다.
- [x] P30/P50/P80을 실측·보장으로 취급하지 않고 Task 0 이후 재추정과 미검증 처리 방법을 명시했다.

**구현 방식:** 단계 간 의존성이 많아 같은 담당이 이 체크리스트에 따라 순차 실행하는 방식을 권한다.
사용자가 이 채팅에서 순차 실행을 승인해 Task 0–6을 완료했다. 원본 작업본은 보존했으며 변경은 연결된
격리 작업공간에 남긴다. 실제 배포·원격 데이터 변경·merge/push는 수행하지 않았다.
