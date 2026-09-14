# SEO Engine 공유 패키지 작업 지침

## 책임

page metadata, JSON-LD, RSS, sitemap, robots, OG image payload와 rule-based SEO report를 담당한다.

- 생성 결과는 결정적이어야 하며 테스트에서 네트워크에 의존하지 않는다.
- metadata, canonical URL, JSON-LD의 공개 계약을 임의로 바꾸지 않는다.
- score 규칙을 바꾸면 blocking, warning, pass fixture와 report 테스트를 함께 갱신한다.
- 공개 글·프로젝트·이력서의 canonical route가 서로 충돌하지 않게 한다.
- 사용자 입력을 JSON-LD나 metadata에 넣을 때 escape와 필수 필드 검증을 유지한다.

## 검증

```sh
pnpm --filter @blog-platform/seo-engine format:check
pnpm --filter @blog-platform/seo-engine lint
pnpm --filter @blog-platform/seo-engine typecheck
pnpm --filter @blog-platform/seo-engine test
pnpm --filter @blog-platform/seo-engine build
```
