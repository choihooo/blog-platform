# Contract: Rollback Switch

## Purpose

전환 중 또는 전환 후 장애 시, 기존 방식과 새 방식 간 빠르게 전환하기 위한 운영 계약이다.

## Inputs

- `contentSourceMode`: `legacy` 또는 `d1r2`
- `dualRunEnabled`: `true` 또는 `false`
- `rollbackWindowMinutes`: 기본 1
- `runbookId`: 현재 운영 run 식별자

## Runtime Rules

- `contentSourceMode` 기본값은 `legacy` 또는 `dual` 시작 상태로 둔다.
- `dualRunEnabled=true`일 때는 write 동작은 새 모드로, read compare 로그는 legacy + new로 남긴다.
- 전환 완료 조건: 설정 변경 후 7일간 성공률 하한과 이미지 노출율 하한을 만족해야 한다.
- 임계치 초과 실패 시 운영자는 `contentSourceMode=legacy`로 즉시 변경해 1분 내 공개 장애를 회복한다.

### State Machine

- `stable-legacy`
- `shadow-compare`
- `active-new`
- `rollback`
- `stabilized`

## Response Behavior

- 모드 변경은 설정 변경 즉시 반영된다.
- 롤백 실패 시 경고 로그를 남기고, 수동 운영 개입을 요구한다.
- 성공 시 7일 이중 보관 기간 동안 legacy 데이터는 삭제하지 않는다.

## Metrics

- 조회 일치율, 이미지 노출율, 500 응답률, 이중 조회 차이율은 1일 집계한다.
- 임계치 미달이 1회라도 발생하면 이슈 티켓으로 이관한다.
- 롤백 횟수는 운영 기록에 남겨 추적 가능한 형태로 보존한다.
