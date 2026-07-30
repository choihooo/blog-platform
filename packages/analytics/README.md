# Analytics Package

`packages/analytics`는 GA4/GTM event emission contract와 analytics link helper를 소유한다.

## 제공 기능

- `page_view`, `post_read`, `heading_navigate`, `external_link_click`, `share_attempt` 이벤트 정규화
- GA4/GTM-compatible payload 생성
- disabled provider 상태 처리
- CMS용 공개 글, GA4, Search Console 외부 링크 생성

## 검증

```sh
pnpm --filter @blog-platform/analytics typecheck
pnpm --filter @blog-platform/analytics lint
pnpm --filter @blog-platform/analytics test
```
