# Blog App

공개 읽기 전용 블로그 앱이다. `content/posts/*.mdx` 중 `status: published`인 글만 공개 표면에
노출한다.

## Generated Outputs

- `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/og/[slug]`는 repository에 파일을 commit하지 않고
  route handler에서 현재 published content를 기준으로 응답한다.
- Draft와 archived 글은 홈, 상세, taxonomy route, RSS, Sitemap, OG route에서 제외된다.
