# 공개 블로그 앱 작업 지침

## 책임

이 앱은 캐릭터 스크롤 스토리를 첫 화면으로 사용하는 공개 포트폴리오·블로그다.

- `app`: Next.js App Router 라우팅과 페이지 메타데이터
- `features`: 화면 기능과 도메인별 UI
- `shared`: 앱 공통 유틸리티와 제공자
- `public/pixel`: 픽셀룸 에셋
- `scripts`: 로컬 개발·빌드 준비 스크립트

## 라우팅과 모달

- 홈은 `features/scroll-story`이며 픽셀룸은 `/experiments/pixel-room`에 noindex로 보관한다.
- 블로그, Work, About, Resume는 일반 페이지다. 기존 URL을 유지하며 모달을 다시 추가하지 않는다.
- 같은 목적지에 parallel route나 모달 슬롯을 중복으로 추가하지 않는다.
- 모달을 닫을 때 이전 모달이 다시 열리거나 픽셀룸이 초기화되지 않게 한다.
- 새 canonical URL은 직접 진입, 새로고침, 브라우저 뒤로 가기를 모두 지원해야 한다.
- 모달 안에서 다시 전체 레이아웃이나 헤더를 중복 렌더링하지 않는다.

## 홈과 보관 픽셀룸 UI

- 기존 Hozui 토큰과 승인된 스토리 장면/색상 체계를 우선 사용한다.
- 홈 미디어는 `public/brand/scroll-story/plates-ultrawide-v2`이며 픽셀룸 에셋은 메인에서 사용하지 않는다.
- 홈 hash 변경은 history state를 보존하는 replace로 처리하며 상세에서 뒤로 가면 장면을 복원한다.
- 챗봇 모델 로드는 최초 사용자 열기 이후 시작한다. 홈 mount에서 자동 다운로드하지 않는다.
- 배경 에셋과 캐릭터 레이어의 위치 기준을 임의로 바꾸지 않는다.
- 애니메이션은 모달의 위치 계산을 담당하지 않게 한다. 위치는 레이아웃이 결정하고 애니메이션은
  opacity와 scale 정도만 담당한다.
- `prefers-reduced-motion`에서 전환을 줄인다.
- 데스크톱·모바일 모두 가로 스크롤이 생기지 않게 확인한다.

## 콘텐츠와 모델 파일

- 글 데이터는 콘텐츠·데이터 계층에서 관리하고 시각 컴포넌트에 하드코딩하지 않는다.
- 현재 공개 콘텐츠는 `features/blog/server/content-source.ts`의 `d1r2` 또는 `remote` 모드에서
  읽는다. `BLOG_CONTENT_PROXY_URL` 유무, published-only 필터, `blogContentCacheTags`와
  `revalidatePath` 동작을 함께 확인한다.
- 프로젝트·이력서처럼 `features/*/data`에 있는 정적 데이터는 UI 컴포넌트와 분리된 데이터 모듈로
  유지한다.
- 로컬 모델이나 WASM 파일을 새로 커밋하지 않는다.
- 모델 준비 스크립트를 수정하면 개발 서버와 프로덕션 빌드의 동작을 각각 확인한다.

## API와 미리보기

- `/api/rag`는 same-origin 검사, bounded JSON, `no-store` 응답 계약을 유지한다. 검색 오류는 `400`,
  `429`, `503`의 의미를 섞지 않는다.
- `/api/revalidate`는 `BLOG_REVALIDATE_SECRET`과 public path 검증을 거친 뒤 콘텐츠 cache와 필요한
  RAG post sync를 갱신한다. 페이지 갱신 성공과 RAG sync 실패를 별도 상태로 표시한다.
- `/api/search`의 공개 캐시 헤더를 임의로 `no-store` 또는 장기 캐시로 바꾸지 않는다.
- `/preview/[slug]`는 preview token, `private, no-store`, `noindex,nofollow,noarchive`를 유지하고
  draft 내용이 일반 공개 route나 generated output에 섞이지 않게 한다.

## 검증

```sh
pnpm --filter @blog-platform/blog format:check
pnpm --filter @blog-platform/blog lint
pnpm --filter @blog-platform/blog typecheck
pnpm --filter @blog-platform/blog test
pnpm --filter @blog-platform/blog build
```

라우팅 변경이면 직접 URL, 모달 열기, 닫기, backdrop 클릭, Escape, 브라우저 뒤로 가기, 새로고침을
확인한다.
