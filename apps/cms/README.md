# CMS App

단일 운영자용 비공개 CMS다. GitHub 관리자 검증을 통과한 사용자만 콘텐츠 변경을 실행할 수 있다.

## Publish Workflow

현재 저장소는 D1/R2 adapter이며 editor 본문은 공유 패키지의 version-1 structured JSON을 사용한다.
표·중첩 목록·부분 강조·이미지 캡션의 현재 계약은 `packages/core/README.md`를 따른다. Markdown 블록은
편집기에 붙여넣으면 구조로 변환되며, 코드 블록 안에 붙여넣은 텍스트는 원문으로 유지한다.
Save/Publish는 중첩 콘텐츠 validation 후 저장한다.

- Save는 D1에 draft 변경을 저장하며 공개 갱신을 실행하지 않는다.
- Publish·Unpublish·Archive는 기존 상태 전이와 `publishedAt`·slug 검증을 유지한다.
- 저장 성공 후 공개 갱신이 실패하면 저장 결과·retry token을 유지하고 갱신만 재시도한다.
- 이미지 업로드는 core의 media store를 호출하며 CMS guard·크기/형식 검사와 편집기 참조 조립을
  유지한다.
- 원격 저장은 R2, 개발 환경에서 R2 설정이 없을 때는 로컬 `/media` 제공을 사용한다.
- Next.js 공개 캐시·SEO 산출물은 Blog가 소유한다. 이전 repository adapter와 GitHub content-write
  token은 사용하지 않는다.

## SEO와 분석 링크

- 공개 Blog의 remote 소스는 `GET /api/public-content`를 사용한다. 목록 응답은
  `{ posts, total, categories }`이며 `page`, `limit`(최대 100), `tag`, `category`, `query`를 받는다.
  `total`은 필터를 적용한 전체 공개 글 수다. 단건은 `slug`로 조회한다.
- 글 미존재는 404, 저장소 오류는 502로 응답한다. D1 연결 설정 누락도 저장소 오류다. 오류 응답에는
  공개 성공 캐시 헤더를 붙이지 않는다.
- Blog가 remote 모드이면 페이지네이션 계약 변경 배포 순서는 CMS → Blog다. 기존 Blog는 추가된 `total`
  필드를 무시하므로 CMS를 먼저 배포해도 호환된다. D1/R2 직접 조회 모드에서는 Blog를 독립적으로
  배포할 수 있으며 CMS 화면을 통한 배포는 필요 없다.

- Editor sidebar는 현재 editor document 기준의 SEO score, blocking issue, warning, 검색 미리보기를
  표시한다.
- 발행 글에는 공개 글 링크를 제공하고, GA4/Search Console 설정이 없으면 비활성 이유를 표시한다.
- CMS는 설정된 GA4/Search Console provider로 지표를 조회한다. 자격 증명이나 연결 설정이 없으면 연결
  불가 이유와 외부 콘솔 링크를 표시한다. 자체 분석 데이터 저장소는 추가하지 않는다.

## Security Environment

- `PREVIEW_TOKEN_SECRET`: CMS가 draft preview URL을 발급할 때 사용하는 HMAC secret이다. Blog app에도
  같은 값이 설정되어야 한다.
- `BLOG_DEPLOY_HOOK_URL` 또는 `VERCEL_DEPLOY_HOOK_URL`: publish/unpublish/archive 이후 공개 블로그
  Vercel 배포를 다시 트리거한다. 기존 설정 시 revalidate보다 우선하며 이번 구조 변경에서 우선순위를
  바꾸지 않는다.
- `BLOG_REVALIDATE_URL`, `BLOG_REVALIDATE_SECRET`: 공개 블로그의 `/api/revalidate`를 직접 호출해 D1
  저장 후 대상 path와 콘텐츠 cache를 갱신한다. deploy hook이 설정되어 있으면 기존 우선순위대로 배포
  요청을 사용한다.
- `GITHUB_TOKEN`, `GITHUB_APP_PRIVATE_KEY`, `PREVIEW_TOKEN_SECRET`, `NEXTAUTH_SECRET`, `AUTH_SECRET`
  값은 CMS action/repository failure message에서 redaction 대상이다.

## 코드 책임과 검증

- `app`은 URL·인증·Server Action·Next cache 경계이며 page에서 typed command capability를 조립한다.
- `features/editor`는 components/hooks/model/server로 편집·저장·발행·미디어를 나눈다. 브라우저는
  서버 모듈을 값 import하지 않는다.
- `features/posts`, `taxonomy`, `analytics`, `public-content`는 각 기능의 조회·변경·표현을 소유한다.
  analytics는 posts의 서버 공개 API를 사용한다.
- `shared/ui`는 공통 필드, `shared/server`는 사이트 설정과 root 경로를 소유한다.
  auth/security/migration의 기존 정책은 유지한다.
- `lib/architecture.test.ts`는 feature에서 app으로의 역방향 의존성과 client의 transitive 서버 값
  import를 검사한다.

필수 검사는 `pnpm --filter @blog-platform/cms` 뒤에 `format:check`, `lint`, `typecheck`, `test`,
`build`를 각각 실행한다.

저장 응답 전에 새 제목을 입력하면 이전 제목으로 덮이는 기존 경쟁 상태는
`editor-save-flow.test.tsx`의 expected-failure 사례로 기록했다. 구조 변경과 분리하여 수정해야 한다.
