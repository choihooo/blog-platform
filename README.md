# 블로그 플랫폼

단일 운영자의 공개 포트폴리오·블로그와 비공개 콘텐츠 관리 도구다. 세 앱은 독립 실행·배포하고, 공유
콘텐츠·저장소·SEO·분석·검색 로직은 core 패키지가 소유한다.

## 구성

| 경로              | 책임                                           |
| ----------------- | ---------------------------------------------- |
| `apps/blog`       | 공개 화면·Next.js 라우트·캐시·챗봇 UI          |
| `apps/cms`        | 관리자 인증·편집·미디어 업로드·발행·분석 화면  |
| `apps/rag-worker` | Cloudflare D1·Workers AI·Vectorize 검색·동기화 |
| `packages/core`   | 콘텐츠 모델·D1/R2 저장·SEO·analytics·검색 계약 |
| `content`         | 사이트·taxonomy 설정과 legacy 원본             |
| `scripts`         | 개발·마이그레이션·포트폴리오 출력 진입점       |
| `specs`, `docs`   | 기능 계약·현재 작업 가이드·설계 및 운영 이력   |

프로젝트·프로필·이력서의 TypeScript 원본은 `packages/core/src/content/catalog`에서 관리한다. 앱끼리
내부 소스를 가져오지 않는다. 공통 코드는 core의 용도별 subpath로 가져온다.

## 개발과 검사

```sh
pnpm install --frozen-lockfile
pnpm --filter @blog-platform/core build
pnpm dev:blog
pnpm dev:cms
```

Blog는 기본 3000, CMS는 3001, 로컬 Worker는 8787 포트를 사용한다. `pnpm dev:cms`는 기존 Worker 개발
설정을 사용하므로 원격 binding 여부를 먼저 확인한다. 운영 자격 증명과 `.env`는 커밋하지 않는다. 공개
콘텐츠 조회에는 D1 설정 또는 `BLOG_CONTENT_PROXY_URL`이 필요하다.

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Turbo는 core를 먼저 빌드한 뒤 앱을 검사한다. Worker build는 `wrangler deploy --dry-run`이며 실제
배포가 아니다. 상세 규칙은 [개발 작업 가이드](docs/development-guide.md)와 각 앱의 AGENTS를 따른다.

## 콘텐츠와 공개 경로

CMS 글 CRUD는 D1, 운영 이미지 저장은 R2를 사용한다. 개발 환경에서 R2 업로드 설정이 없을 때만
미디어를 로컬 `public/media`에 저장한다. 본문은 core의 version-1 structured JSON을 사용하며 Markdown
fallback·편집·공개 렌더링은 같은 모델을 공유한다.

Blog는 `BLOG_CONTENT_PROXY_URL`이 있으면 CMS `/api/public-content`를, 없으면 D1/R2를 직접 조회한다.
공개 목록·본문·RSS·sitemap·검색에는 발행 글만 포함한다. 저장소 장애를 빈 목록이나 404로 바꾸지
않는다.

기존 `/blog`·소개·프로젝트·이력서와 티스토리/이전 host redirect, 보관 실험 페이지를 유지한다. Save는
저장만 수행한다. Publish/Unpublish/Archive는 저장 후 공개 갱신을 요청하며 저장 성공과 갱신 실패를
구분한다. 기존 deploy hook 우선순위·revalidate·재시도 계약을 유지한다.

인증과 서버 action은 CMS가 소유하고 Next.js 캐시는 Blog가 소유한다. Worker의 검색 토큰과 관리자
동기화 토큰은 구분한다. 원격 발행·데이터 변경·배포·Vectorize 동기화는 별도 명시 요청이 필요하다.
