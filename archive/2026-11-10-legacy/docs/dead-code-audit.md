# Dead-code and repository audit

2026-09-09 기준 전체 저장소를 앱 라우트/기능, workspace 패키지, CMS/배포, 스크립트/문서/자산으로
나눠 확인했다.

## 이번에 수정한 항목

- CMS 공개 갱신 테스트를 현재 `/blog` 라우팅과 일치시켰다.
- CMS 사이트 URL 테스트를 `https://hozorica.com`과 일치시켰다.
- SEO 미리보기 테스트의 포스트 URL을 `/blog/<slug>`로 맞췄다.
- 마이그레이션 검증 스크립트의 삭제된 `apps/blog/lib/*` import를 현재 feature 경로로 옮겼다.
- 검증 스크립트가 D1/R2와 원격 proxy를 실제로 서로 다른 source로 비교하도록 수정했다.
- 다이어그램 CSS에 포함된 개인 컴퓨터의 `file:///Users/...` 폰트 경로를 제거했다.
- D1/R2 마이그레이션 체크리스트의 잘못된 상대 링크를 수정했다.
- `@blog-platform/editor`에서 사용하지 않는 Tiptap 직접 의존성을 제거했다. Tiptap은 CMS가 직접
  사용한다.
- `@blog-platform/markdown` README가 실제 export와 다른 API를 안내하던 내용을 현재 API 기준으로
  고쳤다.
- 사용하지 않던 HyperCLOVA Q4 로컬 모델 다운로드(약 960MB)를 휴지통으로 이동하고 관련 상수를
  제거했다. 이후 로컬 Kanana Q8 조각도 더 이상 사용하지 않도록 R2 hosted URL로 통일하고, 로컬
  다운로드 파일(약 1.3GB)을 휴지통으로 이동했다.
- 이전 3D 홈 화면(`apps/blog/features/home`)과 전용 `three`/React Three Fiber/`motion` 의존성, 모델
  자산을 제거했다. 현재 홈은 픽셀룸을 사용한다.
- 참조되지 않는 프로젝트 데이터 4개(`cmc-19`, `dream-track`, `jikhaeng`, `siren-path`)를 제거했다.
- 참조되지 않는 Comma 비교 영상 3개와 사용되지 않는 SVG 다이어그램 8개를 제거했다. 현재 프로젝트
  피드와 문서가 사용하는 PNG 다이어그램은 유지했다.
- 현재 호출자가 없던 CMS admin-ops 보조 모듈과 일부 migration 보조 모듈을 제거했다. 실제
  `migrate:upload` 경로가 사용하는 미디어 업로드·매핑 모듈은 유지했다.
- 앱에서 소비하지 않던 `@blog-platform/ai`와 `@blog-platform/markdown` workspace 패키지를 제거하고,
  현재 운영 지침에서 더 이상 유효하지 않은 참조를 정리했다.

## 보류한 항목

아래 항목은 참조가 적거나 현재 기능 프리뷰/롤백 자료일 가능성이 있어 이번 작업에서 삭제하지 않았다.

- `features/portfolio-preview`: 홈 픽셀룸과 별도로 `/portfolio/preview`에서 사용하는 프리뷰 화면.
- 프로젝트의 `card-secondary-v2.jpg`와 Comma 비교 영상: 현재 피드에서는 primary 이미지만 사용하지만,
  상세/수동 콘텐츠용일 수 있다.
- 오래된 `specs/*/tasks.md`: 구현 경로가 바뀐 과거 작업 기록이라 기능 코드와 섞어 삭제하지 않았다.

## 검증

- `pnpm lint` 통과
- `pnpm typecheck` 통과
- Blog 테스트 통과
- CMS 테스트 통과

위 보류 항목은 실제 운영 URL과 수동 콘텐츠 사용 여부를 확인한 뒤 별도 커밋으로 정리한다.
