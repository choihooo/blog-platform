# 스크롤 홈 운영 전환

- Runbook: `scroll-story-home-20261104`.
- 작업 브랜치: `codex/scroll-story-home`; 원본 `/Users/choiho/coding/blog` 미커밋 상태 보존.
- 기준: `08c37cf`는 이미 운영 중인 썸네일/SEO 변경, `2edb9e6`는 승인된 시안·계획 스냅샷.
- 이번 기능 diff는 `2edb9e6..HEAD`로 검토한다.
- `/`에서 인사·블로그·포트폴리오를 표시하고 링크는 `/resume`, `/blog`, `/projects` 유지.
- `/experiments/scroll-story` → `/` 308. 보관 픽셀룸 `/experiments/pixel-room` noindex.
- DB/R2 변경 없음. 홈 canonical·Person JSON-LD·운영 OG 및 기존 글 썸네일 유지.
- 배포 미디어는 `plates-centered` MP4 18개/JPG 6개. 이전 생성물은 Git/원본 작업 폴더에 보존한다.

## 검증 기록

- fresh install 이후 공유 editor/analytics/seo-engine build가 필요했다. 준비 후 기존 374개 테스트 통과.
- 홈 route 테스트 3개 RED→GREEN, 전환/SSR 6개 RED→GREEN, hash/shell 11개 통과.
- 전체 Blog 393개 테스트 및 lint/typecheck 통과. 최종 빌드·브라우저·운영 결과는 완료 시 갱신한다.
- 브라우저: 직접 `/#blog` 진입/활성 영상 1개/가로 넘침 없음/열기 전 모델 모듈 요청 없음 확인.

## 배포·복구

- Vercel `hochois-projects/blog`, root `apps/blog`.
- 직전 운영 배포: `dpl_GPbMU18BJ5wk7K5dKvYNp24n81QQ`,
  `https://blog-cslvab8mb-hochois-projects.vercel.app`.
- 검증된 feature HEAD를 격리 복사해 `vercel deploy --prod --skip-domain`으로 빌드한다.
- 보호 배포 확인 후 `vercel promote <new-url> --scope hochois-projects --yes`로 전환한다.
- 롤백: `vercel promote https://blog-cslvab8mb-hochois-projects.vercel.app --scope hochois-projects --yes`.
- 복구 시 기존 픽셀룸 홈이 다시 표시된다. DB/R2를 변경하지 않아 데이터 복구는 필요 없다.
