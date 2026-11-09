# 최호의 블로그

현재 승인된 디자인의 단일 Next.js·MDX 블로그입니다. Node 24.x와 pnpm 10.28.1을 사용합니다.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

글은 `app/blog/<slug>/page.mdx`, 초안은 비공개 폴더 `app/blog/_drafts/`에 작성합니다. 실제 첫 글이 준비되기 전에는 빈 목록을 표시합니다. 예시 글을 실제 경험담으로 발행하지 않습니다.

검증은 `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm exec tsc --noEmit`입니다. 배포 빌드는 `pnpm build:release`가 테스트·lint·빌드를 차례로 실행합니다.

- [글 발행](docs/publishing.md)
- [배포·환경 변수·롤백](docs/deployment.md)
- [확정 디자인](DESIGN.md)
- [원본과 폰트 출처](NOTICE.md)

## 보존 자료

- 예시 글: `fixtures/demo-posts/` — 공개 라우트가 아닙니다.
- 색상 비교: `app/_lab/color-lab/` — Next.js 비공개 폴더입니다.
- 디자인 비교 원문·시안: `docs/reference/design-lab/` — public 폴더에서 제외했습니다.
- 과거 레포 전체: 원래 작업 폴더 `/Users/choiho/coding/blog/archive/2026-11-10-legacy/`에 보존하며 Git 이력은 그대로 유지합니다. `archive/manifest.json`으로 기존 추적 파일을 확인할 수 있습니다.

디자인 비교만 로컬에서 볼 때는 `pnpm design:lab` 후 `python3 -m http.server 4184 --directory docs/reference`를 실행해 `/design-lab/index.html`을 엽니다.

첫 공개 전까지 `SITE_INDEXABLE=false`를 유지합니다. `SITE_URL`은 canonical·공유 URL·사이트맵이 사용할 실제 운영 주소입니다. 기존 RAG·CMS·OAuth·DB 환경 변수는 현재 앱에 필요하지 않습니다.

공유 이미지는 SUIT Bold 폰트에서 생성한 정적 파일입니다. 다시 만들 때는 로컬의 Pillow/fontTools 환경에서 `python3 scripts/generate-brand-assets.py`를 실행합니다. 운영 빌드에는 Python이 필요하지 않습니다.
