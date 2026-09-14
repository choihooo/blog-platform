# 공개 블로그 앱 작업 지침

## 책임

이 앱은 픽셀룸을 첫 화면으로 사용하는 공개 포트폴리오·블로그다.

- `app`: Next.js App Router 라우팅과 페이지 메타데이터
- `features`: 화면 기능과 도메인별 UI
- `shared`: 앱 공통 유틸리티와 제공자
- `public/pixel`: 픽셀룸 에셋
- `scripts`: 로컬 개발·빌드 준비 스크립트

## 라우팅과 모달

- 홈의 픽셀룸은 공개 탐색 경험의 기준점이다.
- 블로그, Work, About, Resume는 기존 가로채기 라우트와 모달 패턴을 먼저 확인한다.
- 같은 목적지에 parallel route나 모달 슬롯을 중복으로 추가하지 않는다.
- 모달을 닫을 때 이전 모달이 다시 열리거나 픽셀룸이 초기화되지 않게 한다.
- 새 canonical URL은 직접 진입, 새로고침, 브라우저 뒤로 가기를 모두 지원해야 한다.
- 모달 안에서 다시 전체 레이아웃이나 헤더를 중복 렌더링하지 않는다.

## 픽셀룸 UI

- 기존 Hozui 토큰과 픽셀룸 색상 체계를 우선 사용한다.
- 배경 에셋과 캐릭터 레이어의 위치 기준을 임의로 바꾸지 않는다.
- 애니메이션은 모달의 위치 계산을 담당하지 않게 한다. 위치는 레이아웃이 결정하고 애니메이션은
  opacity와 scale 정도만 담당한다.
- `prefers-reduced-motion`에서 전환을 줄인다.
- 데스크톱·모바일 모두 가로 스크롤이 생기지 않게 확인한다.

## 콘텐츠와 모델 파일

- 글 데이터는 콘텐츠·데이터 계층에서 관리하고 시각 컴포넌트에 하드코딩하지 않는다.
- 로컬 모델이나 WASM 파일을 새로 커밋하지 않는다.
- 모델 준비 스크립트를 수정하면 개발 서버와 프로덕션 빌드의 동작을 각각 확인한다.

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
