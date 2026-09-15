# CMS 앱 작업 지침

## 책임

CMS는 인증된 운영자만 사용하는 비공개 앱이다. 콘텐츠 편집·검증·발행과 운영 지표 화면을 담당한다.

## 콘텐츠 작업

- 저장은 draft 변경이고 공개 새로고침과 혼동하지 않는다.
- Publish, Unpublish, Archive의 상태 전이를 기존 runbook과 함께 확인한다.
- editor 문서는 `@blog-platform/editor`의 native document model과 serializer를 통과시킨다.
- slug, `publishedAt`, SEO 점수와 preview 데이터를 발행 경계에서 검증한다.
- 생성된 공개 콘텐츠 파일을 수동으로 고치지 않는다.
- `createContentAdapter()`의 기본 구현은 현재 D1/R2 adapter다. adapter mode 인자를 추가하거나 바꿀
  때는 local, repository, D1/R2 adapter의 계약과 fixture를 함께 확인한다.
- `runPublicationOperation()`은 repository 저장과 public refresh를 분리해 결과를 반환한다. commit
  성공 뒤 refresh가 실패할 수 있으므로 retry token, 재시도 대상, 사용자에게 표시할 상태를 보존한다.
- `CONTENT_SOURCE_MODE`, dual-run, rollback window를 바꾸면 `lib/admin-ops/migration-switch.ts`,
  `rollout-checks.ts`, runbook과 migration report를 함께 확인한다.

## 보안

- 비밀키를 로그, 오류 메시지, 테스트 fixture에 출력하지 않는다.
- GitHub App, preview token, deploy hook, revalidate secret의 검증·redaction 로직을 우회하지 않는다.
- 실제 발행·revalidate·repository mutation은 명시적으로 요청된 경우에만 실행한다.
- 환경변수 누락은 안전한 실패로 처리하고 secret 값을 오류에 포함하지 않는다.
- preview token은 `slug`, `contentSha`, 만료 시각에 묶인 HMAC 값이다. token을 로그·캐시에 남기거나
  stale content를 유효한 preview로 허용하지 않는다.

## 검증

```sh
pnpm --filter @blog-platform/cms format:check
pnpm --filter @blog-platform/cms lint
pnpm --filter @blog-platform/cms typecheck
pnpm --filter @blog-platform/cms test
pnpm --filter @blog-platform/cms build
```

인증·발행·마이그레이션을 바꾼 경우에는 관련 security, admin-ops, migration 테스트를 반드시 확인한다.
