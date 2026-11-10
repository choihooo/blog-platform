# 블로그 플랫폼 구현 로드맵

> 이 문서는 초기 구현 로드맵 및 이력이다. 현재 구현과 다른 패키지명·경로가 남아 있을 수 있으며, 최신
> 동작은 실제 소스와 각 앱의 `AGENTS.md`를 기준으로 한다.

## 1. 로드맵 원칙

이 로드맵은 1인 블로그 MVP를 빠르게 완성하기 위한 실행 순서다. 목표는
`GitHub repository를 콘텐츠 원본으로 쓰는 안정적인 MDX 블로그 + CMS`를 먼저 완성하는 것이다.

MVP에서 하지 않는다:

- PostgreSQL 또는 별도 CMS DB.
- GA4/Search Console API 기반 자체 분석 대시보드.
- 실제 AI 글쓰기 생성.
- 내부 링크 자동 추천.
- 다중 작성자/권한/승인 플로우.
- object storage.
- 예약 발행.

MVP에서 반드시 한다:

- GitHub `content/posts/*.mdx` 기반 콘텐츠 저장.
- `draft`, `published`, `archived` 상태 관리.
- Tiptap 기반 CMS 에디터.
- Tiptap JSON ↔ MDX 변환.
- 공개 블로그 렌더링.
- Publish 버튼 기반 자동화.
- SEO Score 0-100 rule-based checker.
- TOC, reading time, RSS, Sitemap, robots.txt, JSON-LD, OG image 자동 생성.
- GA4/GTM 이벤트 발행.
- CMS에서 GA4/Search Console 외부 콘솔 링크 제공.

## 2. 단계 요약

```txt
Phase 0: Repo Foundation
Phase 1: Content Model
Phase 2: Markdown/MDX Engine
Phase 3: Blog Rendering
Phase 4: GitHub Content Adapter
Phase 5: CMS Auth + Shell
Phase 6: CMS Editor
Phase 7: Media Upload
Phase 8: Publish Workflow
Phase 9: SEO Engine
Phase 10: Generated Outputs
Phase 11: Analytics MVP
Phase 12: Security Hardening
Phase 13: Deployment
Post-MVP: AI, Analytics API Dashboard, Internal Link Recommendation
```

## 3. Phase 0: Repo Foundation

목표:

- pnpm + Turborepo 기반 모노레포를 만든다.
- `apps/blog`, `apps/cms`, `packages/*`, `docs/` 구조를 만든다.
- TypeScript, lint, format, build pipeline을 루트에서 실행 가능하게 만든다.

작업:

1. 루트 `package.json` 생성.
2. `pnpm-workspace.yaml` 생성.
3. `turbo.json` 생성.
4. 공통 `tsconfig` 구성.
5. ESLint/Prettier 구성.
6. `apps/blog` Next.js App Router 생성.
7. `apps/cms` Next.js App Router 생성.
8. 패키지 skeleton 생성:
   - `packages/editor`
   - `packages/markdown`
   - `packages/seo-engine`
   - `packages/design-system`
   - `packages/analytics`
   - `packages/ai`
9. `docs/` 문서 폴더 유지.

완료 기준:

- 루트에서 `pnpm install` 성공.
- 루트에서 `pnpm build`가 두 앱과 패키지를 대상으로 실행된다.
- `apps/blog`와 `apps/cms`가 로컬에서 각각 실행된다.
- TypeScript path alias가 앱/패키지 간에 정상 동작한다.

주요 산출물:

```txt
package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
apps/blog/
apps/cms/
packages/*/
docs/
```

## 4. Phase 1: Content Model

목표:

- GitHub repository 안에서 콘텐츠를 파일 기반으로 저장할 구조를 확정한다.
- frontmatter schema를 `draft`, `published`, `archived` 상태별로 검증한다.

작업:

1. `content/` 디렉터리 생성.
2. 샘플 글 생성:
   - `content/posts/hello-world.mdx`
3. 운영자 프로필 생성:
   - `content/authors/ho.md`
4. 설정 파일 생성:
   - `content/categories.json`
   - `content/tags.json`
   - `content/site.json`
5. `site.json`에 다음 설정 포함:
   - `siteName`
   - `siteUrl`
   - `defaultAuthor`
   - `adminGithubLogin`
   - `adminGithubUserId`
   - `github.owner`
   - `github.repo`
   - `github.branch`
   - `analytics.provider`
   - `features.aiAssistant`
   - `features.internalLinkSuggestions`
6. `packages/markdown` 또는 별도 shared schema 파일에 Zod schema 작성.
7. 상태별 validation 작성:
   - `DraftPost`
   - `PublishedPost`
   - `ArchivedPost`
8. slug 정책 구현:
   - draft는 slug 없이 임시 id 허용.
   - Save/Publish 시 title 기반 slug 생성.
   - 저장 전 전체 `content/posts/*.mdx` 기준 중복 검사.

완료 기준:

- 잘못된 `status`가 거부된다.
- `published` 글은 `title`, `slug`, `author`, `publishedAt`, non-empty body 없이는 통과하지 못한다.
- `draft`는 slug 없이도 로컬 편집 상태로 존재할 수 있다.
- 샘플 `published` 글이 schema validation을 통과한다.

테스트:

- 필수 field 누락.
- 잘못된 status.
- slug 중복.
- `publishedAt` 없는 published.
- 빈 본문의 published.

구현 상태:

- `content/` 파일 구조와 샘플 published 글을 추가했다.
- `packages/markdown`가 상태별 post validation, collection validation, published-only filtering,
  slug 후보 생성, slug 중복 검사를 제공한다.
- package validation은 `pnpm --filter @blog-platform/markdown typecheck`, `lint`, `test`로 확인한다.

## 5. Phase 2: Markdown/MDX Engine

목표:

- 직접 parser를 만들지 않고 `@mdx-js/mdx`, unified, remark/rehype 생태계를 감싼 공통 API를 만든다.
- blog 렌더링과 CMS preview가 같은 변환 로직을 사용하게 한다.

사용 라이브러리:

- `@mdx-js/mdx`
- `@mdx-js/react`
- `next-mdx-remote/rsc`
- `remark-gfm`
- `remark-frontmatter`
- `remark-mdx`
- `rehype-slug`
- `rehype-autolink-headings`
- `rehype-sanitize`
- `shiki` 또는 `rehype-pretty-code`
- `github-slugger`
- `reading-time`
- `gray-matter`
- `zod`

작업:

1. `parseFrontmatter` 구현.
2. `serializeFrontmatter` 구현.
3. `compileMdx` 구현.
4. `renderMdx` 또는 Next.js 서버 렌더링 helper 구현.
5. `extractHeadings` 구현.
6. `generateToc` 구현.
7. `generateHeadingSlugs` 구현.
8. `calculateReadingTime` 구현.
9. `highlightCodeBlocks` 설정.
10. sanitizer allowlist 구성.
11. MDX component allowlist 구성.

MVP에서 금지:

- remote MDX runtime evaluation.
- arbitrary import/export.
- inline `<script>`.
- event handler.
- unsafe HTML.
- custom interactive component 편집.

완료 기준:

- 샘플 MDX가 blog와 CMS preview에서 같은 결과로 렌더링된다.
- TOC와 reading time이 같은 입력에서 안정적으로 생성된다.
- unsafe MDX가 렌더링되지 않는다.
- code block이 syntax highlight된다.

테스트:

- heading 추출.
- 중복 heading slug.
- TOC depth.
- reading time.
- unsafe HTML 차단.
- code block 렌더링.

## 6. Phase 3: Blog Rendering

목표:

- 공개 블로그는 로컬 `content/` 파일만 읽는다.
- 공개 런타임에서 GitHub API에 접근하지 않는다.
- `status: published` 글만 공개 페이지와 자동 산출물에 포함한다.

작업:

1. content loader 작성:
   - `getAllPosts`
   - `getPublishedPosts`
   - `getPostBySlug`
   - `getCategories`
   - `getTags`
   - `getSiteConfig`
2. 공개 라우트 구현:
   - `/`
   - `/posts/[slug]`
   - `/categories/[slug]`
   - `/tags/[slug]`
3. 404 정책 구현:
   - draft slug 직접 접근 시 404.
   - archived slug 직접 접근 시 404.
4. blog layout 구현.
5. shadcn/ui 기본 색상 기반 typography 적용.
6. post page 구성:
   - title
   - excerpt
   - author
   - publishedAt
   - reading time
   - TOC
   - MDX content
   - cover image
7. category/tag 페이지 구현.

완료 기준:

- `published` 글만 홈/목록/상세에 보인다.
- `draft`와 `archived`는 공개 페이지에서 접근할 수 없다.
- 공개 `blog` 코드에 GitHub API token이 필요 없다.
- 로컬 샘플 글로 정적 렌더링이 가능하다.

테스트:

- published 글 목록 필터.
- draft 404.
- archived 404.
- category/tag filtering.
- TOC 표시.
- reading time 표시.

## 7. Phase 4: GitHub Content Adapter

목표:

- CMS에서 GitHub Contents API를 통해 콘텐츠 파일을 읽고 쓴다.
- 모든 update는 file SHA 기반 optimistic locking을 사용한다.
- GitHub 저장 실패 시 사용자의 현재 편집 내용을 잃지 않는다.

작업:

1. adapter interface 정의:
   - `listFiles`
   - `readFile`
   - `createFile`
   - `updateFile`
   - `deleteFile`
   - `commitMedia`
2. local file adapter 구현.
3. GitHub Contents API adapter 구현.
4. GitHub App installation token 발급 helper 구현.
5. file SHA 포함 read model 구현.
6. update 요청에 마지막 read SHA 포함.
7. SHA mismatch conflict 처리.
8. commit message convention 적용:
   - `post(<slug>): create draft`
   - `post(<slug>): save draft`
   - `post(<slug>): publish`
   - `post(<slug>): unpublish`
   - `post(<slug>): archive`
   - `media(<slug>): upload <filename>`
   - `settings: update site config`
9. rate limit/error normalization.

완료 기준:

- CMS가 GitHub에서 글 목록을 읽을 수 있다.
- CMS가 새 draft 파일을 만들 수 있다.
- CMS가 기존 파일을 SHA 기반으로 수정할 수 있다.
- SHA mismatch 시 overwrite하지 않는다.
- conflict response가 CMS UI에서 처리 가능한 형태로 반환된다.

테스트:

- create file.
- update file with correct SHA.
- update file with stale SHA.
- rate limit error.
- auth error.
- network error.

구현 상태:

- `apps/cms/lib/content-adapter`에 adapter contract, local adapter, GitHub Contents API adapter,
  path boundary, commit summary, repository error normalization을 구현했다.
- local adapter는 GitHub credential 없이 list/read/create/update/delete/commitMedia 동작과 stale SHA
  protection을 검증한다.
- GitHub adapter는 Contents API create/update/delete/media payload와 HTTP failure normalization을
  검증한다.
- package validation은 `pnpm --filter @blog-platform/cms typecheck`, `lint`, `test`로 확인한다.

## 8. Phase 5: CMS Auth + Shell

목표:

- GitHub OAuth 기반 단일 관리자 인증을 구현한다.
- 로그인한 GitHub user의 `login`과 immutable `id`가 `site.json` 설정과 모두 일치해야 CMS mutation을
  허용한다.
- CMS shell UI는 shadcn/ui 기본 색상만 사용한다.

작업:

1. NextAuth/Auth.js 또는 Next.js OAuth flow 구성.
2. GitHub OAuth provider 설정.
3. session에 `githubLogin`, `githubUserId` 포함.
4. `content/site.json`의 `adminGithubLogin`, `adminGithubUserId` 읽기.
5. route guard 구현.
6. mutation guard 구현.
7. CMS shell 구현:
   - sidebar
   - top bar
   - post nav
   - settings nav
8. shadcn/ui 컴포넌트 설치/소유:
   - Button
   - Input
   - Dialog
   - Tabs
   - Dropdown Menu
   - Badge
   - Form
9. lucide-react icon 규칙 적용.

완료 기준:

- 관리자 GitHub 계정만 CMS에 접근 가능하다.
- 다른 GitHub 계정은 읽기/쓰기 모두 차단된다.
- CMS UI가 shadcn/ui 기본 색상만 사용한다.
- 커스텀 hex 색상이 없다.

테스트:

- admin login success.
- non-admin login denied.
- unauthenticated redirect.
- mutation guard.

구현 상태:

- `apps/cms/lib/auth`에 GitHub OAuth 설정, session enrichment, 관리자 identity loader, route guard,
  mutation guard, protected content operation wrapper를 구현했다.
- `content/site.json`의 `adminGithubLogin`과 `adminGithubUserId`가 모두 일치해야 CMS 보호 화면과
  mutation이 허용된다.
- `apps/cms/components/shell`에 sidebar, top bar, Posts/Settings navigation, 접근 상태 화면을
  구현했다.
- `packages/design-system`에 Button, Input, Dialog, Tabs, Dropdown Menu, Form primitive를 추가했다.
- package validation은 `pnpm --filter @blog-platform/design-system typecheck`, `lint`,
  `pnpm --filter @blog-platform/cms typecheck`, `lint`, `test`로 확인한다.

## 9. Phase 6: CMS Editor

목표:

- Tiptap 기반 rich-text editor를 만든다.
- 저장 원본은 계속 MDX다.
- MVP에서는 MDX로 안정적으로 round-trip 가능한 노드만 허용한다.

사용 라이브러리:

- `@tiptap/react`
- `@tiptap/starter-kit`
- `@tiptap/extension-link`
- `@tiptap/extension-image`
- `@tiptap/extension-placeholder`
- `@tiptap/extension-code-block-lowlight`
- `prosemirror-markdown`
- `gray-matter`
- `zod`

MVP 허용 노드:

- paragraph
- heading
- bullet list
- ordered list
- blockquote
- horizontal rule
- link
- image
- inline code
- code block
- bold
- italic

작업:

1. Tiptap editor shell 구현.
2. toolbar 구현:
   - heading
   - bold
   - italic
   - link
   - list
   - quote
   - code
   - image
3. Tiptap JSON → MDX serializer 구현.
4. MDX → Tiptap JSON parser 구현.
5. frontmatter panel 구현.
6. preview panel 구현.
7. dirty state 관리.
8. local draft backup 구현:
   - IndexedDB 사용.
   - key: `post:${slug}` 또는 임시 id.
   - 30일 TTL.
   - GitHub commit 성공 시 삭제.
9. conflict 발생 시 복구 배너 표시.
10. AI UI는 feature flag off 상태에서 숨김.

완료 기준:

- 운영자가 Tiptap에서 글을 작성할 수 있다.
- editor 내용이 MDX로 저장된다.
- 저장된 MDX를 다시 열면 Tiptap 문서로 복원된다.
- 지원하지 않는 MDX JSX/import/export는 편집 모드에서 허용하지 않는다.
- local draft backup으로 새로고침 후 복구할 수 있다.

테스트:

- paragraph round-trip.
- heading round-trip.
- list round-trip.
- image round-trip.
- code block round-trip.
- unsupported MDX reject.
- local draft restore.

구현 상태:

- `packages/editor`가 editor document model, supported format, validation, MDX load/serialize,
  round-trip, preview analysis를 제공한다.
- CMS Posts 화면은 repository post list, `/posts/new`, `/posts/[slug]` editor route를 제공한다.
- Editor UI는 MVP 범위에서 Tiptap contenteditable surface, toolbar commands, frontmatter panel,
  preview panel, save status, recovery banner를 제공한다.
- 저장은 기존 content adapter와 mutation guard를 통해 create draft/save draft를 수행하고 stale SHA와
  auth failure를 보존 가능한 실패 상태로 mapping한다.
- local draft backup helper는 30일 TTL, restore candidate 판단, save cleanup을 제공한다.
- package validation은 `pnpm --filter @blog-platform/editor typecheck`, `lint`, `test`,
  `pnpm --filter @blog-platform/cms typecheck`, `lint`, `test`로 확인한다.

## 10. Phase 7: Media Upload

목표:

- 이미지는 MVP에서 repository 안 `public/media`에 commit한다.
- blob URL이나 원본 대용량 이미지는 MDX에 남기지 않는다.

규칙:

- 허용 타입: `webp`, `png`, `jpg`, `jpeg`.
- 최대 크기: 2MB.
- 가능하면 `webp`로 변환.
- 파일명: slug + content hash.
- cover image: `public/media/covers/<slug>-<hash>.webp`.
- 본문 이미지: `public/media/posts/<slug>/<hash>.webp`.
- caption은 MVP에서 이미지 아래 paragraph로 저장.
- 이미지 삭제는 본문 참조만 제거한다.
- 미사용 파일 정리는 Post-MVP.

작업:

1. upload UI 구현.
2. file type validation.
3. file size validation.
4. webp conversion.
5. content hash filename 생성.
6. GitHub media commit 구현.
7. Tiptap image node update.
8. MDX image syntax 직렬화:
   - `![alt](src "title")`
9. upload failure 처리:
   - blob URL 저장 금지.
   - upload pending state만 local draft backup에 저장.

완료 기준:

- 2MB 초과 이미지가 차단된다.
- 이미지 업로드 후 GitHub에 media commit이 생성된다.
- 본문에는 public path만 삽입된다.
- 업로드 실패 후 MDX에 blob URL이 남지 않는다.

테스트:

- valid upload.
- invalid type.
- too large file.
- hash filename.
- Markdown image serialization.
- failed upload rollback.

구현 상태:

- `apps/cms/lib/editor`가 media path 생성, content hash, 2MB 제한, 확장자 검증, 서버 측 image decode
  및 webp 정규화를 제공한다.
- CMS editor toolbar는 본문 이미지 업로드를 제공하고, frontmatter panel은 cover image 업로드를
  제공한다.
- 업로드 성공 시 기존 protected content operation과 `commitMedia`를 통해 `public/media` 아래에 media
  commit을 만들고, editor document에는 `/media/...` public path만 반영한다.
- `packages/editor`는 image caption 직렬화와 unsafe/local image path 차단을 검증한다.
- package validation은 `pnpm --filter @blog-platform/editor typecheck`, `lint`, `test`,
  `pnpm --filter @blog-platform/cms typecheck`, `lint`, `test`로 확인한다.

## 11. Phase 8: Publish Workflow

목표:

- Publish 버튼 하나로 글 상태 변경과 공개 산출물 반영을 자동화한다.
- CMS는 `rss.xml`, `sitemap.xml`, `robots.txt`를 직접 commit하지 않는다.

작업:

1. Save mutation 구현.
2. Publish mutation 구현.
3. Unpublish mutation 구현.
4. Archive mutation 구현.
5. Publish 시 `publishedAt` 자동 설정.
6. Publish 시 slug 없으면 title 기반 생성.
7. slug 중복 검사.
8. GitHub commit 생성.
9. revalidate 호출.
10. revalidate 실패 분리 표시.
11. 재시도 버튼 구현.

자동 생성 책임:

- `packages/markdown`
  - TOC
  - heading slug
  - reading time
- `packages/seo-engine`
  - metadata
  - canonical
  - Open Graph
  - schema.org
  - JSON-LD
  - RSS item
  - Sitemap entry
  - robots.txt policy
- `apps/blog`
  - `/rss.xml`
  - `/sitemap.xml`
  - `/robots.txt`
  - `/og/[slug]`

Revalidation 대상:

- `/`
- `/posts/[slug]`
- `/categories/[slug]`
- `/tags/[slug]`
- `/rss.xml`
- `/sitemap.xml`
- `/robots.txt`
- `/og/[slug]`

완료 기준:

- draft를 publish하면 공개 블로그에 나타난다.
- unpublish하면 공개 블로그/RSS/Sitemap에서 사라진다.
- archived 글은 공개되지 않는다.
- GitHub commit 성공/revalidate 실패를 CMS가 분리해서 보여준다.

테스트:

- publish.
- unpublish.
- archive.
- missing slug publish.
- duplicate slug.
- revalidate failure.

구현 상태:

- `apps/cms`에 publish workflow helper, public refresh target/result helper,
  Publish/Unpublish/Archive server action을 추가했다.
- CMS editor toolbar와 screen에서 Save 옆에 Publish, Unpublish, Archive 동작을 제공한다.
- public refresh 실패는 repository 변경 성공과 분리해 retry 가능한 상태로 표시한다.
- `apps/blog`가 `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/og/[slug]` route handler를 제공하며
  published-only content selection을 사용한다.
- 검증은 `specs/009-publish-workflow/quickstart.md`의 Validation Results에 기록한다.

## 12. Phase 9: SEO Engine

목표:

- MVP SEO 엔진은 rule-based checker로 구현한다.
- SEO Score 0-100과 `blocking`, `warning`, `passed` 리스트를 제공한다.

점수 가중치:

```txt
H1 존재: 10
H2 2개 이상: 10
Meta Description 존재: 15
Open Graph metadata 존재: 15
Canonical URL 존재: 10
Title 길이 적정: 10
이미지 alt 텍스트: 15
Internal link 1개 이상: 15
총점: 100
```

작업:

1. `runSeoCheck(post)` 구현.
2. H1 검사.
3. H2 개수 검사.
4. meta description 검사.
5. Open Graph 검사.
6. canonical 검사.
7. title length 검사.
8. image alt 검사.
9. internal link 존재 여부 검사.
10. blocking/warning/passed 분류.
11. score 계산.
12. CMS SEO panel 구현.

Blocking:

- 제목 없음.
- slug 없음.
- slug 중복.
- 본문 비어 있음.
- 잘못된 canonical URL.
- MDX compile error.

Warning:

- SEO 제목이 너무 짧거나 김.
- 메타 설명이 너무 짧거나 김.
- 발췌문 없음.
- cover image 없음.
- 이미지 alt 텍스트 없음.
- internal link 부족.
- heading 계층이 중간 단계를 건너뜀.
- H2 heading 없음.

완료 기준:

- 사용자가 CMS에서 SEO Score를 볼 수 있다.
- warning은 발행을 막지 않는다.
- blocking은 발행을 막는다.
- 점수는 deterministic하다.

테스트:

- score 100 case.
- missing H1.
- no H2.
- missing meta description.
- no OG.
- missing canonical.
- title too long.
- missing image alt.
- no internal link.

## 13. Phase 10: Generated Outputs

목표:

- published 글 기준으로 SEO 산출물을 자동 제공한다.

작업:

1. Next metadata 생성.
2. canonical URL 생성.
3. Open Graph metadata 생성.
4. Twitter metadata 생성.
5. `BlogPosting` JSON-LD 생성.
6. `BreadcrumbList` JSON-LD 생성.
7. RSS route 구현:
   - `/rss.xml`
8. Sitemap route 구현:
   - `/sitemap.xml`
9. robots route 구현:
   - `/robots.txt`
10. OG image route 구현:

- `/og/[slug]`

11. TOC 표시.
12. reading time 표시.

완료 기준:

- `draft`와 `archived`는 RSS/Sitemap/JSON-LD에 포함되지 않는다.
- 모든 published 글에는 canonical이 있다.
- 모든 published 글에는 OG image URL이 있다.
- `/robots.txt`가 sitemap URL을 포함한다.
- `/rss.xml`이 최신 published 글을 포함한다.

테스트:

- RSS published filter.
- Sitemap published filter.
- robots sitemap link.
- JSON-LD shape.
- OG image long title wrapping.

## 14. Phase 11: Analytics MVP

목표:

- 자체 분석 대시보드나 DB 없이 GA4/GTM 이벤트를 발행한다.
- CMS에서 외부 분석 콘솔로 빠르게 이동할 수 있게 한다.

BlogEvent:

```ts
type BlogEvent =
  | "article_view"
  | "scroll_50"
  | "scroll_90"
  | "code_copy"
  | "toc_click"
  | "internal_link_click"
  | "external_link_click"
  | "search"
  | "share";
```

작업:

1. analytics provider 설정:
   - `ga4`
   - `gtm`
2. `NEXT_PUBLIC_GA_MEASUREMENT_ID` 조건부 사용.
3. `NEXT_PUBLIC_GTM_ID` 조건부 사용.
4. GA4/GTM script 삽입.
5. `trackBlogEvent` helper 구현.
6. article view 이벤트 발행.
7. scroll 50/90 이벤트 발행.
8. code copy 이벤트 발행.
9. TOC click 이벤트 발행.
10. internal link click 이벤트 발행.
11. external link click 이벤트 발행.
12. search 이벤트 발행.
13. share 이벤트 발행.
14. CMS 외부 링크 생성:

- 공개 글 열기.
- GA4 페이지 성과 보기.
- Search Console에서 검색 성과 보기.

완료 기준:

- 공개 글 진입 시 `article_view`가 전송된다.
- 스크롤 50/90 이벤트가 중복 없이 전송된다.
- 코드 복사 시 `code_copy`가 전송된다.
- CMS에서 GA4/Search Console 외부 링크를 열 수 있다.

테스트:

- event helper payload.
- scroll threshold once.
- code copy event.
- external link URL generation.

## 15. Phase 12: Security Hardening

목표:

- GitHub write 권한과 preview token을 안전하게 제한한다.

작업:

1. GitHub App 생성.
2. GitHub App 권한 제한:
   - `contents: read/write`
   - `metadata: read`
3. installation token helper 구현.
4. GitHub OAuth login 구현.
5. `adminGithubLogin` 검증.
6. `adminGithubUserId` 검증.
7. preview token HMAC 구현.
8. preview token payload:
   - `slug`
   - `exp`
   - `contentSha`
   - `nonce`
9. preview token TTL 30분.
10. preview response `Cache-Control: private, no-store`.
11. secret client bundle 노출 방지.
12. MDX sanitizer 테스트.

필수 환경변수:

```txt
GITHUB_APP_ID
GITHUB_APP_PRIVATE_KEY
GITHUB_INSTALLATION_ID
GITHUB_OWNER
GITHUB_REPO
GITHUB_BRANCH
NEXTAUTH_SECRET
PREVIEW_TOKEN_SECRET
REVALIDATE_SECRET
```

조건부 환경변수:

```txt
OPENAI_API_KEY                 # Post-MVP AI 기능을 켤 때 필요
NEXT_PUBLIC_GA_MEASUREMENT_ID  # analytics.provider가 "ga4"일 때 필요
NEXT_PUBLIC_GTM_ID             # analytics.provider가 "gtm"일 때 필요
```

완료 기준:

- non-admin GitHub 계정은 CMS mutation을 실행할 수 없다.
- preview token 만료 후 draft를 볼 수 없다.
- token payload의 `contentSha`가 현재 글과 다르면 preview가 무효화된다.
- secret이 client bundle에 포함되지 않는다.

## 16. Phase 13: Deployment

목표:

- Vercel 우선 배포를 완료한다.
- blog와 cms가 같은 monorepo에서 안정적으로 배포된다.

작업:

1. Vercel project 생성.
2. `apps/blog` 배포 설정.
3. `apps/cms` 배포 설정.
4. environment variables 등록.
5. GitHub OAuth callback URL 설정.
6. GitHub App installation 확인.
7. revalidate secret 설정.
8. GA4/GTM id 설정.
9. production build 검증.
10. published 글 렌더링 확인.
11. draft 공개 차단 확인.
12. CMS 로그인 확인.
13. Publish 후 revalidate 확인.

완료 기준:

- production URL에서 blog가 열린다.
- CMS는 관리자만 접근 가능하다.
- Publish 후 공개 블로그에 반영된다.
- RSS/Sitemap/robots/OG image가 production에서 동작한다.

## 17. Post-MVP Roadmap

### AI Writing Assistant

- OpenAI API provider 구현.
- 제목 후보 생성.
- 발췌문 생성.
- SEO 제목/메타 설명 생성.
- 문단 개선.
- 개요 생성.
- AI action log는 repository에 commit하지 않음.

### Internal Link Recommendation

- published 글 index 생성.
- 태그/카테고리/키워드 기반 추천.
- embedding 기반 유사도 검토.
- 추천 이유 표시.
- Markdown 링크 삽입.

### Analytics API Dashboard

- GA4 Data API 연결.
- Search Console API 연결.
- DB 없이 API 직접 조회로 시작.
- 필요 시 임시 서버 메모리 캐시 또는 artifact 검토.
- 게시글별 통합 지표.
- 개선 제안.

### Source Mode

- CodeMirror 기반 raw MDX source mode.
- Tiptap에서 지원하지 않는 MDX 편집.
- round-trip diff preview.

### Media Cleanup / Object Storage

- 미사용 이미지 탐지.
- repository media 용량 리포트.
- `public/media` 500MB 또는 이미지 1,000개 초과 시 R2/S3 전환 검토.

## 18. 권장 구현 순서

1. Phase 0: Repo Foundation
2. Phase 1: Content Model
3. Phase 2: Markdown/MDX Engine
4. Phase 3: Blog Rendering
5. Phase 4: GitHub Content Adapter
6. Phase 5: CMS Auth + Shell
7. Phase 6: CMS Editor
8. Phase 7: Media Upload
9. Phase 8: Publish Workflow
10. Phase 9: SEO Engine
11. Phase 10: Generated Outputs
12. Phase 11: Analytics MVP
13. Phase 12: Security Hardening
14. Phase 13: Deployment

## 19. MVP 완료 정의

MVP는 다음을 만족하면 완료다.

- 운영자가 GitHub OAuth로 CMS에 로그인할 수 있다.
- 운영자가 Tiptap 에디터로 글을 작성할 수 있다.
- 글은 MDX로 `content/posts/*.mdx`에 저장된다.
- 자동저장은 IndexedDB local draft backup에 저장된다.
- Save 버튼은 GitHub commit을 만든다.
- Publish 버튼은 `status: published`, `publishedAt`, GitHub commit, revalidate를 처리한다.
- published 글만 공개 블로그에 노출된다.
- draft/archived 글은 공개되지 않는다.
- TOC와 reading time이 자동 생성된다.
- SEO Score 0-100이 표시된다.
- RSS/Sitemap/robots/JSON-LD/OG image가 자동 제공된다.
- 이미지는 `public/media`에 저장되고 본문에는 public path만 들어간다.
- GA4/GTM 이벤트가 발행된다.
- CMS에서 공개 글, GA4, Search Console 외부 링크로 이동할 수 있다.
- 루트에서 build/test가 통과한다.
