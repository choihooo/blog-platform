# Analytics 공유 패키지 작업 지침

## 책임

GA4·GTM 이벤트 계약, 링크 분류, 스크롤 milestone, CMS용 외부 링크 생성을 담당한다.

- 이벤트 이름과 payload shape는 기존 계약과 호환되게 유지한다.
- disabled provider에서도 호출부가 깨지지 않게 한다.
- 내부 링크·외부 링크·공개 글 링크 분류 규칙을 임의로 섞지 않는다.
- 이벤트 중복 방지와 개인정보 최소 수집 원칙을 유지한다.
- 실제 GA4나 Search Console에 쓰기 요청을 보내는 테스트를 추가하지 않는다.

## 검증

```sh
pnpm --filter @blog-platform/analytics format:check
pnpm --filter @blog-platform/analytics lint
pnpm --filter @blog-platform/analytics typecheck
pnpm --filter @blog-platform/analytics test
pnpm --filter @blog-platform/analytics build
```
