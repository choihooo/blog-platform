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
| `SITE_INDEXABLE` | `false` | 실제 글이 준비되기 전 `false` |

Preview는 `SITE_INDEXABLE=true`여도 항상 noindex입니다. Production에서 첫 실제 글·공유 이미지·사이트맵을 확인한 뒤 색인을 켭니다. noindex는 접근 제한이 아니며, 초안은 반드시 `_drafts`에 보관합니다.

이전 프로젝트의 인증·검색·CMS 관련 환경 변수는 현재 앱이 사용하지 않습니다. 다른 서비스의 재사용 여부를 확인하지 않은 채 삭제하지 않습니다. 로컬 `.env`나 인증 토큰은 Git에 넣지 않습니다.

## 배포 절차

1. 작업 브랜치에서 `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm exec tsc --noEmit`를 실행합니다.
2. 작업 브랜치를 GitHub에 반영해 Vercel Preview를 생성합니다. CLI 미리보기는 연결된 프로젝트에서 `vercel --yes`를 사용합니다. 기존 Preview 보호 설정은 유지합니다.
3. 미리보기의 메인·직접 상세 URL·검색·모바일·목차·복사를 확인합니다. 보호된 Preview의 HTTP 검증은 `vercel curl / --deployment <preview-url>`을 사용합니다.
4. 검증한 변경을 `main`에 반영하고 Vercel의 Production 배포 완료를 확인합니다. CLI Production은 `vercel --prod --yes`입니다.
5. `node scripts/check-deployment.mjs https://hozorica.com`으로 빈 콘텐츠 출시 상태의 공개 경로·메타데이터·이미지·비공개 경로 404를 확인합니다. 첫 글이 발행되면 이 초기 출시용 검사 대신 실제 발행 글을 포함한 검증으로 갱신합니다.

`docs/`, `fixtures/`는 Git에 보존하지만 Next.js 공개 경로가 아닙니다. 테스트용 fixtures는 빌드 검증에만 사용하며 `.next` 런타임 trace에 포함되지 않는지 확인합니다. 이전 19GB 아카이브는 원래 `/Users/choiho/coding/blog/archive/2026-11-10-legacy/`에 그대로 있고 배포 소스에 넣지 않습니다.

## 되돌리기

Vercel 대시보드의 Deployments에서 직전 정상 Production 배포를 선택해 rollback합니다. CLI는 `vercel rollback <previous-deployment-url>`입니다. 이미 빌드된 배포를 되돌리므로 새 빌드를 기다릴 필요가 없습니다.

이번 전환 전 정상 배포는 `https://blog-i6mdetp02-hochois-projects.vercel.app` (`dpl_GJKrKy7n4BEu97w3Wcn9XTppsz3K`)입니다. 이후 릴리스에서는 직전 정상 배포 URL을 배포 기록에 갱신합니다.

이전 모노레포 코드를 다시 **빌드**하려면 프로젝트 설정도 그 코드에 맞춰야 합니다. 당시 Root Directory는 `apps/blog`, Node 22.x, Build Command는 `cd ../.. && pnpm turbo build --filter=@blog-platform/blog...`, Install Command는 `cd ../.. && pnpm install`이었습니다. 기존 빌드로 rollback하는 것과 이전 소스로 재빌드하는 것은 다릅니다.

## GitHub Actions 상태 (2026-11-10)

실행 42688896938은 코드 오류가 아니라 GitHub의 계정 결제 잠금으로 runner가 시작되지 못했습니다. 결제 설정은 변경하지 않았습니다. Vercel의 `pnpm build:release`는 동일한 테스트·lint·빌드를 직접 실행하므로 이 게이트를 통과한 배포만 반영합니다. GitHub CI 파일은 그대로 유지하며 계정 문제를 해결하면 다시 사용할 수 있습니다.
