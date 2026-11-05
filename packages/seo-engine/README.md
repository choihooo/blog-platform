# SEO Engine Package

`packages/seo-engine`는 rule-based SEO scoring과 generated SEO output contract를 소유한다.

## 제공 기능

- 발행 글 SEO subject 정규화
- page metadata, JSON-LD, RSS, Sitemap, robots, OG image payload 생성
- 글 표지가 있으면 Open Graph·Twitter·SEO report에 같은 절대 이미지 URL을 사용하고, 표지가 없으면
  `/og/:slug` 생성 이미지로 fallback
- slug 없는 사이트 공유는 현재 캐릭터의 `/brand/hozorica-card-v2.webp` 기본 카드를 사용
- 0-100 rule-based SEO score와 blocking/warning/pass report 생성

## 검증

```sh
pnpm --filter @blog-platform/seo-engine typecheck
pnpm --filter @blog-platform/seo-engine lint
pnpm --filter @blog-platform/seo-engine test
```
