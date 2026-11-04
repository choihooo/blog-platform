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
- 전체 Blog 393개 테스트, lint/typecheck/format:check 및 로컬 production build 통과.
- 운영 설정 Vercel build 148개 페이지 생성 성공. 기존 AUTH/SLACK 관련 Turbo allowlist 경고는
  이전 배포와 동일하며 홈/콘텐츠 기능은 아래 운영 검증으로 확인했다.
- 브라우저: 직접 `/#blog` 진입/활성 영상 1개/가로 넘침 없음/열기 전 모델 모듈 요청 없음 확인.
- 390×844 세로→844×390 가로에서 장면 유지 및 CTA/헤더 비겹침, 4초 stalled 복구,
  빠른 재선택, reduced motion의 재생 0개, 상세→history.back의 Blog 복원 확인.
- 채팅 최초 열기에서 모델 모듈 1개 로드와 기존 캐시/GPU 준비 후 입력 가능 상태를 확인했다.
  모델 전체 재다운로드 및 답변 품질 재평가는 이번 홈 전환 범위에서 재실행하지 않았다.
- 독립 검토 Important 1건(중단된 스크롤의 pending 잔류)을 브라우저 RED→GREEN으로 수정했다.
  추가 로고 복귀 문제도 재현·수정했다. Critical/Minor 및 검토 제외 항목은 없었다.
- 보호 배포에서 canonical/Person/noindex 분리, 이전 URL 308, MP4 Range 206 확인.
- 운영 도메인에서 홈/보관/리디렉션/상세 경로, 기존 R2 썸네일 OG, 미디어 24/24 정상 응답 확인.

## 배포·복구

- Vercel `hochois-projects/blog`, root `apps/blog`.
- 직전 운영 배포: `dpl_GPbMU18BJ5wk7K5dKvYNp24n81QQ`,
  `https://blog-cslvab8mb-hochois-projects.vercel.app`.
- 검증된 feature HEAD를 격리 복사해 `vercel deploy --prod --skip-domain`으로 빌드한다.
- 보호 배포 확인 후 `vercel promote <new-url> --scope hochois-projects --yes`로 전환한다.
- 롤백: `vercel promote https://blog-cslvab8mb-hochois-projects.vercel.app --scope hochois-projects --yes`.
- 복구 시 기존 픽셀룸 홈이 다시 표시된다. DB/R2를 변경하지 않아 데이터 복구는 필요 없다.
- 신규 운영 배포: `dpl_7MADjBNTsEe44DbD83iH5hpmb6bz`,
  `https://blog-ibzmilqyh-hochois-projects.vercel.app`; `https://hozorica.com`으로 promote 완료.
- 원격 Git push/merge 없이 검증된 작업 브랜치를 직접 배포했다. 원본 checkout의 미커밋 작업은
  보존했으며, 후속 Git 기반 배포 시 이 브랜치 변경도 통합해야 새 홈이 유지된다.

## 실행 중 결정 및 유지 비용

### 울트라와이드 보정 후속 작업

- 사용자 모니터 첨부 화면(2558×1051, 브라우저 콘텐츠 약 2558×974)에서 16:9 영상의 `cover`가
  위아래를 잘라 전신/바로가기 간격이 깨지는 현상을 재현했다.
- 16:9 이상 가로 화면에서는 영상·정지 화면·전환을 높이 기준 16:9 중앙 프레임으로 제한하고
  contain으로 표시한다. 양옆은 같은 하늘/바닥색으로 확장하고 프레임 가장자리를 부드럽게 연결한다.
- 제목·소개 크기는 화면 높이에도 제한한다. 높이 500px 이하 가로 화면에서는 문구와 하단 조작부
  사이의 전용 미디어 영역을 사용한다. 세로 화면의 기존 장면 구성은 유지한다.
- 2558×974 및 1600×610의 미디어 프레임/CTA 위치, 844×390 가로 및 기본 세로 화면 확인.
- 전체 Blog 테스트 393개, CSS 포맷 검사 및 lint 통과. 새 단위 테스트 대신 실제 뷰포트의
  잘림 재현과 CSS computed geometry로 RED→GREEN 검증했다.

- 실행 스킬의 보조 스크립트가 누락돼 동일 브리프·진행 기록을 수동으로 유지했다.
  자동 기록과 달리 검증 증거를 사람이 대조해야 하는 비용이 있다.
- 이미 배포된 썸네일/SEO 변경은 별도 baseline commit으로 복사했다. 기존 운영 동작을 보존하기
  위함이며 후속 병합 시 baseline과 이번 홈 diff를 구분해야 한다.
- 탐색 hook은 displayed 장면을 받고 ready/immediate도 반환하도록 계획 인터페이스를 확장했다.
  복원 전에 hash가 덮어써지는 문제를 막으며, 이후 수정에서도 이 초기화 계약을 유지해야 한다.
- DOM·영상·history 회귀는 실제 브라우저로 검증했다. 기존 Node Vitest에 새 DOM 의존성을 추가하지
  않았으므로 이후 관련 변경에도 브라우저 회귀 절차를 반복해야 한다.
- 챗봇 검증은 1.38GB 재다운로드를 피하기 위해 기존 캐시를 보존한 새 문서에서 진행했다.
  열기 전 모듈 요청 0개와 열기 후 캐시/GPU 로드를 확인했으며 cold-cache 다운로드는 별도 검증 대상이다.
- 운영 반영 후 브랜치는 유지한다. 원본 main checkout의 기존 미커밋 변경을 덮어쓰지 않기 위함이며,
  이후 Git 배포 전 이 작업 브랜치를 main에 통합하는 단계가 남는다.
