# Blog App

공개 읽기 전용 블로그 앱이다. `content/posts/*.mdx` 중 `status: published`인 글만 공개 표면에
노출한다.

## Structure

- `app`: Next.js 라우트, 메타데이터, route handler와 기능 조립만 둔다.
- `features`: `blog`, `navigation`, `projects`, `resume`처럼 사용자 기능별 코드를 둔다.
- `shared`: 날짜 포맷과 analytics처럼 여러 기능에서 재사용하는 코드를 둔다.
- 기능은 다른 기능의 내부 파일을 직접 참조하지 않고, 공통 코드가 필요하면 `shared`로 올린다.

## Navigation

- 홈 픽셀룸의 Work, Blog, About은 각각 `/projects`, `/blog`, `/resume` 전체 페이지로 이동한다.
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

- `/blog/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/og/[slug]`는 repository에 파일을 commit하지 않고
  route handler에서 현재 published content와 `@blog-platform/seo-engine` 결과를 기준으로 응답한다.
- Draft와 archived 글은 홈, 상세, taxonomy route, RSS, Sitemap, OG route에서 제외된다.

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
