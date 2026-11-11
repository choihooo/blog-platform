# 운영 배포

## 현재 구성

- GitHub: `choihooo/blog-platform`, Production 브랜치 `main`.
- Vercel: `hochois-projects/blog`, 운영 주소 `https://hozorica.com`.
- Next.js 앱의 Root Directory는 저장소 루트입니다. 이전 `apps/blog` 모노레포 설정을 사용하지 않습니다.
- Node 24.x / pnpm 10.28.1. 설치 `pnpm install --frozen-lockfile`, 빌드 `pnpm build:release`.
- `build:release`는 테스트 → lint → Next.js 빌드를 차례로 실행합니다. 실패하면 배포 빌드도 실패합니다. CI에서도 같은 검사를 수행합니다.

## 환경 변수

| 이름 | Preview | Production |
| --- | --- | --- |
| `SITE_URL` | `https://hozorica.com` | `https://hozorica.com` |
| `SITE_INDEXABLE` | `false` | `true` |

Preview는 `SITE_INDEXABLE=true`여도 항상 noindex입니다. Production은 공개 글의 검색 색인을 허용합니다. 환경 변수 변경 뒤에는 재배포해야 메타 robots·robots.txt·사이트맵에 반영됩니다. noindex는 접근 제한이 아니며, 초안은 반드시 `_drafts`에 보관합니다.

이전 프로젝트의 인증·검색·CMS 관련 환경 변수는 현재 앱이 사용하지 않습니다. 다른 서비스의 재사용 여부를 확인하지 않은 채 삭제하지 않습니다. 로컬 `.env`나 인증 토큰은 Git에 넣지 않습니다.

## 배포 절차

1. 작업 브랜치에서 `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm exec tsc --noEmit`를 실행합니다.
2. 작업 브랜치를 GitHub에 반영해 Vercel Preview를 생성합니다. CLI 미리보기는 연결된 프로젝트에서 `vercel --yes`를 사용합니다. 기존 Preview 보호 설정은 유지합니다.
3. 미리보기의 메인·직접 상세 URL·검색·모바일·목차·복사를 확인합니다. 보호된 Preview의 HTTP 검증은 `vercel curl / --deployment <preview-url>`을 사용합니다.
4. 검증한 변경을 `main`에 반영하고 Vercel의 Production 배포 완료를 확인합니다. CLI Production은 `vercel --prod --yes`입니다.
5. `node scripts/check-deployment.mjs https://hozorica.com --indexable`로 홈에서 연결된 모든 공개 글의 HTTP 응답·H1·제목·설명·canonical·robots·구조화 데이터를 확인합니다. 사이트맵 URL 목록이 홈과 공개 글의 canonical 목록에 일치하는지, 공유 이미지와 비공개 경로 404도 확인합니다. 공개 글이 하나 이상 있어야 통과합니다.
6. Preview 검사에서는 `--indexable`을 생략합니다. 공개 글이 있어도 홈·개별 글은 noindex/nofollow, 사이트맵은 빈 목록이어야 합니다. canonical은 운영 주소를 유지합니다. 로컬 등 별도 canonical을 검증하려면 `--site-url <주소>`를 사용합니다.

사이트맵의 lastmod는 발행일로 대신 채우지 않습니다. 현재는 정확한 주요 수정일을 별도로 기록하지 않아 생략합니다. WebSite·Person 및 글의 BlogPosting 구조화 데이터는 실제 메타데이터를 재사용하며, 검증되지 않은 수정일은 만들지 않습니다.

`docs/`, `fixtures/`는 Git에 보존하지만 Next.js 공개 경로가 아닙니다. 테스트용 fixtures는 빌드 검증에만 사용하며 `.next` 런타임 trace에 포함되지 않는지 확인합니다. 이전 19GB 아카이브는 원래 `/Users/choiho/coding/blog/archive/2026-11-10-legacy/`에 그대로 있고 배포 소스에 넣지 않습니다.

## 되돌리기

Vercel 대시보드의 Deployments에서 직전 정상 Production 배포를 선택해 rollback합니다. CLI는 `vercel rollback <previous-deployment-url>`입니다. 이미 빌드된 배포를 되돌리므로 새 빌드를 기다릴 필요가 없습니다.

2026-11-11 SEO 배포 직전 정상 배포는 `https://blog-7dnhyyek2-hochois-projects.vercel.app` (`dpl_6Szh3vBvFqnL8QWUZ2f5cf159htY`)입니다. 이후 릴리스에서는 직전 정상 배포 URL을 배포 기록에 갱신합니다.

이전 모노레포 코드를 다시 **빌드**하려면 프로젝트 설정도 그 코드에 맞춰야 합니다. 당시 Root Directory는 `apps/blog`, Node 22.x, Build Command는 `cd ../.. && pnpm turbo build --filter=@blog-platform/blog...`, Install Command는 `cd ../.. && pnpm install`이었습니다. 기존 빌드로 rollback하는 것과 이전 소스로 재빌드하는 것은 다릅니다.

## GitHub Actions 상태 (2026-11-10)

실행 42688896938은 코드 오류가 아니라 GitHub의 계정 결제 잠금으로 runner가 시작되지 못했습니다. 결제 설정은 변경하지 않았습니다. Vercel의 `pnpm build:release`는 동일한 테스트·lint·빌드를 직접 실행하므로 이 게이트를 통과한 배포만 반영합니다. GitHub CI 파일은 그대로 유지하며 계정 문제를 해결하면 다시 사용할 수 있습니다.

## 댓글·좋아요 D1 연결

2026-11-10 댓글·좋아요 기능을 메인에 반영하면서 이 프로젝트의 Production에 다음 서버 전용 환경 변수를 등록했습니다. 기존 사이트 주소·색인·그 밖의 환경 변수는 유지했습니다.

- `CLOUDFLARE_ACCOUNT_ID`: 댓글용 D1이 속한 계정
- `CLOUDFLARE_D1_DATABASE_ID`: 새 `blog-engagement` 데이터베이스
- `CLOUDFLARE_D1_API_TOKEN`: 해당 계정의 D1 Edit 권한만 가진 운영 토큰 (Sensitive)
- `ENGAGEMENT_SECRET`: 익명 브라우저 쿠키 서명과 식별자 HMAC에 사용하는 고정 비밀키 (Sensitive)

Preview에서 이 기능을 사용하려면 해당 환경에도 별도로 등록합니다. 토큰·비밀키를 Git이나 빌드 명령 인자로 넣지 않습니다. 운영 스키마·댓글 관리·익명성 제한은 [댓글과 좋아요 운영 문서](anonymous-engagement.md)를 따릅니다.

## 2026-11-11 SEO 반영

Production의 `SITE_INDEXABLE=true`를 적용하고 `https://blog-bg7mp4ybk-hochois-projects.vercel.app` (`dpl_CvgpNaFJ4iQgGi1ioNwr3EwtiJ19`)를 배포했습니다. 운영 도메인의 홈과 글 3개에서 index/follow, 자기 canonical, JSON-LD를 확인했습니다. robots 허용·사이트맵 URL 4개·공유 이미지·비공개 경로 404를 새 배포 검사로 검증했습니다. 기존 발행일은 유지하고 검증되지 않은 수정일은 생성하지 않았습니다.

동시에 작업 중인 OG 이미지 파일과 섞이지 않도록 HEAD 기준 소스에 SEO 변경만 얹은 별도 배포본을 사용했습니다. 이번 코드 변경은 로컬에 남겨 두었으며 Git 커밋·푸시는 수행하지 않았습니다. 향후 main 반영 시 별도 OG 변경과 함께 검증하고, 운영 배포가 이 SEO 수정을 유지하는지 확인합니다.

## 2026-11-11 글별 OG 이미지 반영

현재 작업본의 SEO 수정과 글별 OG 이미지를 함께 CLI로 배포했습니다. Preview `https://blog-qfr10cqpz-hochois-projects.vercel.app`에서 홈·글 3개·OG·noindex·빈 사이트맵을 확인한 뒤 Production `https://blog-h37hdi1ld-hochois-projects.vercel.app` (`dpl_FBU7J3BKN7kniuGyNrhwvd59q5tx`)를 `https://hozorica.com`에 연결했습니다.

운영 빌드에서 테스트 54개·lint·Next.js 빌드를 통과했습니다. 배포 검사로 홈·글의 canonical·색인 허용·JSON-LD·사이트맵·비공개 경로 404를 확인했습니다. 글별 1200×630 OG 이미지 3개는 검토한 최종 PNG와 SHA-256이 모두 일치합니다. 운영 브라우저에서 메인→상세 이동과 390px 모바일 가로 넘침이 없음을 확인했습니다. 생성한 비교용 `output/`은 배포에서 제외했습니다.

이번 릴리스의 직전 정상 Production은 `https://blog-bg7mp4ybk-hochois-projects.vercel.app` (`dpl_CvgpNaFJ4iQgGi1ioNwr3EwtiJ19`)입니다. Git 커밋·푸시 없이 현재 작업본을 업로드했습니다.

## 2026-11-11 검색 도구 소유 확인 파일 배포

네이버 서치어드바이저에서 받은 `public/naverac9e16b9651a12ba6a55c94003fca02d.html`을 추가했습니다. 소유 확인을 유지하기 위한 공개 파일이므로 이후 배포에서도 보존합니다. 비밀키는 포함하지 않습니다.

기존 SEO와 글별 OG 이미지를 유지한 Production `https://blog-1cab4bwst-hochois-projects.vercel.app` (`dpl_8hrvvissSVGvoiJk64Fozj2Vs7AX`)를 운영 도메인에 연결했습니다. 운영 빌드의 테스트 54개·lint·빌드를 통과했고, 배포 검사와 소유 확인 파일의 HTTP 200 및 원문 일치를 확인했습니다. 직전 정상 Production은 `https://blog-h37hdi1ld-hochois-projects.vercel.app`입니다. Git 커밋·푸시는 수행하지 않았습니다.

검색 도구에서 Google 사이트맵 재제출 성공(현재 URL 4개)과 공개 글 3개의 ‘색인 생성 요청됨’을 확인했습니다. 네이버 사이트 등록·소유 확인·사이트맵 제출 및 공개 글 3개의 웹 페이지 수집 요청도 접수됐습니다. 실제 색인 완료와 검색 노출은 별도 처리 결과를 기다립니다.

## 2026-11-11 GA4 · Clarity 연결

기존 GA4 속성 `howublog`의 통계를 유지하면서 이전 `blog.hozorica.com` 웹 스트림을 현재 `https://hozorica.com`으로 갱신했습니다. 시간대 대한민국 UTC+09:00·통화 KRW·페이지 로드 및 브라우저 기록 변경 기반 페이지 조회 수집을 확인했습니다. 새 Clarity 프로젝트를 만들고 같은 GA4 속성에 읽기 권한으로 연결했습니다. Google Signals와 선택적 광고용 공유는 추가로 켜지 않았습니다.

Vercel Production에 `NEXT_PUBLIC_GA_MEASUREMENT_ID`와 `NEXT_PUBLIC_CLARITY_PROJECT_ID`를 등록하고 Production `https://blog-k1nirvbp8-hochois-projects.vercel.app` (`dpl_8n9ifddNP6CXsL8gAPEj8Nnz5wk9`)를 운영 도메인에 연결했습니다. 로컬·Preview에서는 추적 스크립트를 실행하지 않습니다. 연결 방법은 [분석 운영 문서](analytics.md)를 따릅니다.

이미 운영 중인 SEO·글별 OG·검색 도구 소유 확인 파일을 포함한 스테이징 소스에 분석 변경만 더한 별도 배포본을 사용했습니다. 동시에 작업 중인 미발행 Keychain 글과 검색 UI 변경은 배포에 넣지 않았습니다. 배포본의 테스트 54개·lint·빌드·타입 검사, 운영 도메인의 배포 검사, 메인↔상세 이동·390px 가로 넘침 없음·키보드 초점을 확인했습니다. 브라우저에서 GA4 `page_view` 요청과 Clarity 수집 HTTP 204, GA4 실시간 보고서의 홈·상세 글 조회 수신을 확인했습니다. Clarity에는 온라인 사용자가 표시되며 저장된 레코딩은 확인 당시 처리 대기 상태였습니다.

직전 정상 Production은 `https://blog-1cab4bwst-hochois-projects.vercel.app` (`dpl_8hrvvissSVGvoiJk64Fozj2Vs7AX`)입니다. Git 커밋·푸시는 수행하지 않았습니다.

## 2026-11-11 사용자 행동·읽기 도달률 이벤트

GA4에 좋아요·취소, 댓글 저장, 검색 열기·완료·결과 선택, 코드 복사 성공·실패, GitHub·메일 링크 클릭을 추가했습니다. 본문 도달률 25·50·75·90·100%와 최대/마지막 도달률·섹션·활성 시간 요약도 기록합니다. 검색어·댓글 원문·닉네임·이메일 주소·복사 코드는 수집하지 않습니다. Production에서만 관찰자를 설치하고 Google 태그 로드 전 이벤트 대기열을 유지합니다. 정의·분석 방법과 종료 수집의 한계는 [분석 운영 문서](analytics.md)를 따릅니다.

Production `https://blog-gaenxono7-hochois-projects.vercel.app` (`dpl_njXNynswVSV6Je6rtMoMuhQohSXm`)를 운영 도메인에 반영했습니다. 이전 운영 소스에 이벤트 변경만 적용한 분리된 배포본으로, 동시 작업 중인 글·검색 디자인 변경은 포함하지 않았습니다. 로컬 검증용 SQLite의 `.local/`도 업로드에서 명시적으로 제외했습니다.

배포본 테스트 65개, 전체 작업본 테스트 76개, 양쪽 lint·빌드·타입 검사를 통과했습니다. 새 GA 대기열의 Arguments 프로토콜 회귀 테스트와 읽기 단계 중복·역스크롤·숨김 시간 테스트를 포함합니다. 별도 코드 검토 후 초기 대기열과 숨긴 상태의 강제 도달률 샘플링을 수정했습니다.

로컬 SQLite와 가짜 GA ID를 사용한 실제 브라우저에서 모든 요청 이벤트를 확인했습니다. 두 글 방문에서 각 도달 구간이 한 번씩 기록됐고, 마지막 이동에는 최대 100%·마지막 48%와 서로 다른 섹션이 남았습니다. 검색·메인↔상세 키보드 이동과 390px 가로 넘침 없음을 확인했습니다. 운영 DB에 테스트 댓글·좋아요를 쓰지 않았습니다.

운영 배포 검사에서 기존 공개 글 3개·canonical·robots·JSON-LD·사이트맵·OG·비공개 경로를 확인했습니다. 운영 브라우저의 검색→상세→복사→끝까지 스크롤→중간→홈 동작 후 GA4 실시간에서 `search_open`, `blog_search`, `search_result_click`, `code_copy`, `article_read_progress`, `article_read_summary` 수신을 확인했습니다. 맞춤 측정기준 9개와 측정항목 5개도 등록했습니다.

직전 정상 Production은 `https://blog-k1nirvbp8-hochois-projects.vercel.app` (`dpl_8n9ifddNP6CXsL8gAPEj8Nnz5wk9`)입니다. Git 커밋·푸시는 수행하지 않았습니다.
