# Analytics 공유 패키지 작업 지침

## 책임

GA4·GTM 이벤트 계약, 링크 분류, 스크롤 milestone, CMS용 외부 링크 생성을 담당한다.

- 이벤트 이름과 payload shape는 기존 계약과 호환되게 유지한다.
- disabled provider에서도 호출부가 깨지지 않게 한다.
- 내부 링크·외부 링크·공개 글 링크 분류 규칙을 임의로 섞지 않는다.
- 이벤트 중복 방지와 개인정보 최소 수집 원칙을 유지한다.
- 실제 GA4나 Search Console에 쓰기 요청을 보내는 테스트를 추가하지 않는다.
- `normalizeGa4PostPerformance`와 `normalizeGscPostPerformance`는 canonical URL 기준으로 CMS post와
  외부 지표를 매칭한다. URL의 query/hash, 음수, NaN, 누락 지표 정규화 규칙을 보존한다.
- `normalizeSitePerformanceSummary`와 `publicationWindowState`의 기간·표본 부족 상태를 임의로 pass로
  바꾸지 않는다. analytics dashboard 타입이나 결과를 바꾸면 CMS analytics 화면과 fixture를 함께
  확인한다.

## 검증

```sh
pnpm --filter @blog-platform/core format:check
pnpm --filter @blog-platform/core lint
pnpm --filter @blog-platform/core typecheck
pnpm --filter @blog-platform/core test
pnpm --filter @blog-platform/core build
```
