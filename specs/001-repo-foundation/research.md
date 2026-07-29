# Research: Repo Foundation

## 결정: constitution이 정의한 monorepo 구조를 source of truth로 사용한다

**근거**: project constitution과 roadmap은 이미 `apps/blog`, `apps/cms`, `packages/` 아래 공유
package 구조로 수렴해 있다. 이 구조를 사용하면 alternate ownership boundary를 만들지 않고
이후 phase를 문서화된 package responsibility에 직접 매핑할 수 있다.

**검토한 대안**:

- admin route를 포함한 single app: 공개 blog와 private CMS responsibility를 흐리므로 제외했다.
- separate repository: 공유 Markdown, preview, SEO, analytics, design behavior의 일관성을
  유지하기 어려우므로 제외했다.

## 결정: Phase 0 app shell은 최소 기능과 낮은 dependency로 유지한다

**근거**: foundation은 content file, authentication, GitHub credential, publishing flow 없이 두
app이 독립적으로 runnable함을 증명해야 한다. 최소 shell은 executable boundary를 제공하면서
Phase 0 scope를 유지한다.

**검토한 대안**:

- 실제 CMS dashboard와 blog view를 바로 구현: content, auth, rendering, editor phase에 속하므로
  제외했다.
- mocked auth/content system 추가: content와 auth spec이 존재하기 전에 contract를 고정하므로
  제외했다.

## 결정: root workspace validation을 primary foundation contract로 사용한다

**근거**: 이 feature의 핵심 가치는 모든 app과 package가 하나의 build, type-check, lint,
format path에 참여함을 증명하는 것이다. root command는 contributor와 future task가 사용할
안정적인 validation entry point를 제공한다.

**검토한 대안**:

- package별 수동 검증: 느리고 일관성이 낮으며 누락되기 쉬워 제외했다.
- feature code가 생길 때까지 validation command 연기: 이후 phase가 의존하기 전에 package
  participation 누락을 발견해야 하므로 제외했다.

## 결정: `docs/`는 documentation folder로 보존한다

**근거**: roadmap과 constitution은 `docs/`가 별도 app이 아니라 Markdown documentation folder로
남아야 한다고 정한다. 기존 문서를 보존하면 현재 planning context를 지키고 platform scope
확장을 피할 수 있다.

**검토한 대안**:

- docs website 생성: MVP roadmap 밖의 작업이므로 제외했다.
- docs를 app package로 이동: 문서화된 구조와 충돌하므로 제외했다.

## 결정: shared package는 Phase 0에서 skeleton boundary로 취급한다

**근거**: editor, Markdown, SEO, analytics, AI flag, design system의 실제 package contract는
이후 phase에서 정의한다. Phase 0에는 발견 가능한 package ownership과 validation 참여만
필요하다.

**검토한 대안**:

- package logic을 조기 구현: behavior는 이후 feature spec에 속하므로 제외했다.
- 필요해질 때까지 package 생성을 생략: constitution이 이 ownership boundary를 요구하고 이후
  phase가 안정적인 위치에 의존하므로 제외했다.
