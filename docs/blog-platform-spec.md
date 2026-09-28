# 블로그 플랫폼 스펙

> 이 문서는 초기 설계 및 구현 이력이다. 현재 구현과 다른 패키지명·경로가 남아 있을 수 있으며,
> 최신 동작은 실제 소스와 각 앱의 `AGENTS.md`를 기준으로 한다.

## 1. 목적

공개 블로그, 비공개 CMS, 그리고 글쓰기/발행/SEO/분석/Markdown/MDX/AI/디자인 시스템을 담당하는 공유
패키지로 구성된 모노레포 기반 블로그 플랫폼을 만든다.

이 플랫폼은 1인 블로그 운영자가 기술 블로그 글을 작성, 최적화, 미리보기, 발행까지 한 흐름에서 처리할
수 있게 한다. 글마다 SEO 메타데이터, 목차, OG 이미지, RSS, Sitemap, JSON-LD를 수동으로 연결하지 않는
것이 핵심이다.

## 2. 사용자

주요 사용자:

- 독자: 공개 블로그를 방문해 글을 읽고, 태그/카테고리를 탐색하고, 글을 공유한다.
- 운영자: CMS에서 Markdown/MDX 글을 작성하고, SEO 상태를 확인하고, 미리보기 후 발행한다.

MVP는 단일 운영자만 지원한다. 작성, 수정, 발행, 설정 관리는 모두 같은 사람이 수행한다.

## 3. 목표

- SEO, 가독성, 공유, 검색 색인에 최적화된 빠른 공개 블로그를 제공한다.
- Draft / Publish 워크플로우를 가진 비공개 CMS를 제공한다.
- Markdown + MDX 작성과 실시간 미리보기를 지원한다.
- heading을 기반으로 Table of Contents를 자동 생성한다.
- SEO 메타데이터, JSON-LD, Sitemap, RSS를 자동 생성한다.
- 글 메타데이터를 기반으로 OG 이미지를 자동 생성한다.
- 작성 중 실시간 SEO 검사를 제공한다.
- GA4/GTM 이벤트를 발행하고, CMS에서 GA4/Search Console 외부 콘솔로 바로 이동할 수 있게 한다.
- AI를 통한 글 개요, 제목, 요약, 메타 설명, 내부 링크 추천은 MVP 이후에 제공한다.
- GA4/Search Console API 기반 통합 지표 대시보드는 MVP 이후에 제공한다.
- Markdown, SEO, analytics, AI, design 로직을 공유 패키지로 분리해 `blog`와 `cms`에서 중복 구현하지
  않는다.

## 4. 비목표

초기 버전에 포함하지 않는다:

- 멀티테넌트 SaaS.
- 공개 사용자 계정 또는 댓글.
- 뉴스레터 발송.
- 결제, 구독, 유료 글.
- 여러 역할이 얽힌 복잡한 편집 승인 체인.
- 여러 작성자, 팀 초대, 역할/권한 관리.
- WYSIWYG 페이지 빌더. 단, 본문 편집용 Tiptap rich-text editor는 사용한다.
- 드래그 앤 드롭 레이아웃 편집기.
- 다국어 로컬라이제이션.
- WordPress, Notion, Medium 가져오기.
- MVP 단계의 Search Console OAuth 대시보드.

위 항목은 이후 확장 가능하지만, 초기 아키텍처가 이것들을 전제로 복잡해지면 안 된다.

## 5. 저장소 구조

목표 구조:

```txt
apps/
  blog/
  cms/

packages/
  editor/
  seo-engine/
  markdown/
  design-system/
  analytics/
  ai/
```

## 6. 확정 스택

### Core

- 언어: TypeScript
- 패키지 매니저: pnpm
- 모노레포: Turborepo
- 앱 프레임워크: Next.js App Router
- 런타임: Node.js
- 배포: Vercel 우선

### Apps

- `apps/blog`: 공개 블로그. 로컬 `content/` 파일만 읽는다.
- `apps/cms`: 비공개 CMS. GitHub API mutation을 담당한다.
- `docs/`: Markdown 문서 폴더. 별도 docs app은 만들지 않는다.

### Content

- 콘텐츠 원본: GitHub repository
- 글 저장 형식: `content/posts/*.mdx`
- 공개 상태: MDX frontmatter의 `status`
- GitHub 쓰기 API: GitHub Contents API
- 충돌 제어: file SHA 기반 optimistic locking
- 이미지 저장: repository 안 `public/media`
- DB: 사용하지 않음

### Editor

- 에디터: Tiptap
- 주요 라이브러리: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`,
  `@tiptap/extension-image`, `prosemirror-markdown`
- 저장 변환: Tiptap JSON ↔ MDX
- MVP 제한: MDX로 안정적으로 round-trip 가능한 노드만 허용
- raw MDX source mode: Post-MVP에서 CodeMirror 기반으로 검토

### Markdown / MDX

- MDX compile/render: `@mdx-js/mdx`, `@mdx-js/react`, `next-mdx-remote/rsc`
- Markdown pipeline: unified, `remark-gfm`, `remark-frontmatter`, `remark-mdx`
- HTML pipeline: `rehype-slug`, `rehype-autolink-headings`, `rehype-sanitize`
- Code highlight: `shiki` 또는 `rehype-pretty-code`
- 기타: `gray-matter`, `zod`, `github-slugger`, `reading-time`

### SEO

- 방식: rule-based checker
- 점수: SEO Score 0-100
- 산출물: slug, metadata, canonical, Open Graph, OG image, JSON-LD, schema.org, RSS, Sitemap,
  robots.txt, TOC, reading time
- Post-MVP: AI 키워드 분석, 경쟁 글 분석, Search Console 기반 개선 제안

### Design UI

- UI 기반: shadcn/ui
- Styling: Tailwind CSS
- Primitive: Radix UI 기반 shadcn/ui 컴포넌트
- Icon: lucide-react
- 위치: `packages/design-system`
- 원칙: shadcn/ui 컴포넌트를 복사/소유하고, 블로그/CMS 공통 토큰과 컴포넌트만 패키지화한다.
- 색상: shadcn/ui 기본 색상만 사용한다. MVP에서는 별도 브랜드 팔레트나 커스텀 컬러 시스템을 만들지
  않는다.

### Analytics

- MVP: GA4/GTM 이벤트 발행 + 외부 콘솔 링크
- 이벤트: `article_view`, `scroll_50`, `scroll_90`, `code_copy`, `toc_click`, `internal_link_click`,
  `external_link_click`, `search`, `share`
- CMS: 게시글별 공개 글, GA4, Search Console 외부 링크 제공
- Post-MVP: GA4 Data API + Search Console API 통합 대시보드
- 분석 DB/cache: MVP에서는 사용하지 않음

### Auth / Security

- 인증: GitHub OAuth 단일 관리자 로그인
- 관리자 검증: `adminGithubLogin` + immutable `adminGithubUserId`
- GitHub write 권한: GitHub App installation token
- GitHub App 권한: `contents: read/write`, `metadata: read`
- Preview token: stateless HMAC, 30분 TTL

### AI

- MVP: 기능 flag와 off 상태 UI/API 비활성화만 구현
- Post-MVP: OpenAI API 기반 글쓰기 보조

### Not Used In MVP

- PostgreSQL
- 별도 CMS 데이터베이스
- GA4/Search Console API 직접 조회
- 자체 분석 대시보드
- object storage
- 여러 작성자/역할 관리

## 7. 앱 책임

### apps/blog

공개 읽기 전용 블로그 애플리케이션이다.

책임:

- 발행된 글을 렌더링한다.
- 홈, 글 상세, 카테고리, 태그, 아카이브 페이지를 렌더링한다.
- 공개 `blog`는 로컬 `content/` 파일만 읽는다.
- 공개 `blog` 런타임은 GitHub API에 직접 접근하지 않는다.
- 공개 페이지, RSS, Sitemap, JSON-LD에는 `status: published`인 글만 포함한다.
- `packages/markdown`를 사용해 Markdown/MDX 콘텐츠를 렌더링한다.
- `packages/seo-engine`에서 생성한 메타데이터를 사용한다.
- RSS와 Sitemap을 제공한다.
- 동적 또는 사전 생성된 OG 이미지를 제공한다.
- GA4 또는 GTM tracking script를 삽입한다.
- 게시글 읽기 행동 이벤트를 GA4/GTM으로 전송한다.
- 발행 콘텐츠는 ISR 또는 정적 생성을 사용한다.
- 초안 미리보기는 서명된 preview token을 통해서만 노출한다.

필수 라우트:

```txt
/
/posts/[slug]
/categories/[slug]
/tags/[slug]
/rss.xml
/sitemap.xml
/robots.txt
/og/[slug]
/preview/[token]
```

### apps/cms

글 작성, 최적화, 발행, 분석을 담당하는 비공개 CMS다.

책임:

- 단일 운영자를 인증한다.
- 글 생성, 수정, 미리보기, 발행, 발행 취소, 보관을 지원한다.
- 글 revision은 Git commit history로 추적한다.
- 실시간 SEO 검사를 실행한다.
- AI 글쓰기 보조 기능 flag를 관리한다. 실제 AI 작성 기능은 Post-MVP다.
- 내부 링크 존재 여부를 검사한다. 내부 링크 추천은 Post-MVP다.
- 생성된 OG 이미지와 메타데이터를 미리보기로 보여준다.
- 게시글별 GA4/Search Console 외부 콘솔 링크를 제공한다.
- GA4/Search Console API 기반 대시보드는 MVP 이후에 제공한다.
- 단일 운영자 프로필, 카테고리, 태그, 사이트 설정을 관리한다.

필수 라우트:

```txt
/dashboard
/posts
/posts/new
/posts/[id]/edit
/posts/[id]/seo
/posts/[id]/preview
/settings
```

Post-MVP 라우트:

```txt
/analytics/search-console
```

### docs/

초기에는 별도 앱이 아니라 Markdown 문서 폴더로 둔다.

책임:

- 패키지 API를 문서화한다.
- CMS 사용 흐름을 문서화한다.
- 배포와 환경 설정 방법을 문서화한다.
- 글쓰기/편집 가이드를 문서화한다.

## 8. 패키지 책임

### packages/editor

`apps/cms`에서 사용하는 Markdown + MDX 에디터 패키지다. 에디터 엔진을 직접 만들지 않고 Tiptap 기반
라이브러리를 감싼다. 저장 원본은 계속 `content/posts/*.mdx`이므로 Tiptap 문서 모델과 MDX 사이의 변환
규칙을 명확히 제한한다.

사용 라이브러리:

- `@tiptap/react`: React용 Tiptap editor.
- `@tiptap/starter-kit`: paragraph, heading, list, bold, italic, code block 등 기본 노드/마크.
- `@tiptap/extension-link`: 링크 편집.
- `@tiptap/extension-image`: 이미지 삽입.
- `@tiptap/extension-placeholder`: placeholder.
- `@tiptap/extension-code-block-lowlight` 또는 동등한 code block extension.
- `prosemirror-markdown`: Markdown serializer/parser 기반.
- `gray-matter`: frontmatter 파싱/직렬화.
- `zod`: frontmatter schema validation.

책임:

- Tiptap 기반 WYSIWYG 편집 UI를 제공한다.
- Tiptap JSON 문서를 MDX 문자열로 직렬화하고, 기존 MDX 문자열을 Tiptap 문서로 파싱한다.
- MVP에서는 MDX로 안정적으로 round-trip 가능한 노드만 허용한다.
- MVP 허용 노드: paragraph, heading, bullet list, ordered list, blockquote, horizontal rule, link,
  image, inline code, code block, bold, italic.
- image node는 `src`, `alt`, `title`, `caption`, `uploadState`를 관리한다.
- MVP에서는 임의 MDX JSX, import/export, custom interactive component 편집을 허용하지 않는다.
- 실시간 미리보기 연동.
- 이미지 삽입과 업로드 hook.
- 코드 블록 편집.
- frontmatter 또는 메타데이터 패널 연동.
- AI command menu 연동.
- dirty state와 local autosave 이벤트 제공.

MVP 에디터는 Tiptap 기반으로 시작한다. raw MDX 편집이 필요하면 Post-MVP에서 CodeMirror 기반 source
mode를 추가 검토한다.

### packages/markdown

Markdown/MDX 처리 패키지다. Markdown/MDX parser와 compiler를 직접 만들지 않고 unified/MDX 생태계
라이브러리를 조합한다.

사용 라이브러리:

- `@mdx-js/mdx`: MDX compile.
- `@mdx-js/react`: MDX component provider.
- `next-mdx-remote/rsc` 또는 동등한 서버 전용 MDX renderer: App Router 서버 렌더링.
- `remark-gfm`: GitHub Flavored Markdown.
- `remark-frontmatter`: frontmatter 인식.
- `remark-mdx`: MDX AST 처리.
- `rehype-slug`: heading id 생성.
- `rehype-autolink-headings`: heading anchor.
- `rehype-sanitize`: unsafe HTML 방어.
- `shiki` 또는 `rehype-pretty-code`: code highlighting.
- `github-slugger`: 안정적인 heading slug.
- `reading-time`: 읽는 시간 계산.

책임:

- 위 라이브러리들을 감싸는 공통 compile/render API를 제공한다.
- heading을 추출한다.
- 안정적인 heading slug를 생성한다.
- Table of Contents를 생성한다.
- 읽는 시간을 계산한다.
- 코드 블록 syntax highlighting을 처리한다.
- 렌더링되는 MDX 컴포넌트를 안전하게 제한한다.
- MVP에서는 remote MDX runtime evaluation, arbitrary import/export, inline `<script>`, event
  handler, unsafe HTML을 허용하지 않는다.
- MDX 렌더링은 사전에 등록된 component allowlist와 sanitizer 정책을 통과해야 한다.
- 블로그 실서비스와 CMS 미리보기에서 공통으로 쓰는 MDX 컴포넌트를 제공한다.

### packages/seo-engine

SEO 자동화와 검증을 담당하는 패키지다.

책임:

- 제목 길이를 검사한다.
- 메타 설명 길이를 검사한다.
- canonical URL을 검사한다.
- heading 구조를 검사한다.
- 이미지 alt 텍스트를 검사한다.
- 내부 링크 존재 여부를 검사한다.
- slug 형식을 검사한다.
- JSON-LD를 생성한다.
- Sitemap entry를 생성한다.
- RSS feed item을 생성한다.
- Open Graph와 Twitter metadata를 생성한다.
- MVP에서는 내부 링크 존재 여부만 검사한다.
- Post-MVP에서 글 메타데이터와 기존 콘텐츠 인덱스를 기반으로 내부 링크를 추천한다.

### packages/design-system

블로그와 CMS가 공유하는 UI primitive 패키지다. shadcn/ui를 기본 UI 시스템으로 사용한다.

책임:

- shadcn/ui 기반 Button, Input, Dialog, Tabs, Dropdown Menu, Badge, Form 컴포넌트.
- Tailwind CSS theme token.
- lucide-react icon 사용 규칙.
- shadcn/ui 기본 색상 token만 사용한다.
- 커스텀 hex 색상, 별도 브랜드 팔레트, 과한 테마 확장은 MVP에서 금지한다.
- CMS shell layout.
- 블로그 typography.
- MDX prose 스타일.
- 테마 token.

### packages/analytics

분석 이벤트 발행과 외부 분석 콘솔 링크 생성을 담당하는 패키지다. MVP에서는 GA4/Search Console API를
직접 조회하거나 지표를 저장하지 않는다.

책임:

- GA4 또는 GTM 초기화 helper를 제공한다.
- 블로그 행동 이벤트를 타입 안정성 있게 발행한다.
- CMS에서 사용할 GA4, Search Console 외부 링크를 생성한다.
- 이벤트 payload에서 글 slug, title, category, tags, destination URL 같은 공통 속성을 표준화한다.
- GA4 Data API와 Search Console API 연동은 Post-MVP로 분리한다.

MVP 이벤트 타입:

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

공통 이벤트 payload:

```ts
type BlogEventPayload = {
  slug: string;
  title: string;
  category?: string;
  tags?: string[];
  path: string;
  targetUrl?: string;
  searchQuery?: string;
};
```

### packages/ai

AI 글쓰기 보조 패키지다.

책임:

- 글 개요를 생성한다.
- 문단을 다듬는다.
- 제목 후보를 제안한다.
- 발췌문을 생성한다.
- SEO 제목과 메타 설명을 생성한다.
- 내부 링크를 제안한다.
- Search Console 기반 개선 기회를 요약한다.
- OpenAI 호출이 앱 코드에 퍼지지 않도록 provider abstraction을 제공한다.

## 9. GitHub 기반 데이터 모델

PostgreSQL 같은 별도 데이터베이스를 두지 않는다. GitHub repository를 콘텐츠 원천 저장소로 사용한다.
공개 블로그는 배포/빌드 결과에 포함된 로컬 `content/` 파일을 읽어 렌더링하고, CMS만 GitHub API를
통해 파일을 생성/수정/삭제한다. GitHub는 canonical content store이지 공개 런타임 데이터베이스가
아니다.

권장 콘텐츠 구조:

```txt
content/
  posts/
    my-first-post.mdx
    nextjs-seo-guide.mdx
  authors/
    ho.md
  categories.json
  tags.json
  site.json

public/
  media/
    covers/
    posts/
    og/
```

미디어 저장 규칙:

- MVP에서는 이미지를 repository 안 `public/media`에 commit한다.
- 허용 타입은 `webp`, `png`, `jpg`, `jpeg`다.
- 업로드 최대 크기는 파일당 2MB다.
- 업로드 시 가능한 경우 `webp`로 변환한다.
- 파일명은 slug + content hash 기반으로 만든다.
- 원본 대용량 이미지는 보관하지 않는다.
- 같은 이름 overwrite는 금지하고 hash suffix를 사용한다.
- repository의 `public/media`가 500MB를 넘거나 이미지가 1,000개를 넘으면 R2/S3 같은 object storage
  전환을 검토한다.

사진/이미지 처리 규칙:

- cover image는 `public/media/covers/<slug>-<hash>.webp`에 저장하고 frontmatter의 `coverImage`에
  경로를 기록한다.
- 본문 이미지는 `public/media/posts/<slug>/<hash>.webp`에 저장하고 MDX 본문 안에 Markdown image
  syntax로 직렬화한다.
- Tiptap image node는 `src`, `alt`, `title`, `caption` 속성을 가진다.
- MDX 저장 시 기본 직렬화는 `![alt](src "title")`를 사용한다.
- `caption`이 있으면 MVP에서는 이미지 바로 아래 paragraph로 저장한다. Post-MVP에서 figure/figcaption
  MDX component를 검토한다.
- alt 텍스트는 본문 이미지는 권장, cover image는 SEO warning 대상이다.
- 이미지를 업로드하면 CMS가 GitHub에 media commit을 만들고, 본문에는 commit된 public path만
  삽입한다.
- 이미지 업로드 실패 시 Tiptap 문서에는 임시 blob URL을 저장하지 않는다. local draft backup에는
  업로드 대기 상태만 보존한다.
- 이미지를 삭제해도 MVP에서는 repository 파일을 자동 삭제하지 않는다. 본문 참조만 제거하고, 미사용
  파일 정리는 Post-MVP로 미룬다.

글 파일은 MDX + frontmatter 형식을 사용한다.

```mdx
---
slug: nextjs-seo-guide
title: Next.js SEO 가이드
subtitle: 검색 노출을 위한 App Router 기반 SEO 설계
excerpt: Next.js 블로그에서 metadata, sitemap, RSS, JSON-LD를 자동화하는 방법.
status: draft
author: ho
category: nextjs
tags:
  - nextjs
  - seo
coverImage: /media/covers/nextjs-seo-guide.png
ogImage: /og/nextjs-seo-guide
seoTitle: Next.js SEO 가이드
seoDescription: App Router 기반 블로그에서 SEO 자동화를 설계하는 방법.
canonicalUrl:
publishedAt:
createdAt: 2026-07-30T00:00:00.000Z
updatedAt: 2026-07-30T00:00:00.000Z
---

# 본문
```

공통 frontmatter field:

- `slug`
- `status`
- `createdAt`
- `updatedAt`

Draft 필수 field:

- `status: draft`
- `createdAt`
- `updatedAt`

Draft는 slug 없이 임시 id로 저장할 수 있다. 운영자가 Save 또는 Publish를 실행할 때 slug가 없으면
title 기반으로 생성하고, 저장 전에 중복을 검사한다.

Published 필수 field:

- `slug`
- `title`
- `status: published`
- `author`
- `publishedAt`
- 비어 있지 않은 MDX 본문

Archived 필수 field:

- `slug`
- `status: archived`
- `createdAt`
- `updatedAt`

선택 field:

- `subtitle`
- `excerpt`
- `category`
- `tags`
- `coverImage`
- `ogImage`
- `seoTitle`
- `seoDescription`
- `canonicalUrl`
- `publishedAt`

상태 값:

```txt
draft
published
archived
```

GitHub가 담당하는 것:

- revision: commit history.
- 운영자 추적: commit author 또는 CMS-authenticated user metadata.
- rollback: 이전 commit revert.
- audit trail: commit log.

CMS가 담당하는 것:

- MDX 파일 생성/수정.
- frontmatter validation.
- slug 중복 검사.
- 에디터 자동저장은 브라우저 local draft backup에만 저장한다.
- 운영자가 Save 버튼을 누르면 main branch에 저장 commit을 만든다.
- 운영자가 Publish 버튼을 누르면 `status: published`와 `publishedAt`을 반영하는 발행 commit을
  만든다.
- 공개 여부는 MDX frontmatter의 `status` 값으로만 판단한다.
- 발행은 파일 이동이 아니라 `status: published`와 `publishedAt` 변경이다.
- preview token 생성.
- GitHub API error handling.

보조 데이터:

- `content/authors/*.md`: 운영자 프로필.
- `content/categories.json`: 카테고리 목록.
- `content/tags.json`: 태그 목록.
- `content/site.json`: 사이트 설정.

Post-MVP 데이터:

- GA4/Search Console 지표는 repository에 저장하지 않는다.
- 통합 대시보드를 만들 때도 별도 DB 없이 API 직접 조회로 시작한다.
- 속도나 quota 문제가 생기면 서버 메모리 캐시 또는 배포 플랫폼 artifact 같은 임시 캐시만 검토한다.
- AI action 로그는 repository에 commit하지 않는다. 배포 플랫폼 서버 로그 또는 provider usage
  dashboard를 우선 사용한다.
- AI 로그를 남기더라도 prompt 원문, 본문 전문, Search Console query 원문은 저장하지 않는다.

`content/site.json`은 사이트 전역 설정을 담는다.

```json
{
  "siteName": "My Blog",
  "siteUrl": "https://example.com",
  "defaultAuthor": "ho",
  "adminGithubLogin": "github-user",
  "adminGithubUserId": "12345678",
  "github": {
    "owner": "owner",
    "repo": "blog",
    "branch": "main"
  },
  "analytics": {
    "provider": "gtm",
    "gaMeasurementId": "",
    "gtmId": ""
  },
  "features": {
    "aiAssistant": false,
    "aiInlineSuggestions": false,
    "internalLinkSuggestions": false,
    "searchConsoleDashboard": false
  }
}
```

콘텐츠 저장 원칙:

- CMS는 글을 `content/posts/*.mdx`에 저장하고 main branch에 commit한다.
- 타이핑 중 autosave는 GitHub commit을 만들지 않는다.
- GitHub commit은 명시적 Save, Publish, Unpublish, Archive, Media Upload에서만 만든다.
- GitHub 저장 요청은 마지막으로 읽은 file SHA를 함께 보낸다.
- GitHub의 최신 SHA와 요청 SHA가 다르면 overwrite하지 않고 conflict로 처리한다.
- conflict 발생 시 CMS는 현재 편집본을 local draft backup에 보존하고, GitHub 최신본과 내 편집본을
  비교하는 충돌 해결 UI를 보여준다.
- `status: draft`는 저장되어 있지만 공개되지 않는 글이다.
- `status: published`만 공개 블로그, RSS, Sitemap, JSON-LD, OG metadata에 포함된다.
- `status: archived`는 보관된 글이며 공개 목록에서 제외한다.
- 단일 운영자 블로그이므로 별도 review 상태는 두지 않는다.

## 10. 발행 워크플로우

필수 글 상태:

```txt
draft -> published
published -> archived
published -> draft
```

흐름:

1. 운영자가 draft를 생성한다.
2. CMS가 타이핑 중 변경사항을 브라우저 local draft backup에 자동 저장한다.
3. 운영자가 Save 버튼을 누르면 CMS가 콘텐츠와 메타데이터를 GitHub repository의 main branch에
   commit한다.
4. Markdown 패키지가 preview, TOC, 읽는 시간, heading slug를 생성한다.
5. SEO 엔진이 에디터 안에서 검사를 실행한다.
6. CMS가 preview URL을 보여준다.
7. 운영자가 Publish 버튼을 누르면 CMS가 `status: published`와 `publishedAt`을 반영해 발행 commit을
   만든다.
8. Blog 앱이 영향을 받는 라우트를 revalidate한다.
9. Sitemap, RSS, JSON-LD, OG metadata가 발행된 글을 반영한다.
10. AI 보조와 Search Console 분석은 MVP 이후 기능으로 남긴다.

Publish 자동화:

- CMS의 Publish 버튼은 글 상태 변경, GitHub commit, revalidate를 트리거한다.
- CMS가 `rss.xml`, `sitemap.xml`, `robots.txt` 같은 파일을 직접 생성해 commit하지 않는다.
- 자동 생성 책임은 `apps/blog`, `packages/markdown`, `packages/seo-engine`에 둔다.
- `slug`는 frontmatter에 없으면 title 기반으로 생성하고, 저장 전에 중복을 검사한다.
- `toc`, heading slug, reading time은 `packages/markdown`가 MDX 본문 기준으로 생성한다.
- metadata, canonical, Open Graph, schema.org, JSON-LD는 `packages/seo-engine`가 생성한다.
- RSS item, Sitemap entry, robots.txt policy는 `packages/seo-engine`가 생성하고 `apps/blog`
  라우트에서 제공한다.
- OG image는 `apps/blog`의 `/og/[slug]` route에서 생성한다.
- 모든 자동 산출물은 `status: published`인 글만 기준으로 생성한다.

발행 제약:

- `published` 상태의 글만 공개 목록, RSS, Sitemap, 태그/카테고리 페이지에 나타난다.
- `draft` 글은 인증된 CMS 또는 서명된 preview token으로만 볼 수 있다.
- slug는 `content/posts/*.mdx` 전체에서 유일해야 한다.
- `draft`와 `archived`는 `/posts/[slug]`, 홈, 태그, 카테고리, RSS, Sitemap, JSON-LD, 내부 링크 추천
  index 어디에도 포함되지 않는다.
- 발행된 글은 `title`, `slug`, MDX 본문, `author`, `publishedAt`을 반드시 가져야 한다.
- GitHub API conflict가 발생하면 CMS는 최신 파일을 다시 읽고 사용자에게 충돌 해결 UI를 보여준다.
- `status: published`로 전환할 때 `publishedAt`이 비어 있으면 CMS가 현재 시각으로 자동 설정한다.

Commit message 규칙:

```txt
post(<slug>): create draft
post(<slug>): save draft
post(<slug>): publish
post(<slug>): unpublish
post(<slug>): archive
media(<slug>): upload <filename>
settings: update site config
```

Local draft backup 규칙:

- 저장 위치는 브라우저 `IndexedDB`를 기본으로 한다.
- key는 `post:${slug}` 또는 신규 글의 임시 id를 사용한다.
- 타이핑 중 변경사항은 local draft backup에 저장한다.
- GitHub commit 성공 후 해당 local draft backup을 삭제한다.
- GitHub 저장 실패, rate limit, 네트워크 오류, SHA conflict가 발생하면 local draft backup을
  유지한다.
- CMS는 복구 가능한 local draft가 있을 때 복구 배너를 보여준다.
- local draft backup TTL은 30일이다.

Revalidation 규칙:

- Save draft는 공개 페이지를 revalidate하지 않는다.
- Publish, Unpublish, Archive는 공개 콘텐츠 revalidate를 실행한다.
- 대상은 `/`, `/posts/[slug]`, 관련 `/categories/[slug]`, 관련 `/tags/[slug]`, `/rss.xml`,
  `/sitemap.xml`, `/robots.txt`, `/og/[slug]`다.
- Next.js 구현에서는 `posts`, `post:${slug}`, `category:${category}`, `tag:${tag}` 같은 tag 기반
  revalidation을 사용한다.
- GitHub commit은 성공했지만 revalidate가 실패한 경우 CMS는 commit 성공과 revalidate 실패를 분리해서
  표시하고 재시도 버튼을 제공한다.

## 11. SEO 요구사항

CMS는 SEO 패널을 제공해야 한다.

패널에 표시할 항목:

- SEO Score 0-100.
- 필수 검사.
- 권장 검사.
- 발행을 막지 않는 warning.
- 통과한 검사.
- 생성된 metadata preview.
- JSON-LD preview.

MVP SEO 엔진은 rule-based checker로 제한한다. AI 기반 키워드 분석, 경쟁 글 분석, Search Console 기반
개선 제안, 내부 링크 자동 추천은 Post-MVP로 미룬다.

MVP 점수 가중치:

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

점수 계산 규칙:

- blocking error가 있으면 발행은 막지만 점수는 계산한다.
- warning은 항목별 감점으로 반영한다.
- internal link는 자동 추천하지 않고, 본문에 내부 링크가 있는지만 검사한다.
- 점수와 `passed`, `warning`, `blocking` 리스트를 함께 표시한다.

발행을 막는 검사:

- 제목 없음.
- slug 없음.
- slug 중복.
- 본문 비어 있음.
- 잘못된 canonical URL.
- MDX compile error.

warning:

- SEO 제목이 너무 짧거나 김.
- 메타 설명이 너무 짧거나 김.
- 발췌문 없음.
- cover image 없음.
- 이미지 alt 텍스트 없음.
- internal link 부족.
- heading 계층이 중간 단계를 건너뜀.
- H2 heading 없음.

자동 생성 산출물:

- 글 페이지용 `BlogPosting` JSON-LD.
- 글/카테고리 페이지용 `BreadcrumbList` JSON-LD.
- 글, 카테고리, 태그용 Sitemap entry.
- 최신 발행 글 기반 RSS feed.
- 모든 공개 페이지용 Open Graph와 Twitter metadata.

## 12. OG 이미지 요구사항

OG 이미지 생성은 다음 데이터를 지원해야 한다.

- 글 제목.
- 카테고리.
- 운영자 이름.
- 선택적 cover image.
- 사이트 브랜딩.

구현 방식:

- MVP: Next.js `ImageResponse`를 사용하는 `/og/[slug]` 라우트.
- 이후: 캐시 안정성을 위해 생성 이미지를 사전 렌더링하고 저장.

수용 기준:

- 모든 발행 글은 유효한 OG image URL을 가진다.
- OG 이미지는 1200x630으로 렌더링된다.
- 긴 제목은 잘리지 않고 줄바꿈된다.
- cover image가 없으면 브랜딩된 fallback layout을 사용한다.

## 13. AI 보조 요구사항

AI 보조 기능은 Post-MVP 기능이다. MVP에서는 기본값을 off로 두고, CMS 설정에서 기능 flag를 켜고 끌 수
있는 구조만 만든다. 꺼져 있을 때는 AI 버튼, inline suggestion, 자동 추천 요청을 노출하지 않는다.

Post-MVP에서 제공할 AI action:

- 주제 기반 개요 생성.
- 선택 문단 개선.
- 제목 후보 5개 제안.
- 발췌문 생성.
- SEO 제목과 메타 설명 생성.
- 내부 링크 제안.
- Search Console 개선 기회 요약.

AI 제약:

- 기본값은 `content/site.json`의 `features.aiAssistant: false`다.
- CMS 설정 화면에서 `aiAssistant`, `aiInlineSuggestions`를 각각 켜고 끌 수 있다.
- `aiAssistant`가 false이면 `/api/posts/:id/ai`는 403 또는 feature disabled 응답을 반환한다.
- `aiInlineSuggestions`가 false이면 에디터 안 자동 문장 추천은 실행하지 않는다.
- AI 제안은 자동 발행되지 않는다.
- 운영자가 생성된 텍스트를 명시적으로 적용해야 한다.
- AI 요청 실패는 편집을 막지 않는다.
- AI 호출은 action type, model, latency, token estimate, user ID를 기록한다.
- secret은 서버 측에만 둔다.

## 14. 내부 링크 추천

기본 내부 링크 추천은 Post-MVP 기능이다. MVP에서는 `published` 글만 링크 추천 index에 들어갈 수
있다는 필터 규칙만 확정한다.

Post-MVP 추천 입력:

- 현재 글 제목.
- 현재 글 태그.
- 현재 글 카테고리.
- 기존 발행 글 제목.
- 기존 발행 글 발췌문.
- 기존 발행 글 태그.

Post-MVP 점수화:

- 정확한 태그 일치.
- 카테고리 일치.
- 키워드 겹침.
- 선택적 최신성 penalty.

이후 점수화:

- embedding 기반 유사도.
- Search Console query 겹침.
- 클릭 성과.

수용 기준:

- 관련 글이 충분하면 CMS가 최소 3개 추천을 보여준다.
- 추천은 현재 글을 제외한다.
- 추천에는 이유, 대상 글 제목, URL이 포함된다.
- 운영자는 추천에서 Markdown 링크를 삽입할 수 있다.

## 15. Analytics

MVP에서는 자체 분석 대시보드, DB 캐시, GA4/Search Console API 연동을 만들지 않는다. 공개 블로그는
GA4/GTM 이벤트를 발행하고, CMS는 게시글별 외부 분석 콘솔 링크를 제공한다.

MVP에서 제공:

- 공개 블로그에 GA4 또는 GTM script 삽입.
- `BlogEvent` 기반 이벤트 발행.
- 게시글 상세/편집 화면에서 외부 분석 링크 제공.
- 공개 글 바로가기.
- GA4 페이지 보고서 바로가기.
- Search Console URL inspection 또는 페이지 성과 바로가기.

CMS 예시:

```txt
게시글: React에서 defer가 필요한가?

분석 바로가기
- 공개 글 열기
- GA4에서 페이지 성과 보기
- Search Console에서 검색 성과 보기
```

Post-MVP 통합 대시보드:

- GA4 Data API로 조회수, 사용자, 평균 참여 시간, 이벤트 수를 가져온다.
- Search Console API로 노출, 클릭, CTR, 평균 순위, 검색어를 가져온다.
- 게시글별 통합 지표를 보여준다.
- 개선 제안을 생성한다.
- 별도 DB 없이 시작한다. 필요하면 Post-MVP에서 짧은 서버 메모리 캐시나 파일 artifact 같은 임시
  캐시만 검토한다.

## 16. API Surface

MVP CMS server action 또는 API route:

```txt
POST   /api/posts
GET    /api/posts
GET    /api/posts/:id
PATCH  /api/posts/:id
POST   /api/posts/:id/publish
POST   /api/posts/:id/unpublish
POST   /api/posts/:id/archive
POST   /api/posts/:id/preview-token
POST   /api/posts/:id/seo-check
POST   /api/media
GET    /api/github/status
POST   /api/github/sync
```

Post-MVP API route:

```txt
POST   /api/posts/:id/ai
GET    /api/analytics/ga4
GET    /api/analytics/search-console
```

공개 블로그 라우트는 공개 mutation API보다 정적 렌더링과 직접 데이터 접근을 우선한다. CMS mutation은
내부적으로 GitHub Contents API, Git Data API, 또는 GraphQL API를 사용해 파일과 commit을 생성한다.

MVP는 GitHub Contents API를 기본으로 사용한다. `post + media`를 하나의 원자적 commit으로 묶어야 하는
요구가 생기면 Git Data API로 전환한다. 모든 update 요청은 file SHA 기반 optimistic locking을
사용한다.

## 17. 보안

요구사항:

- CMS 라우트는 인증이 필요하다.
- preview 라우트는 서명된 만료 token이 필요하다.
- GitHub token, AI secret, Search Console secret은 서버 측에만 둔다.
- 업로드 파일은 타입과 크기를 검증한다.
- MDX 렌더링은 신뢰할 수 없는 사용자의 임의 runtime code 실행을 허용하지 않는다.
- CMS mutation은 `content/site.json`의 `adminGithubLogin`, `adminGithubUserId`와 로그인한 GitHub
  OAuth 사용자 정보가 모두 일치할 때만 실행할 수 있다.
- GitHub username은 변경 가능하므로 `adminGithubUserId` 검증을 필수로 한다.
- GitHub write 권한은 GitHub App installation token을 기본으로 사용한다.
- GitHub App 권한은 `contents: read/write`, `metadata: read`로 제한한다.
- fine-grained PAT는 로컬 개발 fallback으로만 허용한다.
- Search Console OAuth token은 repository 파일에 저장하지 않는다. Post-MVP에서 암호화 저장소 또는
  신뢰할 수 있는 auth provider에 위임한다.
- secret은 클라이언트 번들에 포함되면 안 된다.

Preview token 정책:

- preview token은 stateless HMAC 서명 토큰이다.
- payload는 `slug`, `exp`, `contentSha`, `nonce`를 포함한다.
- 기본 TTL은 30분이다.
- 저장 또는 발행으로 `contentSha`가 바뀌면 기존 preview token은 무효화된다.
- preview 응답은 `Cache-Control: private, no-store`를 사용한다.
- preview token은 draft 글 미리보기에만 사용하고, 공개 페이지 필터를 우회해 목록/RSS/Sitemap에
  draft를 포함하면 안 된다.

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

## 18. 성능

목표:

- 공개 글 페이지 LCP는 일반적인 4G 환경에서 2.5초 미만.
- 공개 글 페이지는 정적 생성 또는 ISR cache를 사용한다.
- CMS 에디터 local autosave는 타이핑을 막지 않는다.
- 일반적인 5,000단어 이하 글의 SEO 검사는 500ms 안에 반환된다.
- GitHub API rate limit에 걸리면 CMS는 저장 실패를 명확히 표시하고 로컬 편집 상태를 보존한다.

## 19. MVP 범위

MVP에 포함:

- 모노레포 scaffolding.
- `apps/blog` 공개 렌더링.
- `apps/cms` 인증된 GitHub 기반 post CRUD.
- GitHub repository 기반 content model.
- Markdown/MDX 파일 저장과 렌더링.
- TOC 생성.
- Draft와 Publish 워크플로우.
- 기본 SEO metadata field.
- SEO Score 0-100과 rule-based SEO 검사 패널.
- RSS 생성.
- Sitemap 생성.
- robots.txt route.
- JSON-LD 생성.
- 동적 OG image route.
- GA4/GTM script 삽입과 `BlogEvent` 발행.
- CMS 게시글 화면의 공개 글, GA4, Search Console 외부 링크.
- AI 보조 기능 flag와 off 상태 UI/API 비활성화.
- 단일 관리자 GitHub OAuth 로그인.
- repository 안 `public/media` 기반 이미지 업로드.

MVP에서 미룰 수 있음:

- GA4/Search Console API 기반 통합 대시보드.
- 실제 AI 제목/발췌문/meta 생성.
- embedding 기반 내부 링크 추천.
- 예약 발행.
- 풍부한 revision diff UI.
- 다중 역할 approval system.
- 사전 렌더링된 저장형 OG 이미지.
- 외부 object storage 연동.
- 여러 작성자와 팀 권한 관리.

## 20. 마일스톤

### Milestone 1: Foundation

- pnpm + Turborepo를 초기화한다.
- `apps/blog`, `apps/cms`, `docs/`를 생성한다.
- package skeleton을 생성한다.
- 공유 TypeScript, lint, formatting, build config를 추가한다.
- `content/` 디렉터리 구조와 frontmatter schema를 추가한다.

종료 기준:

- 루트에서 `pnpm build`가 모노레포 전체에 대해 실행된다.
- 두 Next.js 앱이 로컬에서 시작된다.
- 샘플 MDX 글이 `apps/blog`에서 렌더링된다.

### Milestone 2: Content Core

- CMS GitHub 기반 post CRUD를 구현한다.
- Markdown/MDX 렌더링 패키지를 구현한다.
- 공개 post page를 구현한다.
- draft/publish 상태 변경을 구현한다.
- preview token route를 구현한다.

종료 기준:

- 운영자가 draft를 만들고, 미리보고, 발행하고, 공개 블로그에서 확인할 수 있다.

### Milestone 3: SEO Automation

- SEO engine check를 구현한다.
- metadata 생성을 구현한다.
- TOC 생성을 구현한다.
- JSON-LD를 구현한다.
- RSS를 구현한다.
- Sitemap을 구현한다.
- OG image route를 구현한다.
- GA4/GTM script 삽입과 `BlogEvent` 발행을 구현한다.
- CMS 게시글 화면에 공개 글, GA4, Search Console 외부 링크를 추가한다.

종료 기준:

- 모든 발행 글에 metadata, TOC, JSON-LD, RSS 포함, Sitemap 포함, OG image가 적용된다.
- 공개 블로그가 `article_view`, `scroll_50`, `scroll_90`, `code_copy`, `toc_click`, 링크 클릭, 검색,
  공유 이벤트를 GA4/GTM으로 전송한다.
- CMS에서 게시글별 외부 분석 콘솔로 이동할 수 있다.

### Milestone 4: AI Assistance

MVP 이후 단계다.

- AI provider wrapper를 구현한다.
- CMS에 개요, 제목, 발췌문, 메타 설명 AI action을 추가한다.
- 내부 링크 추천을 추가한다.
- CMS 설정에서 AI 보조 기능 on/off를 구현한다.

종료 기준:

- 운영자가 AI 보조 기능을 켠 경우 AI 제안을 요청하고 명시적으로 적용할 수 있다.
- AI 보조 기능이 꺼진 경우 AI UI와 API 호출이 비활성화된다.

### Milestone 5: Analytics

- MVP 이후 단계다.
- GA4 Data API 연결을 구현한다.
- Search Console API 연결을 구현한다.
- 게시글별 통합 지표 대시보드를 구현한다.
- 개선 기회 탐지를 구현한다.

종료 기준:

- 운영자가 GA4 사용자 행동 지표와 Search Console 검색 성과를 한 화면에서 보고 업데이트할 글을 찾을
  수 있다.

## 21. 테스트 요구사항

Unit test:

- Markdown heading 추출.
- TOC 생성.
- SEO check.
- SEO Score 가중치 계산.
- internal link 존재 여부 검사.
- JSON-LD 생성.
- RSS 생성.
- Sitemap 생성.
- robots.txt 생성.
- reading time 계산.
- frontmatter schema validation.
- 잘못된 status 거부.
- `publishedAt` 없는 published 처리.
- unsafe MDX 차단.
- Tiptap image node의 Markdown image 직렬화.
- `BlogEvent` 타입 validation.
- GA4/Search Console 외부 링크 생성.

Integration test:

- draft 생성.
- GitHub API mock을 통한 MDX 파일 commit.
- post 발행.
- 공개 블로그가 발행 글을 렌더링.
- draft가 공개 페이지에 나타나지 않음.
- preview token이 draft를 렌더링.
- SEO check가 예상한 blocking/warning 상태를 반환.
- GitHub API conflict 발생 시 CMS가 충돌 상태를 반환.
- 이미지 업로드 후 `public/media/posts/<slug>/`에 commit되고 본문에 public path가 삽입됨.
- 공개 글에서 GA4/GTM 이벤트 helper가 호출됨.
- CMS 게시글 화면에 공개 글, GA4, Search Console 외부 링크가 표시됨.

End-to-end test:

- 운영자가 CMS에 로그인한다.
- 운영자가 글을 생성한다.
- 운영자가 SEO check를 실행한다.
- 운영자가 발행한다.
- 독자가 공개 post를 연다.
- 독자가 제목, 본문, TOC, metadata, OG tag를 확인한다.
- 독자가 스크롤, TOC 클릭, 코드 복사, 링크 클릭을 수행하면 GA 이벤트가 전송된다.

Manual QA:

- 긴 제목의 OG image 줄바꿈.
- GitHub OAuth 로그인 사용자가 `adminGithubLogin`과 다를 때 접근 차단.
- AI 보조 기능 off 상태에서 AI UI와 API 호출 비활성화.
- MDX compile error.
- slug 중복.
- 이미지 2MB 초과 업로드 차단.
- 이미지 업로드 실패 시 본문에 blob URL이 남지 않음.
- GitHub commit 성공 후 revalidate 실패 시 재시도 UI 표시.

## 22. 수용 기준

초기 프로젝트는 다음 조건을 만족하면 완료로 본다.

- 운영자가 CMS에서 Markdown/MDX draft를 작성할 수 있다.
- CMS가 draft를 브라우저 local draft backup에 자동 저장한다.
- 운영자가 Save 버튼을 누르면 CMS가 draft를 GitHub repository에 commit한다.
- CMS가 live preview와 생성된 TOC를 보여준다.
- CMS가 blocking error와 warning이 포함된 SEO check를 보여준다.
- 운영자가 post를 발행할 수 있다.
- 발행된 post가 공개 블로그에 나타난다.
- draft post는 공개 페이지에 나타나지 않는다.
- 발행된 post page에 SEO metadata, JSON-LD, RSS 포함, Sitemap 포함, OG image가 적용된다.
- 발행된 post page에 TOC와 reading time이 표시된다.
- CMS 설정에서 AI 보조 기능을 켜고 끌 수 있다.
- AI 보조 기능이 꺼져 있으면 CMS가 AI 추천 UI와 AI API 호출을 비활성화한다.
- 루트에서 monorepo build와 test가 실행된다.

## 23. 확정 결정

- 운영 모델: 1인 블로그.
- CMS 사용자: 단일 관리자 1명.
- 인증: GitHub OAuth. 로그인한 GitHub username과 immutable user id가 `content/site.json`의
  `adminGithubLogin`, `adminGithubUserId`와 모두 일치해야 한다.
- 콘텐츠 저장: GitHub repository의 main branch에 직접 commit.
- 공개 여부: MDX frontmatter의 `status`로만 판단.
- 발행 상태: `draft`, `published`, `archived`만 사용한다.
- 미디어 저장: MVP에서는 repository 안 `public/media`에 commit한다.
- 예약 발행: MVP에서 제외한다.
- GA4/Search Console API 기반 통합 대시보드: MVP 이후로 미룬다.
- AI 추천: 기본 off. CMS 설정에서 on/off 가능해야 한다.
- MDX custom interactive component: MVP에서는 허용하지 않고, 사전에 등록된 안전한 컴포넌트만
  렌더링한다.
- GitHub API rate limit 또는 저장 실패: CMS는 편집 중인 내용을 브라우저 local draft backup에
  보존한다.

## 24. 추천 첫 백로그 티켓

1. pnpm, Turborepo, 공유 TypeScript config, linting, 두 Next.js 앱으로 모노레포를 scaffold한다.
2. `content/` 디렉터리, post frontmatter schema, authors/categories/tags/site 설정 파일을 추가한다.
3. `@mdx-js/mdx`, remark/rehype, shiki, reading-time을 감싼 `packages/markdown`를 만든다.
4. GitHub content adapter 인터페이스와 로컬 파일 adapter를 만든다.
5. GitHub Contents API 기반 read/list/create/update commit을 구현한다.
6. SHA conflict 처리와 local draft backup을 구현한다.
7. CMS post list와 edit form을 만든다.
8. publish/unpublish/archive mutation을 만든다.
9. 발행된 post를 기반으로 공개 블로그 post rendering을 만든다.
10. draft preview token을 추가한다.
11. core check와 metadata generation을 가진 `packages/seo-engine`을 만든다.
12. RSS, Sitemap, robots.txt, JSON-LD route를 추가한다.
13. 동적 OG image generation을 추가한다.
14. AI feature flag off 상태 UI/API 비활성화를 구현한다.
15. Tiptap 기반 CMS editor shell과 Tiptap JSON ↔ MDX 변환 레이어를 만든다.
16. 이미지 업로드, webp 변환, Markdown image 삽입 플로우를 구현한다.
