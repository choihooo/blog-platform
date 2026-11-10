# SEO 수정 운영 배포 · 2026-10-04

- Runbook ID: `seo-catalog-20261004`
- 사용자 승인 범위: SEO 수정의 API/CLI 배포 및 운영 검증, 후속 main 커밋·push와 Search Console
  사이트맵 제출·최신 글 2개 색인 요청.
- 기존 Vercel 프로젝트: `blog-cms`, `blog` (team `hochois-projects`).
- 운영 Blog에는 D1 API 토큰이 있고 `BLOG_CONTENT_PROXY_URL` 설정은 없다. CMS를 경유하지 않고 D1/R2를
  직접 조회한다. 로컬 `.env.local`의 D1 토큰은 비어 있어 로컬 직접 연결은 실패한다.
- 비밀값·환경변수 파일·로컬 모델·빌드 산출물을 제외한 임시 소스 복사본으로 배포한다.
- `vercel deploy --prod --skip-domain`으로 빌드한 뒤 확인하고 `vercel promote`로 전환한다. 기존
  프로젝트 연결과 환경변수는 변경하지 않는다. D1/R2 데이터 변경·마이그레이션은 없다.

## 변경 및 확인 항목

- 전체 공개 글 사이트맵, 서버 페이지네이션 및 크롤링 가능한 이전/다음 링크.
- 콘텐츠 실패와 실제 404 구분, CMS 공개 API에 필터 적용 전체 글 수 `total` 추가.
- 마이그레이션 기록과 현재 제목이 일치하는 32개 글의 구주소를 새 글로 308 이동.
- CMS: `total`, 페이지/필터/미존재 응답 확인 후 운영 전환.
- Blog: 실제 운영 D1 기반 빌드, 전체 사이트맵·RSS·페이지 링크·리디렉션·본문 확인 후 운영 전환.

## 롤백 및 재실행

- CMS 직전 운영 배포: `dpl_FyVZsRaDrJJ75VE1jkeUmrBJpuPv`
  (`https://blog-qpo0bzvxg-hochois-projects.vercel.app`).
- Blog 직전 운영 배포: `dpl_DpUKdxeQiuSDk2GmxM27qXwKZSoS`
  (`https://blog-d09jw1tnr-hochois-projects.vercel.app`).
- 문제가 생기면 해당 프로젝트에서 직전 URL을 `vercel promote`한다. remote 모드를 사용하게 된 경우
  Blog를 먼저 롤백하고 CMS를 롤백한다. 데이터 변경이 없으므로 데이터 복구는 필요 없다.
- 재실행은 검증한 소스의 새 복사본으로 같은 프로젝트에 배포한다. 최초 CLI 배포 후 동일한 소스 변경을
  main에 커밋·push하여 후속 Git 자동 배포에도 수정이 유지되도록 한다.

## 배포 결과

- CMS: `dpl_ALeShD7puqCRQFpikoXcJmbmg43u` (`https://blog-lnqmfj6lq-hochois-projects.vercel.app`).
  실제 D1에서 전체 글 수 35, 첫 페이지 8개, 마지막 페이지 3개, 카테고리 필터, 없는 글 404를 확인한
  후 `cms.hozorica.com`으로 promote 완료.
- Blog: `dpl_8LiBihMwLjSEh8Unr82eRFbqdBLp` (`https://blog-mtsbwnqhe-hochois-projects.vercel.app`).
  운영 D1 직접 조회로 빌드 및 146개 페이지 생성 완료. 보호된 배포 URL 검증 후 `hozorica.com`과 기존
  별칭으로 promote 완료.
- 실제 운영 도메인 재검증: 사이트맵 총 124 URL / 공개 글 35개, RSS 최신 20개, robots 허용, 블로그
  첫/마지막 페이지·카테고리·태그·최신 글의 HTTP 200·self-canonical·noindex 없음, 없는 글의 HTTP 404
  확인.
- `hozorica.com/10`, `blog.hozorica.com/10`, `blog.hozorica.com/m/15`,
  `hozorica.com/posts/tistory-39`가 대응하는 현재 글로 308 이동함을 확인.
- `pnpm --filter @blog-platform/blog build`도 기존 로컬 설정(remote)과 실제 CMS API로 재실행해
  통과했다. 로컬 테스트 서버 없이 성공했다. 로컬 D1 비밀값은 추가하거나 복사하지 않았다.
- 기존 검증: Blog 371개/CMS 139개 테스트, lint·typecheck 통과. 이번 배포의 두 Vercel build도 통과.
- 비차단 경고: CMS의 기존 파일 tracing 경고와 Turbo 환경변수 허용 목록 경고는 남아 있다.

## Search Console 후속 결과

- `https://hozorica.com/sitemap.xml` 제출 접수 완료. 제출 후 상세 화면에는
  `사이트맵을 읽을 수 없음`, 발견된 페이지 0으로 표시되어 처리 성공은 아직 확인하지 못했다.
- 같은 URL의 Google 실제 URL 테스트는 2026-10-04 04:51 KST에 크롤링 허용 `예`, 페이지 가져오기
  `성공`으로 확인했다. 외부 HTTP 검사도 200이며 XML 파싱과 124개 고유 URL 검증을 통과했다. 따라서
  현재 접근 성공과 사이트맵 보고서 오류를 구분하며, 오류 원인을 확정하지 않는다.
- `/blog/nest-di-ioc`, `/blog/10x-product-data-analysis-review` 모두 `색인 생성 요청됨` 대화상자를
  확인했다. 우선순위 크롤링 대기열 등록이며 실제 색인 완료를 의미하지 않는다.
