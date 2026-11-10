# 블로그

- 현재 앱은 `yun-blog`를 기반으로 한 단일 Next.js·MDX 블로그입니다. `app/`, `components/`, `lib/`를 수정합니다.
- 원본: https://github.com/78-artilleryman/yun-blog — 가져온 커밋은 `docs/upstream.md`에 기록합니다.
- UI는 좁은 단일 열, 여백, 절제된 타이포그래피를 유지합니다. 요청하지 않은 장식이나 기능을 추가하지 않습니다.
- UI 수정 전 루트 [DESIGN.md](DESIGN.md)를 읽습니다. 현재 화면 전체가 확정 기준입니다. SUIT Bold(700), 본문 15px, 인라인 코드 14.125px, 코드 블록 14px뿐 아니라 너비·마진·패딩·간격·라운드·색상·반응형·모션도 사용자 요청 없이 바꾸지 않습니다. 세부 구현의 기준 해시는 `docs/design-baseline.json`에 기록합니다.
- 글은 `app/blog/<slug>/page.mdx`에 작성합니다. 원저자의 글이나 개인 에셋을 재발행하지 않습니다.
- `components/demos/`는 향후 글에서 선택해서 쓰는 데모입니다. 예제를 자동으로 글 목록에 노출하지 않습니다.
- 검증은 `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`와 실제 로컬 화면 확인으로 진행합니다.
- Next.js를 수정하기 전 `node_modules/next/dist/docs/`에서 해당 버전 가이드를 읽습니다.
- `archive/2026-11-10-legacy/`는 이전 레포 전체의 원본입니다. 사용자가 요청하지 않으면 수정하지 않습니다.
- 기존 Git 이력은 루트 `.git/`에 보존합니다.
- `preview/`는 이전 HTML 시안이며 현재 앱의 발행 콘텐츠가 아닙니다.
- 메인↔상세 이동, 모바일 가로 넘침, 키보드 초점을 검증합니다.
- 로컬 설정·비밀키·의존성·생성물을 커밋하지 않습니다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
