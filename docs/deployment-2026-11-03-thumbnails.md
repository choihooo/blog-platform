# 블로그 썸네일·공유 이미지 적용

- Runbook ID: `blog-thumbnails-r2-20261103`.
- 사용자 요청: Figma에서 완성한 전체 썸네일을 추출해 글 표지를 교체하고 공유 OG 이미지에도 사용.
- 대상: 공개 글 35개, 1280×720 PNG. 비공개 글 4개는 제외한다.
- 이미지 저장 위치: R2 `blog-assets/blog/thumbnails/2026-11-03/{slug}-{sha256앞12자리}.png`.
- D1 `blog-platform`의 `posts.hero_image_key`에는 공개 URL, hero/og `media_refs.r2_key`에는 R2 key를
  저장한다. hero 참조가 없는 글에는 결정적 ID로 추가한다. 기존 이미지 파일은 삭제하지 않는다.
- 로컬 slug별 표지 override를 제거하여 이후 CMS 표지 선택이 공개 Blog와 공유 이미지에 반영된다.
- 본문·게시일·수정일·조회수는 이번 일괄 작업에서 변경하지 않는다.
- OG·Twitter·SEO report는 글 표지의 절대 URL을 사용한다. 기존 `/og/:slug`는 표지로 307 이동하며,
  표지가 없을 때 기존 생성 카드로 fallback한다. 미존재·비공개 글은 404를 유지한다.

## 백업·dry-run·재실행

- 전체 posts의 ID/slug/표지/수정일/공개 상태와 전체 media_refs를 `before.json`으로 백업한다.
- `manifest.json`은 글별 업로드 경로·SHA256·용량을 기록하며 apply/rollback SQL을 함께 보관한다.
- 대상 목록과 공개 글 35개가 정확히 일치하고 PNG 1280×720임을 확인한 뒤 업로드한다.
- 공개 R2 URL 35개를 GET하여 SHA256 일치를 확인한 후 원격 SQL을 실행한다.
- 재실행: 동일 manifest의 동일 해시 경로로 업로드하고, 스냅샷과 현재 DB를 비교한다. 이미 적용된
  표지는 건너뛴다. SQL은 이전 표지 값 조건 및 결정적 media ID로 중복·동시 변경 덮어쓰기를 막는다.
- 파일 기록: Codex 작업 폴더의 `outputs/r2-thumbnails-2026-11-03/`.

## 최종 검증·운영 적용

- Blog 테스트 374개(33 files), SEO Engine 테스트 14개(9 files) 통과.
- 두 패키지 format:check, lint, typecheck 통과. 격리 Vercel production build 146개 페이지 생성 통과.
- R2 공개 GET 35개 모두 원본 SHA256·1280×720 일치. Facebook/Twitter 수집기 UA 요청도 200.
- D1 70개 SQL 실행 성공. 재조회로 posts 표지 35개·hero/og 참조 35개 일치 확인.
- 비공개 글 4개 및 body media_refs, 모든 글의 updated_at 보존 확인.
- 보호된 배포에서 본문·OG·Twitter의 동일 R2 URL 확인 후 promote 성공.
- 운영 도메인에서 글 35개 본문 이미지·og:image·twitter:image 전부 일치 및 목록 5페이지의
  썸네일 35개 확인. 기존 `/og/regular-expression`의 307과 미존재 OG 404 확인.
- 배포 ID: `dpl_GPbMU18BJ5wk7K5dKvYNp24n81QQ`.
- 배포 URL: `https://blog-cslvab8mb-hochois-projects.vercel.app`; 운영 `https://hozorica.com`.
- 기존 Vercel AUTH/SLACK 환경변수의 Turbo allowlist 경고가 있으나 빌드는 성공했다. 이번 이미지·SEO
  경로의 동작은 위 운영 검증으로 확인했다.

## 배포와 롤백

- 프로젝트: Vercel `hochois-projects/blog`, root `apps/blog`.
- 현재 작업의 파일과 이미지들만 격리 소스 복사본에 포함한다. 다른 미완료 홈·스크롤 실험 변경과
  `.env`·비밀값은 포함하지 않는다.
- `vercel deploy --prod --skip-domain`으로 운영 설정 빌드 후 확인하고 `vercel promote`로 전환한다.
- 직전 운영 배포: `dpl_71QBMy9uFFGeFdVYx7Jm6wrEsvNP`,
  `https://blog-o2cwhxl7p-hochois-projects.vercel.app`.
- 코드 롤백: 위 URL을 같은 프로젝트에서 `vercel promote`한다.
- 데이터 롤백: 백업의 `rollback.sql`을 같은 D1에 원격 실행한다. 이번 업로드 URL을 여전히 가리키는
  레코드만 복원한다. 이후 운영자가 변경한 표지는 보존한다. 새 R2 파일은 남겨도 무방하며 기존
  파일이 유지되어 이전 표지가 즉시 복원된다. 콘텐츠 캐시는 300초 후 갱신 또는 재배포한다.
- 이후 디자인 변경은 새 해시 URL로 업로드한다. 외부 공유 서비스의 기존 미리보기에는 재수집
  시간이 필요할 수 있다.
