# CMS Feature Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [x]`) syntax for tracking.

**Goal:** CMS의 URL·권한·문서·발행 동작을 유지하면서 기능별 책임과 클라이언트/서버 경계를 명확하게
한다.

**Architecture:** app은 라우트와 Server Action composition을 맡고
editor/posts/taxonomy/analytics/public-content는 기능을 소유한다. 기존 서버 workflow를 재사용하고
클라이언트 제어를 hook으로 분리한다. capability prop으로 action을 전달하여 feature에서 app으로의
역방향 import를 제거한다.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tiptap, NextAuth, Vitest, Testing Library,
core/content·storage·analytics.

**Spec:** [CMS·Worker 경계 명세](../specs/2026-11-09-cms-worker-boundaries.md)

## Global Constraints

- 새 의존성은 추가하지 않는다.
- native editor document version 1과 중첩 rich content를 유지한다.
- Preview HMAC은 slug/contentSha/만료를 결합하고 만료 시간은 30분이다.
- retry는 재저장·재발행 없이 공개 갱신만 수행한다.
- `/api/public-content`의 `public, s-maxage=60, stale-while-revalidate=300`를 유지한다.
- 원격 발행·업로드·배포·데이터 변경은 이 계획의 검증에 포함하지 않는다.

## Review Focus

- 편집 중 저장 응답이 늦게 도착하면 더 최신 입력과 백업이 사라지지 않아야 한다. Task 4.
- 발행 저장 후 공개 갱신 실패/재시도는 저장을 중복하지 않아야 한다. Task 3·4.
- 이미지 선택 위치가 변경되거나 업로드가 실패하면 다른 노드/커버가 바뀌지 않아야 한다. Task 5.
- 카테고리의 자식/연결 글과 만료된 세션은 삭제·수정을 막아야 한다. Task 6.
- 날짜 경계·provider 오류·비공개 글은 통계와 공개 API에서 각각 기존 계약을 유지해야 한다. Task 7·8.

---

## 파일 배치와 의존성

| 현재                                                                                       | 목표                                                            | 책임                                    |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | --------------------------------------- |
| `components/editor/*`, `lib/editor/*`                                                      | `features/editor/{components,hooks,model,server}`               | 편집 feature. 아래 posts/공유 항목 제외 |
| `components/posts/*`, editor-loader의 목록/요약                                            | `features/posts/{components,model,server}`                      | 목록과 운영자 요약 조회                 |
| `components/settings/category-manager.tsx`, taxonomy action 본문, settings taxonomy loader | `features/taxonomy/{components,hooks,model,server}`             | 분류 관리                               |
| `components/analytics/*`, `lib/analytics/*`                                                | `features/analytics/{components,model,server}`                  | 통계 조회와 표현                        |
| `components/ui/*`, `lib/site-config.ts`, `lib/editor/root.ts`                              | `shared/ui/*`, `shared/server/{site-config,repository-root}.ts` | 실제 공유 UI·서버 설정                  |
| `app/api/public-content/route.ts` 조회 본문                                                | `features/public-content/server/query.ts`                       | 공개 조회 계약                          |
| `app/actions/*`, `app/**/page.tsx`, API/media routes                                       | 유지                                                            | Next 진입점·인증·캐시·capability 조립   |

기존 auth/security/migration 및 shell/auth 컴포넌트는 유지한다. 이전 barrel은 소비자를 옮기는 동안만
호환 re-export를 허용하고 Task 8에서 제거한다. model에는 직렬화 가능한 DTO와 순수 함수만 둔다.
`server` 진입점은 클라이언트의 값 import를 허용하지 않는다. Next의 Server Action만 page에서
`commands` prop으로 넘긴다. 단순 UI 이동에는 hook이나 새 service를 추가하지 않는다.

## 실행 규칙

각 task 시작 전 관련 기존 테스트를 실행한다. 새로운 경계/행동 테스트는 먼저 추가하고 실패 원인을
확인한 뒤 구현한다. 현재 동작의 characterization은 변경 전 PASS를 기준으로 비교한다. 옮긴 테스트를
복제하여 테스트 수를 늘리지 않는다. task별 검증이 끝나면 diff를 리뷰 가능한 단위로 남긴다. 커밋은
사용자가 요청한 시점의 저장소 절차에 따르며 이 문서 작성으로 커밋을 수행하지 않는다.

### Task 1: 편집 model 경계와 검사 범위 확보

**Files:** Modify `apps/cms/package.json`, `apps/cms/vitest.config.ts`,
`apps/cms/components/editor/editor-screen.tsx`, `apps/cms/app/actions/editor-actions.ts`. Create
`apps/cms/features/editor/model/document-slug.ts`, `document-slug.test.ts`.

**Interfaces:** `slugCandidate(document: EditorDocument): string`; 기존 클라이언트와 동일하게 명시
slug → 영문 제목 slug → document.id 순서로 반환한다. 서버 preview fallback은
`server/preview-slug.ts`의 `previewSlugCandidate(document: EditorDocument): string`으로 구분하며
명시 slug → 기존 path slug → 제목 → 정규화 ID → 원래 ID의 기존 정책을 유지한다. 두 정책의 차이는
최종 리뷰에서 확인했다.

- [x] CMS 기존 format/lint/typecheck/test/build 결과와 테스트 수를 기록한다. 실패는 구현 전 기준과
      구분한다.
- [x] Vitest include에 `features/**/*.test.{ts,tsx}`, `shared/**/*.test.{ts,tsx}`를 추가한다. lint는
      app/components/lib/features/shared와 next.config.mjs, format은 각 디렉터리의 ts/tsx 및 Vitest
      설정까지 검사한다. 아직 없는 디렉터리 때문에 검사 명령이 실패하지 않도록 실제 생성 순서와
      glob을 맞춘다.
- [x] 새 model 경로를 import하는 테스트를 추가한다. `slugCandidate`는 명시 slug를 그대로, 제목
      `Hello World`를 `hello-world`, 한글 제목만 있으면 document.id를 반환한다. 새 테스트가 수집되고
      아직 없는 export 때문에 FAIL인지 확인한다.
- [x] 클라이언트 제목 후보를 model로 옮겨 편집 hook들이 재사용한다. action의 preview 후보는 별도
      서버 함수로 보존한다. SEO slug 정책을 새로 만들거나 taxonomy slug 규칙과 합치지 않는다.
- [x] `pnpm --filter @blog-platform/cms exec vitest run features/editor/model/document-slug.test.ts`
      및 CMS lint/typecheck를 실행한다. PASS와 새 경로 수집을 확인한다.

### Task 2: 글 목록과 공통 서버 설정 분리

**Files:** Modify `apps/cms/lib/editor/editor-loader.ts`,
`apps/cms/lib/analytics/analytics-dashboard-loader.ts`, `apps/cms/lib/auth/admin-identity.ts`, 글
목록 page와 소비자 imports. Create `apps/cms/features/posts/model/post-summary.ts`,
`server/post-summaries.ts`, `server/index.ts`, `components/posts-search-form.tsx`; move
`apps/cms/components/posts/posts-search-form.tsx`의 이름을 보존한다. Move site-config/root 및 관련
테스트를 `apps/cms/shared/server/`로 옮긴다.

**Interfaces:** `PostSummary`, `listPostSummaries`의 현재 인자·반환형·정렬 기본값을 그대로
export한다. `repositoryRoot(cwd?: string)`와 `loadSiteConfig`의 현재 signature를 유지한다.
analytics는 posts/server 공개 API만 참조한다.

- [x] 기존 editor-loader/analytics-dashboard-loader/site-config 테스트를 실행하고 목록
      정렬·상태·경로 기대값을 기록한다.
- [x] 목록 관련 타입·매핑·정렬·조회만 post-summaries로 이동한다. 문서 로딩·카테고리 옵션·편집기
      설정은 editor에 남긴다. 테스트도 해당 책임으로 나눈다.
- [x] UI와 공유 설정을 위 목표 경로로 이동하고 auth를 포함한 모든 소비자의 import를 수정한다.
      repositoryRoot의 `apps/cms` cwd 처리와 루트 site.json 읽기를 유지한다.
- [x] 관련 테스트와 CMS typecheck를 실행한다. analytics → editor-loader 직접 의존성이 0인지 `rg`로
      확인한다.

### Task 3: 편집 서버 기능과 Server Action capability 경계

**Files:** Move editor-save/publish-workflow/public-refresh/editor-media/media-file/media-path와
테스트를 `apps/cms/features/editor/server/`로 옮긴다. editor-loader도 이 경로로 이동한다. Create
`features/editor/model/commands.ts`, `server/index.ts`, `app/actions/editor-commands.ts` under
`apps/cms`. Modify `app/actions/editor-actions.ts`, `app/posts/new/page.tsx`,
`app/posts/[slug]/page.tsx`,
`components/editor/{editor-screen,frontmatter-panel,media-upload-control}.tsx`와 관련 tests.

**Interfaces:** 기존 7개 action의 인자/결과 union을 `model/commands.ts`로 명시한다.
`EditorCommands`는 save(document), publish({document,nowIso?}), unpublish({document}),
archive({document}), retry({retryToken}), upload(FormData), preview({document}) 메서드를 가진다.
반환형은 각각 현재 action의 inferred union을 그대로 명명하여 보존한다.
`app/actions/editor-commands.ts`는 기존 action 함수를 이 메서드에 연결하는 서버 전용 조립 파일이다.
`EditorScreen`은 `commands: EditorCommands`를 받는다.

- [x] 기존 action/auth/preview/workflow 테스트를 실행한다. 추가 characterization은 접근 거부 시
      adapter·refresh 미호출, preview 1800초, 저장 성공 후 갱신 실패의 path/sha/retryToken 보존을
      고정한다.
- [x] 서버 workflow와 DTO를 이동한다. action에는 기존 접근 정책·환경 설정 조립·redaction·Next cache
      무효화·기능 호출을 남긴다. 정책을 일괄 guard 하나로 바꾸어 실패 코드를 통일하지 않는다.
- [x] 두 post page의 composition에서 commands를 전달한다. 내부 이미지 업로드 컴포넌트에는 upload
      함수만 전달한다. page view 테스트에도 같은 typed stub을 주입한다. client에서 `app/actions`를
      직접 import하지 않게 한다.
- [x] 기존 action/발행/preview/미디어 인증 테스트와 관련 page/component 테스트를 실행한다.
      `features`가 app을 import하지 않고 client가 server 값을 import하지 않는지 확인한다. Next
      build로 action prop 전달과 직렬화 경계를 검증한다.

### Task 4: 편집 세션·저장·발행 hook 추출

**Files:** Move `components/editor/editor-screen.tsx` 및 save/publish/failure/recovery 테스트를
`apps/cms/features/editor/components/`로 옮긴다. Create
`apps/cms/features/editor/hooks/use-editor-session.ts`, `use-editor-operations.ts`; move
draft-backup 및 tests를 `features/editor/model/`, recovery banner를 feature components로 옮긴다.

**Interfaces:** `useEditorSession(initialDocument: EditorDocument)`는 문서·최신 문서 ref·dirty/save
상태·백업 생명주기를 소유한다. `useEditorOperations({session, commands})`는
save/publish/unpublish/archive/retry/preview와 pending/message/retryToken을 소유한다. 두 hook의 반환
타입을 파일에서 명시하고 `EditorScreen`에서만 조합한다. Tiptap instance와 이미지 선택은 이 단계에서
그대로 둔다.

- [x] deferred save 응답 중 추가 입력을 발생시키는 테스트를 기존 save-flow에 추가한다. 응답 후 최신
      텍스트가 남고 백업을 잘못 지우지 않는지 고정한다. 이미 보장하지 않는 동작이면 리팩토링에 섞어
      고치지 말고 현재 관찰값과 별도 수정 필요성을 기록한다.
- [x] 기존 publish-failure-flow에서 저장 후 refresh 실패와 retry를 실행한다. retry 중
      createPost/updatePost 호출 수가 증가하지 않고 retryToken.targets만 갱신하는지 assert한다.
- [x] hook으로 상태와 effect를 이동한다. 타이머 주기·effect dependency·문서 ref 갱신 순서·현재
      toast/message를 유지한다. 단순 JSX와 Tiptap 렌더는 컴포넌트에 남긴다.
- [x] save/publication-state/publish-failure/failure/recovery/component 테스트와 CMS typecheck를
      실행한다. 타이머와 pending 해제, 연속 작업의 상태를 비교한다.

### Task 5: Tiptap·미디어 제어와 표현 분리

**Files:** Create `apps/cms/features/editor/hooks/use-editor-content.ts`, `use-editor-images.ts`;
move 남은 `components/editor/*`를 `features/editor/components/`로 옮긴다. Move clipboard-image를
`features/editor/model/`, seo-report/analytics-links와 tests도 model로 옮긴다. shared/ui 필드와
소비자를 이동한다.

**Interfaces:** `useEditorContent`는 기존 contentExtensions 및 nodes 변환을 사용하여 Tiptap
instance와 body 변경을 제공한다. `useEditorImages({editor, upload, postSlug})`는 선택
위치·alt/title/caption과 paste 업로드를 소유한다. upload는 `EditorCommands['upload']`만 받는다.
직렬화는 core/content의 기존 함수를 쓴다.

- [x] 기존 media/cover/markdown-paste/round-trip/toolbar 테스트를 실행한다. 선택 이미지를 바꾼 후
      속성 수정 시 새 위치만 변경되고 실패한 업로드는 본문·커버를 변경하지 않는 assertion을
      확보한다.
- [x] Tiptap과 미디어 callback을 순서대로 추출한다. useEditor의 초기화·selection handler·paste
      처리·unmount 정리를 그대로 유지한다. 이미지 업로드 UI의 FormData 필드 이름과 target 값을
      유지한다.
- [x] frontmatter/toolbar/preview/SEO/status 등 표현 컴포넌트를 옮긴다. 단일 편집기 상태를 여러
      hook이 복사하여 별도 소유하지 않도록 한다.
- [x] 전체 editor 테스트와 CMS format/lint/typecheck/build를 실행한다. 중첩 목록·표·코드·이미지
      round-trip과 명시 action prop 경계를 확인한다.

### Task 6: taxonomy feature와 카테고리 hook

**Files:** Create `apps/cms/features/taxonomy/model/{category-tree,contracts}.ts`,
`hooks/use-category-manager.ts`, `server/{queries,mutations,index}.ts`,
`components/{category-manager,category-row,category-dialogs}.tsx` 및 tests. Modify
`apps/cms/app/settings/page.tsx`, `app/actions/taxonomy-actions.ts`.

**Interfaces:** 기존 CategoryWithCount/CategoryGroup/CategoryDialogState를 contracts로 이동한다.
`categoryTree(categories)`와 `deleteBlockReason({category,childCount})`는 현재 출력 유지.
`useCategoryManager(groups)`는 dialog/collapsed/showChildren/toggleCategory를 제공한다.
`TaxonomyCommands`의 create/update/delete는 현 FormData action 계약이며 page에서 전달한다.
createTag는 기존 서버 form action을 유지한다.

- [x] category-tree/manager 테스트를 추가한다. 자식이 있으면
      `하위 카테고리를 먼저 삭제해야 합니다.`, 연결 글이 있으면
      `연결된 글이 있어서 삭제할 수 없습니다.`를 assert하고 delete 호출 0회를 검증한다. toggle 후
      다른 parent의 펼침 상태가 유지되는지도 검증한다.
- [x] taxonomy action 테스트를 추가한다. 세션 거부 시 mutation 0회, 정상 입력 시 현 slug/id/parent
      payload와 settings cache 무효화를 고정한다. UI 제한을 서버 권한 검사로 대신하지 않는다.
- [x] settings의 categoryTree/loader, action의 데이터 조작, UI 표시 상태를 각각
      model/server/hook으로 이동한다. 기존 목록 limit와 실패 시 빈 항목 처리 정책은 변경하지 않는다.
- [x] taxonomy 새 테스트·settings page·auth mutation 테스트와 CMS lint/typecheck를 실행한다.

### Task 7: analytics provider 분리

**Files:** Move `components/analytics/*`, `lib/analytics/*` 및 tests를
`apps/cms/features/analytics/`로 옮긴다. Create `server/google-auth.ts`, `server/google-reports.ts`,
`model/google-normalization.ts`, `server/mock-dashboard.ts`. Keep
`server/google-analytics-provider.ts`, `server/analytics-dashboard-loader.ts`, `server/index.ts` as
orchestration/public API. Modify analytics page imports.

**Interfaces:**
`fetchGoogleAnalyticsDashboard(request: AnalyticsProviderRequest, config: GoogleAnalyticsProviderConfig): Promise<AnalyticsProviderResult>`와
`loadAnalyticsDashboard(input?: AnalyticsDashboardLoaderInput): Promise<AnalyticsDashboardView>`를
유지한다. 기존 private 함수는 이름·signature를 그대로 추출하며 Google raw response 타입은
normalization 모델에 모은다. fetchImpl 주입은 그대로 사용한다.

- [x] 기존 provider/loader 테스트를 실행한다. 7d/28d의 UTC 경계, 이전 기간, archive 포함·draft 제외,
      OAuth 오류/설정 누락/부분 snapshot 결과를 고정한다.
- [x] JWT/서비스 계정/token은 google-auth, GA4/GSC HTTP는 google-reports, 순수 URL/날짜/집계 매핑은
      google-normalization, mock 자료는 mock-dashboard로 분리한다. 호출 수·병렬 보고서 요청·mockMode
      판정은 변경하지 않는다.
- [x] UI와 loader를 옮기고 Task 2의 posts/server만 참조하도록 한다. 외부 API 결과를 page나 hook에서
      재정규화하지 않는다.
- [x] analytics provider/loader/table/page 테스트와 CMS lint/typecheck를 실행한다. 실제 Google API는
      호출하지 않는다.

### Task 8: 공개 콘텐츠 BFF·경계 검사와 최종 검증

**Files:** Create `apps/cms/features/public-content/server/query.ts`, `query.test.ts`,
`apps/cms/lib/architecture.test.ts`. Modify `apps/cms/app/api/public-content/route.ts`,
`apps/cms/README.md`; remove 사용자가 모두 이동한 기존 editor/analytics/posts/settings barrel과 임시
re-export.

**Interfaces:** `queryPublicContent(requestUrl: URL, adapter: ContentAdapter)`는
`{status,body,headers}`를 반환한다. 현재 GET의 slug/list/category 조회·검증을 그대로 이동하고
route는 Response.json 변환만 수행한다. body union은 현
`{post}`/`{posts,total,categories}`/`{error}`를 유지한다.

- [x] route 테스트에서 draft slug 404, adapter 실패 502, limit 최대 100, publishedOnly true와 cache
      header를 고정한다. query 단위 테스트도 같은 mock adapter를 사용한다.
- [x] query를 추출하고 route export의 runtime/dynamic을 유지한다. media route·인증 route는 책임이
      이미 작으므로 import 수정 이외 재구성하지 않는다.
- [x] architecture 테스트는 TS import AST로 value/type-only를 구분한다. feature → app, client
      진입점의 transitive server/Node/storage/env 값 import, analytics → editor 내부 import를
      금지한다. fixture로 허용된 DTO type-only import와 page의 Server Action 조립은 통과하는지
      검증한다. 현재 source까지 검사하고 호환 barrel을 제거한다.
- [x] CMS `format:check`, `lint`, `typecheck`, `test`, `build`를 모두 실행한다. Blog의
      content-source/revalidate/preview 관련 테스트를 실제 경로로 찾아 함께 실행한다. core API를
      바꾼 경우에만 core 검사도 추가한다.
- [x] 테스트 수와 기준 대비 결과, 책임 지도, 남은 관찰 사항을
      `docs/audits/2026-11-09-cms-feature-refactoring.md`에 기록한다. 문서 예시·빌드 결과와 source
      diff를 검토한다. 실제 운영 발행이나 배포로 로컬 검증을 대신하지 않는다.

## 완료 조건과 자체 검토

모든 task가 위 검사를 통과하고 이전 공개/인증/편집 계약을 유지할 때 완료다. 저장 후 공개 갱신 실패를
포괄적인 저장 실패로 바꾸지 않는다. 변경은 소유 기능 안에 모이고 client/server 혼합 barrel과 역방향
의존성이 없어야 한다. 현재 부족한 동작을 발견하면 회귀와 구분하여 기록한다.

자체 검토: 명세의 CMS 다섯 기준은 Task 1~8에 대응한다. Review Focus 5개는 지정 task의 assertion에
연결했다. action 결과 union은 새 상태 체계로 재설계하지 않고 현재 inferred 결과를 명명하여 이동한다.
공통 패키지/스토리지 스키마/운영 환경 변경은 없다.
