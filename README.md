# 최호의 블로그

현재 승인된 디자인의 단일 Next.js·MDX 블로그입니다. Node 24.x와 pnpm 10.28.1을 사용합니다.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

글은 `app/blog/<slug>/page.mdx`에 작성합니다. 공개 글이 참조하는 공용 시각화 자료는 `app/blog/_drafts/`에도 있습니다.

검증은 `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm exec tsc --noEmit`입니다. 배포 빌드는 `pnpm build:release`가 테스트·lint·빌드를 차례로 실행합니다.

- [확정 디자인](DESIGN.md)
- [원본과 폰트 출처](NOTICE.md)

## 저장소

- 운영에 쓰이지 않는 이전 레포·초안 본문·실험 자료는 작업 트리에서 제거했습니다. 과거 내용은 Git 이력에서 확인할 수 있습니다. `fixtures/approved-design.json`은 현재 디자인의 회귀 검증 자료입니다.

`SITE_INDEXABLE=true`인 Production에서만 색인을 허용합니다. `SITE_URL`은 canonical·공유 URL·사이트맵이 사용할 실제 운영 주소입니다.

공유 이미지와 설치 아이콘은 저장소의 정적 파일입니다. 운영 빌드에는 Python이 필요하지 않습니다.

## 댓글과 좋아요

글 하단에 로그인 없는 동물 닉네임 댓글과 취소 가능한 좋아요를 제공합니다. 서버 전용 D1 설정이 필요합니다.
