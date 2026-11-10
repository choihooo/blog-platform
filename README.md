# 최호의 블로그

[yun-blog](https://github.com/78-artilleryman/yun-blog)를 기반으로 시작한 단일 Next.js·MDX 블로그입니다. 원본의 글과 개인 미디어는 가져오지 않았고, 데모 컴포넌트는 보존했습니다.

## 실행

```sh
pnpm install --frozen-lockfile
pnpm dev --port 4174
```

검증: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`.

## 글 작성

`app/blog/_template/`를 새 slug로 복사하고 메타데이터와 본문을 작성하면 홈 목록에 표시됩니다. `_`로 시작하는 폴더는 비공개이며 목록에서도 제외합니다. 목록의 권위는 `lib/posts.ts`입니다.

현재는 화면 확인용 예시 글 5편을 넣었습니다. 각 글의 `post.demo: true`로 메인과 상세에 예시 안내를 표시합니다. 날짜·제목·본문은 시안용이며 실제 발행 기록이 아닙니다. 실제 글로 바꿀 때 예시 폴더를 제거하고 글을 작성합니다. `motion-you-can-feel`에는 버튼·등장 순서·이징 데모, `following-a-request`에는 흐름도·부분 렌더링 데모가 있습니다.

`components/demos/animation`에는 버튼·등장 순서·이징 예제가 있고, `components/demos/cache-components`에는 흐름도 예제가 있습니다. 데모는 공개 페이지나 발행 글이 아닙니다.

## 디자인

좁은 단일 열, 넉넉한 여백, 작은 제목과 절제된 색상을 유지합니다. [레퍼런스 검토](docs/design-reference-notes.md)에 추가 후보를 기록했습니다. 이번에는 새 장식·탐색 기능을 추가하지 않았습니다.

### 세 가지 디자인 비교

`/design-lab/index.html`에서 ThoughtStream, Warm Editorial, Editorial Logbook의 메인·상세를 비교할 수 있습니다. 각 안은 동일한 예시 글 5편을 사용합니다. 원본 DESIGN.md는 각 시안 디렉터리에 보존했으며 `public/design-lab/sources.json`에 출처와 해시가 있습니다.

예시 글을 수정한 뒤 `pnpm design:lab`으로 비교용 HTML을 다시 생성합니다. 수정할 소스는 `scripts/build-design-lab.mjs`와 `public/design-lab/assets/`입니다. 생성된 HTML을 직접 수정하지 않습니다. `docs/design-lab.md`에서 해석·대체 사항을 확인할 수 있습니다.

현재는 초기 준비 상태로 `noindex, nofollow`를 설정했습니다. 실제 글과 공개 도메인이 정해지면 robots·canonical·공유 메타데이터를 검토하고 발행합니다.

## 보존한 자료

- `archive/2026-11-10-legacy/`: 이전 레포 전체. 커밋 전 수정·로컬 설정·의존성 포함.
- `archive/manifest.json`: 원래 HEAD와 추적 파일 909개의 SHA-256.
- `preview/`: 이전 HTML 시안. 현재 앱이 아니며 Next.js 라우트로 공개되지 않습니다.
- 루트 `.git/`: 기존 저장소 이력. 원본 레포의 Git 이력·remote로 교체하지 않았습니다.

아카이브는 빌드·타입 검사·lint 대상에서 제외했습니다. 출처와 변경 범위는 [upstream 기록](docs/upstream.md)에 있습니다.

## 댓글과 좋아요

글 하단에 로그인 없는 랜덤 닉네임 댓글과 취소 가능한 좋아요를 제공합니다. 운영 저장소는 Cloudflare D1이며 서버 전용 연결 설정이 필요합니다. [D1 연결·로컬 실행·댓글 관리](docs/anonymous-engagement.md)를 참고하세요.
