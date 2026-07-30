# SEO Engine Package

`packages/seo-engine`는 rule-based SEO scoring과 generated SEO output contract를 소유한다.

## 제공 기능

- 발행 글 SEO subject 정규화
- page metadata, JSON-LD, RSS, Sitemap, robots, OG image payload 생성
- 0-100 rule-based SEO score와 blocking/warning/pass report 생성

## 검증

```sh
pnpm --filter @blog-platform/seo-engine typecheck
pnpm --filter @blog-platform/seo-engine lint
pnpm --filter @blog-platform/seo-engine test
```
