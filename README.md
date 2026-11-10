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

- 과거 레포 전체는 원래 작업 폴더 `/Users/choiho/coding/blog/archive/2026-11-10-legacy/`에 보존합니다. Git 이력과 `archive/manifest.json`도 유지합니다.
- 운영에 쓰이지 않는 예시 글·데모·디자인 비교 자료·이전 폰트는 제거했습니다. `fixtures/approved-design.json`은 현재 디자인의 회귀 검증 자료입니다.

첫 공개 전까지 `SITE_INDEXABLE=false`를 유지합니다. `SITE_URL`은 canonical·공유 URL·사이트맵이 사용할 실제 운영 주소입니다. 기존 RAG·CMS·OAuth·DB 환경 변수는 현재 앱에 필요하지 않습니다.

공유 이미지는 SUIT Bold 폰트에서 생성한 정적 파일입니다. 다시 만들 때는 로컬의 Pillow/fontTools 환경에서 `python3 scripts/generate-brand-assets.py`를 실행합니다. 운영 빌드에는 Python이 필요하지 않습니다.

## 댓글과 좋아요

글 하단에 로그인 없는 동물 닉네임 댓글과 취소 가능한 좋아요를 제공합니다. 서버 전용 D1 설정이 필요합니다. [D1 연결·로컬 실행·댓글 관리](docs/anonymous-engagement.md)를 참고하세요.
