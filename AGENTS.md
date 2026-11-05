# 블로그 플랫폼 작업 지침

수정할 경로에 별도 `AGENTS.md`가 있으면 함께 읽는다.

## 저장소 구조

- `apps/blog`: 캐릭터 스크롤 홈 기반 공개 포트폴리오·블로그
- `apps/cms`: 비공개 운영자용 CMS
- `apps/rag-worker`: Cloudflare Worker 기반 검색·RAG API
- `packages/*`: 여러 앱에서 공유하는 TypeScript 패키지

## 기본 원칙

- 작업 전 현재 변경 사항을 확인하고, 관련 없는 변경은 보존한다.
- 소스 파일은 `apply_patch` 방식으로 수정한다.
- 비밀키, `.env` 파일, 개인 모델 파일을 커밋하지 않는다.
- 생성물인 `.next`, `dist`, `.turbo`, `.wrangler`를 직접 수정하지 않는다.
- 새 의존성은 기존 패키지로 해결할 수 없는 경우에만 추가한다.
- 패키지의 공개 API나 데이터 계약을 바꾸면 해당 패키지의 테스트와 README를 함께 확인한다.

## 패키지 경계

- 앱의 UI·라우팅 변경은 해당 앱에서 처리한다.
- 공유 로직은 먼저 관련 `packages/*`의 책임에 해당하는지 확인한다.
- 콘텐츠 데이터는 UI 컴포넌트 안에 하드코딩하지 않는다.
- Cloudflare 리소스 변경은 `apps/rag-worker`의 설정과 문서를 함께 확인한다.

## 콘텐츠 권위와 계약

- 현재 CMS의 기본 콘텐츠 adapter는 `apps/cms/lib/content-adapter/content-adapter.ts`의 `d1r2`
  구현이다. 공개 Blog는 `BLOG_CONTENT_PROXY_URL`이 있으면 `remote`, 없으면 `d1r2`를 사용하므로
  콘텐츠 변경은 두 경로를 함께 확인한다.
- `content/posts/*.mdx`를 언급하는 기존 설계 문서는 파일 기반 legacy 계약일 수 있다. 저장소 방식을
  바꿀 때는 `apps/cms/lib/content-adapter`, `apps/blog/features/blog/server/content-source.ts`, 관련
  `specs/*/contracts`, README를 함께 갱신한다.
- 앱 사이의 route, payload, 상태 전이, 공개 API를 바꾸면 관련 `specs/*/contracts`와 실제
  호출부·fixture를 함께 확인한다.

## 운영 스크립트와 원격 변경

- `scripts/migration/*`에는 원격 D1/R2에 쓰는 스크립트가 있다. 실제 실행 전 `migrate:dry-run`과
  검증·보고서 결과를 확인하고, `migrate:run`, `migrate:upload`, 원격 Wrangler 명령은 사용자가
  명시적으로 요청한 경우에만 실행한다.
- 원격 데이터 변경이나 대량 동기화에는 runbook id, rollback 가능 여부, 재실행 방법을 기록한다.

## 검증

변경한 패키지의 관련 테스트부터 실행하고 lint·typecheck로 범위를 넓힌다. 하위 `AGENTS.md`에 필수
검사가 있으면 함께 실행한다.

```sh
pnpm --filter <패키지명> lint
pnpm --filter <패키지명> typecheck
pnpm --filter <패키지명> test
```

라우팅·공개 콘텐츠·공유 패키지 계약을 바꾼 경우에는 필요에 따라 다음을 추가한다.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

- 검사 실패를 수정하면 관련 검사를 다시 실행한다. 이전 코드에서의 통과 결과로 현재 변경을 검증했다고
  보고하지 않는다.
- 문서만 수정했다면 문서 형식과 diff를 확인한다. 앱 테스트·빌드를 불필요하게 실행하지 않는다.
- 환경·인증·도구 문제로 실행할 수 없는 검사는 미검증으로 기록한다. 실패와 미실행을 통과로 처리하지
  않는다.

## SEO 검증 루프

- 공개 URL·메타데이터·본문 렌더링·공유 SEO 로직을 바꾸면 완료 전에 설치된 `claude-seo-for-codex`의
  관련 스킬을 읽고 적용한다. 문서만 바꾸면 생략한다.
- 현재 수정본의 로컬 서버나 미리보기에서 영향받는 대표 페이지를 검사한다. 운영 사이트 점검으로
  미배포 변경의 검증을 대신하지 않는다.
- 근거 있는 문제를 정리 → 요청 범위의 문제 수정 → 같은 검사 재실행 순서로 진행한다. 기존의 관련 없는
  문제는 별도로 보고한다.
- 의도된 noindex와 일반 최적화 제안을 장애로 취급하지 않는다. 스킬 점수만으로 판정하지 않는다.
- 도구·환경이 없으면 가능한 소스·테스트 검사를 수행하고 실제 페이지는 미검증으로 보고한다. 확인된
  공개 동작 오류가 남으면 배포 준비 완료로 보고하지 않는다.
- 여러 페이지의 감사·배포 점검 결과는 `docs/audits/`에 남긴다.

## 완료 보고

최종 응답에는 다음을 간단히 기록한다.

- 수정한 파일과 핵심 변경
- 실행한 검증 명령과 결과
- SEO 검증 결과 또는 생략 이유
- 아직 실행하지 못한 검증 또는 남은 위험
