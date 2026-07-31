# 기능 명세: Security Hardening

**Feature Branch**: `013-security-hardening`

**Created**: 2026-07-30

**Status**: Draft

**Input**: 사용자 설명: "ㅇㅇㅇㅇㅇ 해줘"를 로드맵의 다음 단계인 "Phase 12: Security Hardening"으로
해석

## 사용자 시나리오 및 테스트 _(필수)_

### 사용자 스토리 1 - 관리자 전용 CMS 쓰기 보장 (Priority: P1)

운영자는 CMS의 모든 콘텐츠 변경 작업이 설정된 GitHub 관리자 한 명에게만 허용되기를 원한다. 그래야
GitHub OAuth로 로그인한 다른 계정이나 인증되지 않은 사용자가 draft 저장, publish, unpublish,
archive, media upload 같은 repository 쓰기 작업을 실행하지 못한다.

**우선순위 근거**: CMS 쓰기 권한은 콘텐츠 원본인 repository를 직접 변경하므로 가장 먼저 보호되어야
한다. 이 경계가 약하면 preview token이나 배포 보안 이전에 콘텐츠 무결성이 깨진다.

**독립 테스트**: 관리자 계정, 비관리자 계정, 미인증 상태를 각각 구성해 CMS mutation 시도가 허용 또는
차단되는지 검증한다.

**Acceptance Scenarios**:

1. **Given** 설정된 관리자 GitHub login과 immutable user id가 모두 일치하는 session이 있을 때,
   **When** 운영자가 CMS 저장 또는 발행 작업을 실행하면, **Then** 해당 작업은 권한 검사를 통과한다.
2. **Given** GitHub login은 같지만 immutable user id가 다르거나, user id는 같지만 login이 다른
   session이 있을 때, **When** CMS mutation을 실행하면, **Then** 작업은 repository 쓰기 전에
   차단된다.
3. **Given** 미인증 사용자가 CMS mutation endpoint에 접근할 때, **When** 저장, 발행, 미디어 업로드
   같은 작업을 시도하면, **Then** 작업은 repository 쓰기 전에 차단된다.

---

### 사용자 스토리 2 - 제한된 GitHub write 권한 사용 (Priority: P2)

운영자는 CMS가 repository에 필요한 최소 권한으로만 쓰기를 수행하기를 원한다. 그래야 콘텐츠와 미디어
commit 작업은 가능하지만, 불필요한 repository 권한이나 장기 노출 credential에 의존하지 않는다.

**우선순위 근거**: GitHub write 권한은 CMS의 핵심 외부 권한이다. 단일 관리자 인증이 있어도 외부
권한이 과도하거나 오래 유지되면 사고 범위가 커진다.

**독립 테스트**: GitHub write credential 설정이 없거나 부족한 경우 안전하게 실패하고, 올바른 최소
권한 설정에서는 콘텐츠 읽기/쓰기와 미디어 commit만 가능함을 검증한다.

**Acceptance Scenarios**:

1. **Given** CMS에 필요한 GitHub App 설정이 올바르게 제공될 때, **When** 운영자가 콘텐츠 저장 또는
   미디어 업로드를 실행하면, **Then** CMS는 repository 콘텐츠 변경에 필요한 범위 안에서만 write
   작업을 수행한다.
2. **Given** GitHub App 설정 일부가 없거나 잘못되었을 때, **When** CMS write 작업을 실행하면,
   **Then** 사용자의 편집 내용은 보존 가능한 실패 상태가 되고 secret 값은 UI나 로그에 노출되지
   않는다.
3. **Given** repository 외 권한이 필요한 동작을 시도할 때, **When** CMS가 권한을 평가하면, **Then**
   해당 동작은 MVP 범위 밖으로 차단된다.

---

### 사용자 스토리 3 - 안전한 draft preview 접근 (Priority: P3)

운영자는 발행 전 draft를 제한된 시간 동안만 preview할 수 있기를 원한다. 그래야 공개 블로그가 draft나
오래된 preview token을 공개하지 않고, preview 대상 글이 바뀌면 기존 token도 무효화된다.

**우선순위 근거**: preview는 비공개 콘텐츠를 공개 앱에서 볼 수 있게 하는 예외 경로다. 발행 경계
원칙을 지키려면 token 만료, 콘텐츠 변경 감지, 캐시 금지가 함께 보장되어야 한다.

**독립 테스트**: 유효한 preview token, 만료된 token, 다른 글 token, 이전 content version token을
각각 사용해 draft preview 접근 허용/차단을 검증한다.

**Acceptance Scenarios**:

1. **Given** 운영자가 CMS에서 draft preview를 요청할 때, **When** token이 생성되면, **Then** token은
   대상 글, 만료 시각, 현재 콘텐츠 식별자, replay 방지 값을 포함한다.
2. **Given** preview token이 생성된 지 30분이 지났을 때, **When** 공개 블로그 preview에 접근하면,
   **Then** draft content는 표시되지 않는다.
3. **Given** token 생성 후 대상 글 내용이 변경되었을 때, **When** 기존 token으로 preview에 접근하면,
   **Then** draft content는 표시되지 않는다.
4. **Given** preview 응답이 제공될 때, **When** 브라우저나 중간 캐시가 응답을 저장하려 하면,
   **Then** 응답은 private no-store 정책으로 캐시되지 않아야 한다.

### Edge Cases

- 관리자 login 또는 immutable user id 중 하나만 일치하는 session은 관리자 권한으로 취급하지 않아야
  한다.
- GitHub App credential이 누락되었을 때 secret 원문을 오류 메시지, client bundle, analytics payload,
  logs에 노출하지 않아야 한다.
- repository write 실패와 public refresh 실패는 기존처럼 분리되어야 하며, 편집 중인 내용은 손실되지
  않아야 한다.
- preview token의 만료 시각이 현재보다 과거이거나 너무 먼 미래이면 무효로 처리해야 한다.
- preview token payload의 slug가 요청한 글과 다르면 preview를 차단해야 한다.
- preview token payload의 content identifier가 현재 글과 다르면 preview를 차단해야 한다.
- preview 접근은 RSS, Sitemap, robots, JSON-LD, OG image, analytics public event 대상에 포함되지
  않아야 한다.
- unsafe MDX 또는 sanitizer가 차단해야 하는 콘텐츠는 preview에서도 공개 렌더링되지 않아야 한다.

## 요구사항 _(필수)_

### 기능 요구사항

- **FR-001**: CMS mutation은 설정된 GitHub 관리자 login과 immutable user id가 모두 일치하는
  session에만 허용되어야 한다.
- **FR-002**: CMS mutation은 미인증 사용자와 비관리자 GitHub 사용자의 repository 쓰기를 repository
  접근 전에 차단해야 한다.
- **FR-003**: CMS write 작업은 repository 콘텐츠 변경에 필요한 최소 GitHub App 권한만 요구해야 한다.
- **FR-004**: GitHub App 설정 누락 또는 권한 부족 상태는 편집 내용을 보존 가능한 실패 상태로
  표시해야 하며, secret 값을 사용자 화면이나 로그에 노출하지 않아야 한다.
- **FR-005**: CMS는 장기 노출 credential을 client bundle에 포함하지 않아야 한다.
- **FR-006**: 시스템은 draft preview 접근을 위한 stateless signed token을 발급할 수 있어야 한다.
- **FR-007**: preview token은 대상 slug, 만료 시각, 현재 콘텐츠 식별자, replay 방지 값을 포함해야
  한다.
- **FR-008**: preview token은 생성 후 30분이 지나면 무효로 처리되어야 한다.
- **FR-009**: preview token의 slug가 요청 대상과 다르면 preview 접근을 차단해야 한다.
- **FR-010**: preview token의 콘텐츠 식별자가 현재 글과 다르면 preview 접근을 차단해야 한다.
- **FR-011**: preview 응답은 private no-store 캐시 정책을 적용해야 한다.
- **FR-012**: preview는 unsafe MDX, script, event handler, unsupported interactive component를 공개
  렌더링하지 않아야 한다.
- **FR-013**: draft와 archived content는 preview token이 없는 공개 페이지, RSS, Sitemap, robots,
  JSON-LD, OG image, analytics event 대상에서 계속 제외되어야 한다.
- **FR-014**: production-facing secret은 client bundle, public analytics payload, generated output,
  repository content 파일에 포함되지 않아야 한다.
- **FR-015**: 이 feature는 다중 관리자 권한, 승인 workflow, audit dashboard, 별도 보안 DB, object
  storage 전환을 포함하지 않아야 한다.

### 핵심 엔티티

- **Admin Identity**: CMS mutation을 허용할 단일 GitHub 관리자. login과 immutable user id를 모두
  포함한다.
- **Write Credential State**: CMS repository write에 필요한 GitHub App 설정의 준비/누락/권한 부족
  상태.
- **Preview Token**: draft preview를 제한적으로 허용하는 서명된 접근 증명. slug, 만료 시각, content
  identifier, nonce를 포함한다.
- **Preview Request**: 공개 블로그에서 draft preview 접근을 요청하는 행위. 요청 slug와 preview
  token을 함께 검증한다.
- **Secret Exposure Surface**: client bundle, UI 오류, logs, analytics payload, generated output처럼
  secret이 노출되면 안 되는 표면.

## 성공 기준 _(필수)_

### 측정 가능한 결과

- **SC-001**: 관리자 login과 immutable user id가 모두 일치하지 않는 CMS mutation 시도는 100%
  repository 쓰기 전에 차단된다.
- **SC-002**: GitHub App 설정 누락 또는 권한 부족 상태에서 secret 원문이 사용자 화면, client bundle,
  analytics payload, generated output에 노출되는 사례가 0건이어야 한다.
- **SC-003**: 유효한 preview token은 대상 draft를 30분 이내에만 열 수 있고, 30분 이후 접근 성공률은
  0%다.
- **SC-004**: content identifier가 변경된 후 이전 preview token으로 draft preview에 성공하는 사례가
  0건이어야 한다.
- **SC-005**: preview 응답의 100%가 private no-store 캐시 정책을 포함한다.
- **SC-006**: draft와 archived content가 preview token 없이 공개 페이지, RSS, Sitemap, JSON-LD, OG
  image, analytics event 대상에 포함되는 사례가 0건이어야 한다.
- **SC-007**: sanitizer 차단 대상 MDX가 preview를 통해 공개 렌더링되는 사례가 0건이어야 한다.

## 가정

- 기존 CMS Auth + Shell, GitHub Content Adapter, Publish Workflow, Generated Outputs, Analytics
  MVP가 이미 동작한다.
- 단일 운영자 MVP이므로 관리자 identity는 하나만 사용하고 다중 관리자 권한은 Post-MVP로 둔다.
- preview token은 서버에서 검증되며, token 원문 또는 secret은 analytics 이벤트나 public generated
  output에 포함하지 않는다.
- GitHub App은 repository contents write와 metadata read에 필요한 최소 권한으로 운영한다.
- 실제 production credential 발급과 외부 서비스 콘솔 설정은 Deployment phase에서 최종 확인한다.
