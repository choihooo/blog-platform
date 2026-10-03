# CMS App

단일 운영자용 비공개 CMS다. GitHub 관리자 검증을 통과한 사용자만 repository content mutation을
실행할 수 있다.

## Publish Workflow

- Save는 draft 저장만 수행하고 public refresh를 실행하지 않는다.
- Publish는 slug와 `publishedAt`을 보정한 뒤 `prepare-publish` intent로 post MDX를 저장한다.
- Unpublish와 Archive는 repository 파일을 유지한 채 status만 `draft` 또는 `archived`로 바꾼다.
- Publish, Unpublish, Archive 이후 public refresh target을 계산하고, refresh 실패는 repository
  commit 성공과 분리해서 표시한다.
- 예약 발행, 승인 workflow, CMS database, RSS/Sitemap 파일 commit은 MVP 범위가 아니다.

## SEO와 분석 링크

- 공개 Blog의 remote 소스는 `GET /api/public-content`를 사용한다. 목록 응답은
  `{ posts, total, categories }`이며 `page`, `limit`(최대 100), `tag`, `category`, `query`를 받는다.
  `total`은 필터를 적용한 전체 공개 글 수다. 단건은 `slug`로 조회한다.
- 글 미존재는 404, 저장소 오류는 502로 응답한다. D1 연결 설정 누락도 저장소 오류다. 오류 응답에는
  공개 성공 캐시 헤더를 붙이지 않는다.
- Blog가 remote 모드이면 페이지네이션 계약 변경 배포 순서는 CMS → Blog다. 기존 Blog는 추가된 `total`
  필드를 무시하므로 CMS를 먼저 배포해도 호환된다. D1/R2 직접 조회 모드에서는 Blog를 독립적으로
  배포할 수 있으며 CMS 화면을 통한 배포는 필요 없다.

- Editor sidebar는 현재 editor document 기준의 SEO score, blocking issue, warning, 검색 미리보기를
  표시한다.
- 발행 글에는 공개 글 링크를 제공하고, GA4/Search Console 설정이 없으면 비활성 이유를 표시한다.
- CMS는 GA4/Search Console 지표를 직접 조회하거나 저장하지 않는다.

## Security Environment

- `PREVIEW_TOKEN_SECRET`: CMS가 draft preview URL을 발급할 때 사용하는 HMAC secret이다. Blog app에도
  같은 값이 설정되어야 한다.
- `BLOG_DEPLOY_HOOK_URL` 또는 `VERCEL_DEPLOY_HOOK_URL`: publish/unpublish/archive 이후 공개 블로그
  Vercel 배포를 다시 트리거한다. 파일 기반 content 운영에서는 이 방식을 권장한다.
- `BLOG_REVALIDATE_URL`, `BLOG_REVALIDATE_SECRET`: 공개 블로그의 `/api/revalidate`를 직접 호출해
  대상 path를 revalidate한다. 이미 배포된 파일을 다시 검증하는 용도이며, 새 repository commit을
  배포에 포함하려면 deploy hook 또는 Git 연동 자동 배포가 필요하다.
- `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID`, `GITHUB_APP_PRIVATE_KEY`: GitHub App installation token
  발급에 필요한 값이다. 누락, invalid private key, unauthorized, rate limit 응답은 repository
  failure로 정규화된다.
- `GITHUB_TOKEN`, `GITHUB_APP_PRIVATE_KEY`, `PREVIEW_TOKEN_SECRET`, `NEXTAUTH_SECRET`, `AUTH_SECRET`
  값은 CMS action/repository failure message에서 redaction 대상이다.
