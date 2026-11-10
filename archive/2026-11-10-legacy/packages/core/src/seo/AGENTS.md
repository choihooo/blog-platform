# SEO Engine 공유 패키지 작업 지침

## 책임

page metadata, JSON-LD, RSS, sitemap, robots, OG image payload와 rule-based SEO report를 담당한다.

- 생성 결과는 결정적이어야 하며 테스트에서 네트워크에 의존하지 않는다.
- metadata, canonical URL, JSON-LD의 공개 계약을 임의로 바꾸지 않는다.
- score 규칙을 바꾸면 blocking, warning, pass fixture와 report 테스트를 함께 갱신한다.
- 공개 글·프로젝트·이력서의 canonical route가 서로 충돌하지 않게 한다.
- 사용자 입력을 JSON-LD나 metadata에 넣을 때 escape와 필수 필드 검증을 유지한다.
- `site.contentPath`가 있으면 public URL은 해당 경로를 사용하고, 없으면 기본 `/posts/:slug`를
  사용한다. `apps/blog`의 rewrite, sitemap, RSS, OG route와 함께 확인한다.
- `evaluateSeo`의 기본 `evaluatedAt`은 현재 시각이므로 snapshot·fixture 비교에서는 고정된 시간을
  전달한다. 네트워크 없이도 metadata, JSON-LD, feed, sitemap, robots 결과가 결정적으로 검증되게
  한다.

## 검증

```sh
pnpm --filter @blog-platform/core format:check
pnpm --filter @blog-platform/core lint
pnpm --filter @blog-platform/core typecheck
pnpm --filter @blog-platform/core test
pnpm --filter @blog-platform/core build
```
