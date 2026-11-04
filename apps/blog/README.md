# Blog App

공개 읽기 전용 블로그 앱이다. 기본 콘텐츠 소스는 D1/R2이며, `BLOG_CONTENT_PROXY_URL`이 있으면 CMS의
`/api/public-content`를 읽는 remote 소스를 사용한다. 공개된 글만 노출한다.

## Structure

- `app`: Next.js 라우트, 메타데이터, route handler와 기능 조립만 둔다.
- `features`: `blog`, `navigation`, `projects`, `resume`처럼 사용자 기능별 코드를 둔다.
- `shared`: 날짜 포맷과 analytics처럼 여러 기능에서 재사용하는 코드를 둔다.
- 기능은 다른 기능의 내부 파일을 직접 참조하지 않고, 공통 코드가 필요하면 `shared`로 올린다.

## Navigation

- 홈은 인사/About → Blog → Portfolio 순서의 스크롤 스토리다. 바로가기는 각각 `/resume`, `/blog`,
  `/projects` 전체 페이지로 이동한다. `/#about`, `/#blog`, `/#work`로 장면에 직접 진입한다.
- 이전 시안 `/experiments/scroll-story`는 `/`로 308 이동한다. 픽셀룸은 `/experiments/pixel-room`에서
  noindex 보관하며 메인에서 픽셀룸 이미지를 로드하지 않는다.
- 영상 실패/4초 지연은 정지 이미지로 복구한다. 모션 줄이기에서는 정지 이미지만 표시한다.
- 챗봇은 홈 진입 시 모델을 다운로드하지 않고 최초 열기에서 기존 런타임을 시작한다.
- 프로젝트 카드는 `/projects/[slug]`로 이동하고, 상세의 목록 링크는 해당 카드 위치로 돌아간다.
- 가로채기 라우트와 모달 슬롯은 사용하지 않는다. 링크 이동은 방문 기록을 남겨 브라우저 뒤로 가기를
  지원한다.
- 프로젝트 목록과 이력서에는 홈 링크를 제공한다.

## Project showcases

- Work 데이터는 `features/projects/data`에서 관리하고 `project-data.ts`에 등록한다.
- `format: "showcase"`는 이미지·영상 중심 상세로 표시하며 기존 프로젝트 상세 URL을 재사용한다. 일반
  사례의 목차 대신 본문을 바로 보여준다.
- STILL과 AFTERIMAGE는 Web Publishing 작업이다. 확인되지 않은 기간·팀·기술 스택과 정량 성과는
  생략한다. 디자인·이미지·영상 제작 기여는 별도 확인 후 기재한다.
- 실제 사이트 캡처는 `public/projects/{still,afterimage}`에 둔다. 2026-10-02 기준 데스크톱 1440×900,
  모바일 390×844 화면이며 AFTERIMAGE 영상은 실제 스크롤·컬러 선택 녹화다.

## Generated Outputs

- 승인된 썸네일 파일은 R2에 저장하고 D1의 `posts.hero_image_key` 및 `media_refs`의 hero/og 참조로
  연결한다. 목록·본문·추천글·공유 이미지는 CMS의 동일한 표지를 사용한다. slug별 로컬 override는
  사용하지 않는다. 2026-11-03 일괄 교체·백업·롤백 기록은
  `docs/deployment-2026-11-03-thumbnails.md`를 참고한다.
- 글 표지가 있으면 OG·Twitter 이미지에 같은 절대 URL을 사용한다. 기존 `/og/:slug` URL도 해당 표지로
  307 이동한다. 표지가 없는 글은 기존 텍스트 카드 생성과 비공개·미존재 글의 404를 유지한다.

- `/blog/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/og/[slug]`는 repository에 파일을 commit하지 않고
  route handler에서 현재 published content와 `@blog-platform/seo-engine` 결과를 기준으로 응답한다.
- Draft와 archived 글은 홈, 상세, taxonomy route, RSS, Sitemap, OG route에서 제외된다.
- Sitemap은 100개씩 모든 페이지를 조회한다. RSS는 최신 20개 글만 제공한다.
- 블로그·태그·카테고리 목록은 서버에서 페이지당 8개와 전체 개수를 조회하며, 이전/다음은 크롤러가
  따라갈 수 있는 `<a href>` 링크다. 태그 검색 대상도 전체 공개 글에서 수집한다.
- 콘텐츠 조회 실패는 예외로 전파한다. 실제로 글이 없을 때만 404로 처리하며, 저장소 설정 누락이나
  원격 5xx를 빈 목록/글 없음으로 캐시하지 않는다. D1 캐시와 ISR의 재검증 실패 시 기존 성공 응답을
  대체하지 않으며, 성공 캐시가 없는 요청은 서버 오류로 처리한다.
- remote 배포 시 CMS의 `{ posts, total, categories }` 응답을 먼저 배포한 뒤 Blog를 배포한다.
  `total`은 현재 필터에 해당하는 전체 공개 글 수다.

## Legacy post URLs

- `features/blog/data/legacy-post-redirects.mjs`에 이전 티스토리 ID와 현재 slug를 보관한다.
  2026-10-04에 migration `posts.json`의 제목과 공개 catalog 제목이 정확히 일치한 32개를 확인했다.
- `/:id`, `/m/:id`, `/posts/tistory-:id`, `/blog/tistory-:id` 중 매핑에 있는 경로만 현재 글로 308
  이동한다. 알 수 없는 ID나 삭제된 콘텐츠를 홈으로 보내지 않는다.
- 대상 글을 삭제하거나 slug를 바꾸면 매핑도 갱신한다. 원격 D1/R2 변경은 필요하지 않다.

## Analytics

- `content/site.json`의 analytics provider와 public env 값을 기준으로 provider 초기화 payload를
  준비한다.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 있으면 GA4 script를, `NEXT_PUBLIC_GTM_ID`가 있으면 GTM script를
  로드한다.
- 공개 독자 이벤트는 `@blog-platform/analytics`의 privacy-safe payload 계약을 사용한다.
- GA4/Search Console API 조회나 자체 분석 저장소는 없다.

## Revalidation

- `POST /api/revalidate`는 `BLOG_REVALIDATE_SECRET`으로 보호되며 CMS가 전달한 public path를
  `revalidatePath`로 갱신한다.
- repository-backed file content를 새 배포에 포함하려면 Vercel Git 연동 자동 배포 또는 CMS의
  `BLOG_DEPLOY_HOOK_URL`/`VERCEL_DEPLOY_HOOK_URL` 설정이 필요하다.
