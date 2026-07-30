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
- 공개 독자 이벤트는 `@blog-platform/analytics`의 privacy-safe payload 계약을 사용한다.
- GA4/Search Console API 조회나 자체 분석 저장소는 없다.
