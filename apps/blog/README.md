# Blog App

공개 읽기 전용 블로그 앱이다. `content/posts/*.mdx` 중 `status: published`인 글만 공개 표면에
노출한다.

## Generated Outputs

- `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/og/[slug]`는 repository에 파일을 commit하지 않고
  route handler에서 현재 published content와 `@blog-platform/seo-engine` 결과를 기준으로 응답한다.
- Draft와 archived 글은 홈, 상세, taxonomy route, RSS, Sitemap, OG route에서 제외된다.

## Analytics

- `content/site.json`의 analytics provider와 public env 값을 기준으로 provider 초기화 payload를
  준비한다.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 있으면 GA4 script를, `NEXT_PUBLIC_GTM_ID`가 있으면 GTM script를
  로드한다.
- 공개 독자 이벤트는 `@blog-platform/analytics`의 privacy-safe payload 계약을 사용한다.
- GA4/Search Console API 조회나 자체 분석 저장소는 없다.

## Revalidation

- `POST /api/revalidate`는 `BLOG_REVALIDATE_SECRET`으로 보호되며 CMS가 전달한 public path를
  `revalidatePath`로 갱신한다.
- repository-backed file content를 새 배포에 포함하려면 Vercel Git 연동 자동 배포 또는 CMS의
  `BLOG_DEPLOY_HOOK_URL`/`VERCEL_DEPLOY_HOOK_URL` 설정이 필요하다.
