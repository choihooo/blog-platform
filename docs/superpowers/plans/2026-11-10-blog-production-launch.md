# 블로그 실제 운영·배포 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 현재 승인된 블로그 디자인과 기능을 유지한 채 실제 글을 발행하고 Vercel에서 운영할 수 있는 첫 버전을 만든다.

**Architecture:** 현재 루트 Next.js 앱을 그대로 운영한다. 글은 저장소의 MDX로 관리하고 GitHub 변경 사항을 Vercel에서 빌드한다. 서버·DB·CMS를 추가하지 않으며, 검색은 공개 글의 제목·요약을 클라이언트에서 검색한다. 배포는 Git의 미리보기와 Production 단계를 구분한다. [Vercel Git 배포 문서](https://vercel.com/docs/git)

**Tech Stack:** 현재 Next.js 16.3.4 / React 19.2.8 / TypeScript / MDX / Tailwind 4 / Shiki 유지. 운영 런타임은 Node.js 24.x, 패키지 관리자는 pnpm 10.28.1로 고정한다. Vercel은 Node 24.x를 지원한다. [공식 런타임 문서](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

**Spec:** 루트 [DESIGN.md](../../../DESIGN.md), [AGENTS.md](../../../AGENTS.md), 이 대화의 실제 운영·배포 계획 요청. 계획 작성 후 사용자가 이 계획의 실행과 디자인 유지를 요청했으므로, 현재는 해당 범위의 구현·검증·배포를 진행한다.

## 현재 상태와 첫 버전 범위

- 이미 실제 Next.js 앱이다. 다시 만드는 작업이 아니라 콘텐츠·배포 경계·공개 설정을 마무리하는 작업이다.
- 메인, 상세, 연도별 목록, 300ms 디바운스 검색, 모바일 전체 화면 검색, 결과 영역 스피너, 코드 복사, 접이식 목차가 구현되어 있다.
- 글 9편은 모두 `demo: true`다. 2026년 5편, 2025년 2편, 2024년 2편이다.
- 루트 메타데이터는 `noindex, nofollow`이며 사이트맵·robots 파일·대표 OG 이미지·파비콘은 아직 준비되지 않았다.
- `/color-lab`, `/design-lab/*`가 현재 접근 가능하다. 목록에서만 지우는 것으로 공개 경로가 사라지지는 않는다.
- 이전 레포 아카이브는 로컬에서 약 19GB다. Git 작업 트리에도 기존 파일 삭제와 새 앱 파일이 함께 존재하므로 배포 전에 변경 범위를 분리해야 한다.

**첫 버전 포함:** 현재 읽기 화면, 실제 MDX 글 발행, 검색·목차·복사, 검색/공유 메타데이터, Git 기반 미리보기·정식 배포.

**첫 버전 이후:** CMS, 로그인, DB, 댓글, 방문 통계, RSS, 태그 필터. 필요가 생기면 별도 작업으로 다룬다.

## Global Constraints

- SUIT 700, 본문 15px, 인라인 코드 14.125px, 코드 블록 14px을 유지한다.
- 최대 바깥 너비 672px / 콘텐츠 624px / 좌우 패딩 24px과 기존 여백·라운드는 `DESIGN.md`를 따른다.
- 당근 주황 `#FF6F0F`는 최호·호감·호흡·호기심의 ‘호’ 네 글자에만 사용한다.
- 아카이브 원본·기존 Git 이력을 삭제하거나 덮어쓰지 않는다. 아카이브를 새 배포 커밋에 통째로 포함하지 않는다.
- 초안과 예시 글을 목록에서 숨기는 것뿐 아니라 공개 상세 URL에서도 노출하지 않는다.
- 운영자 개인 계정·글의 사실관계는 제공받은 정보만 사용한다. 예시 글을 실제 경험담으로 바꾸어 발행하지 않는다.

## Review Focus

1. 초안·예시 상세 URL, 정적 비교 HTML을 직접 열어도 공개되지 않아야 한다 → Task 1의 빌드 결과·HTTP 검증.
2. 공개 글이 0개여도 빌드와 빈 목록이 정상이어야 한다 → Task 2의 빈 콘텐츠 검증.
3. 미리보기/Production 환경과 도메인이 달라도 robots·canonical이 뒤섞이지 않아야 한다 → Task 3의 환경별 메타데이터 검증.
4. 실제 모바일 키보드·한글 조합·검색 중 닫기에서도 화면과 검색 상태가 복원되어야 한다 → Task 4의 UI 검증.
5. 로컬 Node 25에서만 통과하거나 19GB 아카이브가 배포에 섞이지 않아야 한다 → Task 1의 Git/산출물 점검, Task 4의 Node 24 클린 설치 검증.

## 파일 구조와 책임

| 경로 | 작업과 책임 |
| --- | --- |
| `.gitignore`, `.vercelignore` | 로컬 아카이브·이전 시안·생성물을 업로드 대상에서 제외 |
| `fixtures/demo-posts/`, `docs/reference/design-lab/` | 예시 글과 비교 자료를 공개 경로 밖에서 보존 |
| `app/_lab/color-lab/` | 비교용 React 화면을 Next.js 비공개 폴더로 보존 |
| `lib/posts.ts`, `lib/posts.test.mjs` | 공개 글 메타데이터 검증·목록 수집 테스트 |
| `app/blog/_drafts/`, `app/blog/_template/page.mdx` | 초안 보관·실제 글 작성 템플릿 |
| `lib/site.ts`, `lib/site.test.mjs` | 사이트 URL·색인 가능 여부의 공통 기준 |
| `app/layout.tsx`, `components/PostHeader.tsx` | 메타데이터·공유 URL·글 머리 정보 |
| `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`, `app/icon.svg` | 검색/공유용 공개 파일 |
| `.nvmrc`, `package.json`, `.github/workflows/ci.yml` | 재현 가능한 런타임과 필수 검증 |
| `docs/publishing.md`, `docs/deployment.md`, `README.md` | 글 발행·도메인·배포·되돌리기 절차 |

## Task 1: 운영 코드와 보존 자료 분리

**Files:** 위 배포 제외 파일, `app/blog/`의 예시 9개 폴더, `app/color-lab/`, `public/design-lab/`, `docs/upstream.md`.

**Interfaces:** 이후 작업에서 `app/blog/<slug>/page.mdx`는 공개 글만 의미한다. 보존 자료는 공개 라우트·정적 파일 경로를 갖지 않는다.

- [x] `.gitignore`에 `archive/2026-11-10-legacy/`, `preview/`, 재생성된 이전 `apps/` 등 현재 앱이 쓰지 않는 로컬 자료를 명시한다. `archive/manifest.json`은 유지한다. `.vercelignore`에도 로컬 아카이브·시안을 제외한다. Git 배포에서는 `.vercelignore`만 믿지 않고 실제 추적 파일 목록을 확인한다.
- [x] 예시 9편은 `fixtures/demo-posts/`로, 비교 React 페이지는 `app/_lab/color-lab/`로, `public/design-lab/`는 `docs/reference/design-lab/`로 옮겨 보존한다. 재생성 스크립트·관련 문서 경로도 함께 맞춘다.
- [x] 기존 원본·데모의 출처와 재사용 조건을 확인하고 필요한 고지 및 SUIT 폰트 라이선스를 보존한다. 확인 결과는 `docs/upstream.md`에 기록한다.
- [x] `git diff --name-status`, `git diff --cached --stat`, `git ls-files`로 이전 파일 삭제와 새 운영 앱을 따로 검토한다. `git add .`로 아카이브를 통째로 올리지 않는다.
- [x] `pnpm build` 후 라우트 표에 예시 글·`/color-lab`가 없고, `public/`에 비교 HTML이 없으며, 로컬 Production 서버에서 이전 예시 URL·비교 URL이 404인지 확인한다. 아카이브 파일 해시는 원래 manifest와 대조해 원본 보존을 확인한다.

## Task 2: 실제 글 발행 경로 완성

**Files:** `lib/posts.ts`, 새 `lib/posts.test.mjs`, `app/blog/_template/page.mdx`, `app/blog/_drafts/`, `docs/publishing.md`.

**Interfaces:** 기존 `Post`와 `getPosts(): Promise<Post[]>`를 유지한다. 메타데이터 검증은 `validatePostMeta(value: unknown, slug: string): PostMeta`로 분리한다. 초안은 `_drafts` 아래, 발행 글은 `app/blog/<slug>/page.mdx`다.

- [x] `validatePostMeta` 테스트를 먼저 작성한다. 유효한 제목·요약·실제 달력 날짜는 통과하고, 제목 누락·공백 제목·잘못된 날짜는 slug를 포함한 오류로 실패하도록 검증한다.
- [x] 검증 함수를 구현하고 `getPosts`에서 적용한다. 잘못된 글을 조용히 누락시키지 않는다. 날짜는 `YYYY-MM-DD`, 공개 slug는 폴더명과 URL이 일치하도록 한다.
- [x] 글이 0개인 상태에서 빌드·빈 목록이 정상이고, `_template`·`_drafts`가 목록과 빌드 라우트 모두에서 빠지는지 확인한다. 날짜 연도 경계·한글 검색은 기존 `pnpm test:posts`도 실행한다.
- [x] 템플릿과 `docs/publishing.md`에 작성 → 로컬 확인 → Git 변경 → 미리보기 확인 → Production 반영 절차를 기록한다. MDX는 신뢰하는 운영자만 편집한다.
- [x] 사용자가 제공한 실제 첫 글을 `_drafts`에서 검토하고 발행 경로로 옮긴다. 내용이 준비되지 않았으면 빈 목록을 허용하고, 예시 글을 대신 실제 글로 발행하지 않는다.

## Task 3: 검색·공유·도메인 기준 설정

**Files:** `lib/site.ts`, `lib/site.test.mjs`, `app/layout.tsx`, `app/blog/_template/page.mdx`, 실제 발행 글의 `page.mdx`, `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`, `app/icon.svg`, `.env.example`.

**Interfaces:** `getSiteConfig(env: { SITE_URL?: string; SITE_INDEXABLE?: string; VERCEL_ENV?: string }): { url: URL; indexable: boolean }`와 `getPostMetadata(post: PostMeta, slug: string): Metadata`. 운영 URL은 `SITE_URL`, 색인 허용은 Production 환경의 `SITE_INDEXABLE=true`일 때만 활성화한다. `PostMeta`는 기존 `lib/posts.ts`, `Metadata`는 Next.js 타입을 사용한다.

- [x] 환경 테스트를 먼저 작성한다. Preview는 색인 금지, Production도 명시적으로 허용하기 전에는 색인 금지, 허용된 Production만 색인 가능해야 한다. 운영 URL 누락·잘못된 URL은 명확히 실패해야 한다.
- [x] 공통 설정을 구현하고 `metadataBase`, 글별 canonical, Open Graph URL, sitemap URL을 같은 기준으로 생성한다. 글별 canonical은 `/blog/<slug>`를 사용한다. 템플릿과 실제 글의 `export const metadata`는 `getPostMetadata(post, slug)`로 생성하고, 헤더 컴포넌트 안에서 메타데이터를 처리하지 않는다. 미리보기 URL이 운영 sitemap에 섞이지 않게 한다.
- [x] `app/robots.ts`와 `app/sitemap.ts`를 추가한다. 사이트맵에는 공개 홈과 실제 발행 글만 포함한다. noindex는 접근 통제가 아니므로 비공개 초안은 계속 private folder에 둔다.
- [x] 기존 이름·SUIT·확정 색상으로 파비콘과 대표 공유 이미지를 만든다. 새 랜딩 디자인은 하지 않는다. 글 제목·설명·공유 미리보기와 이미지 로딩을 확인한다.
- [x] 로컬 서버의 HTML·robots·sitemap에서 Preview/색인 비허용 Production/색인 허용 Production의 세 상태를 검증한다. 첫 실제 글이 공개 준비되기 전까지 색인을 켜지 않는다. [Next.js 메타데이터 문서](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)

## Task 4: 클린 환경과 출시 전 검증

**Files:** `.nvmrc`, `package.json`, `.github/workflows/ci.yml`, 필요한 기존 테스트 파일.

**Interfaces:** Node `24.x`, pnpm `10.28.1`, 설치 `pnpm install --frozen-lockfile`, 빌드 `pnpm build`. Next.js 기본 출력 디렉터리를 사용한다.

- [x] `.nvmrc`를 24로, `engines.node`를 `24.x`로, `packageManager`를 `pnpm@10.28.1`로 고정한다. 아카이브를 제외한 운영 소스만으로 별도 임시 디렉터리에 클린 설치하여 누락 파일을 찾는다.
- [x] Node 24에서 `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test:article`, `pnpm test:posts`, 신규 메타데이터/글 검증 테스트, `pnpm build`를 실행한다. TypeScript 테스트의 Node 실행 방식도 이 런타임에서 확인한다.
- [x] CI에 같은 설치·검증을 등록한다. 검사 실패 시 Production 반영을 진행하지 않는다. 아직 합의되지 않은 라이브러리 버전 업그레이드는 섞지 않는다.
- [x] 데스크톱·390px 모바일·실제 모바일 키보드·다크 모드에서 메인/상세, 긴 제목·긴 코드·빈 검색 결과, 검색 중 닫기/재열기·IME, 목차 이동, 복사 성공/실패 안내를 확인한다. 모바일 검색은 전체 화면이어야 한다.
- [x] 브라우저 에러·404 에셋·가로 넘침을 확인하고, 현재 `DESIGN.md`와 비교한다. 실제 단말 검증 여부는 에뮬레이션과 구분하여 기록한다.

## Task 5: Vercel 미리보기와 정식 배포

**Files:** `docs/deployment.md`, `README.md`, 필요 시 최소 `vercel.json`. 외부 설정: GitHub와 Vercel 프로젝트.

**Interfaces:** 저장소 루트의 Next.js 앱을 배포한다. Framework `Next.js`, Root Directory `.`, Install `pnpm install --frozen-lockfile`, Build `pnpm build`, Node `24.x`. 사용자에게 이미 연결된 프로젝트가 있는지는 실행 단계에서 확인한다.

- [ ] 현재 저장소 연결과 배포 프로젝트를 확인하고, 이미 있는 연결을 우선 사용한다. 없다면 정리한 앱을 GitHub에 반영하고 Vercel 프로젝트와 연결한다. 이 외부 작업은 실제 실행 요청 이후에 진행한다.
- [ ] 작업 브랜치로 미리보기 배포를 만든다. 실제 글의 목록·검색·목차·복사·새로고침·직접 상세 URL 접근을 해당 배포 URL에서 검증한다. 로컬 통과만으로 완료 처리하지 않는다.
- [ ] 도메인이 정해지지 않았으면 우선 프로젝트의 `vercel.app` 주소로 검증한다. 개인 도메인이 있으면 연결하고 HTTPS·대표 호스트·www/비-www 리다이렉트를 확인한다. 도메인 구매는 이 계획에 포함하지 않는다.
- [ ] 배포 URL을 `SITE_URL`에 설정하고 실제 글 준비가 끝나면 Production에서 색인을 허용한다. 미리보기 검증 후 Production 브랜치로 반영하고 배포 완료 상태와 실제 공개 URL의 HTML/메타데이터를 다시 확인한다.
- [ ] `docs/deployment.md`에 프로젝트·운영 URL·환경 변수 이름·배포 확인 항목·직전 정상 배포로 되돌리는 절차를 기록한다. 첫 배포 이후 변경부터는 미리보기 확인 → Production 반영 순서를 사용한다.

## 출시 완료 기준

- 공개 홈·실제 글 URL이 열리고, 날짜에 따른 연도 구분과 검색이 실제 글 기준으로 동작한다.
- 예시·초안·비교 화면·아카이브는 운영 사이트에서 접근할 수 없다.
- 모바일 검색·목차·복사와 키보드 조작이 유지되고 승인된 디자인이 보존된다.
- canonical·robots·sitemap·OG가 운영 주소를 가리키며 미리보기는 색인되지 않는다.
- 클린 Node 24 빌드/검증이 통과하고, 이후 글 발행·배포·롤백 방법이 문서화되어 있다.

## 실행 순서와 선택 사항

Task 1 → 2 → 3 → 4 → 5 순서로 진행한다. 변경들이 같은 앱과 발행 규칙을 공유하므로 첫 실행은 현재 대화에서 순서대로 진행하는 방식을 추천한다.

실제 첫 글, 사용할 도메인, GitHub/Vercel 프로젝트는 실행 시 확인할 입력이다. 도메인이 없어도 미리보기 검증까지는 진행할 수 있다. CMS·기능 확장보다 현재 앱을 안정적으로 공개하는 것이 이번 출시의 목표다.
