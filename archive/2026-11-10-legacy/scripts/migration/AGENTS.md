# 콘텐츠 마이그레이션 작업 지침

## 원격 실행과 기록

- `scripts/migration/*`에는 원격 D1/R2에 쓰는 스크립트가 있다. 실제 실행 전 `migrate:dry-run`과
  검증·보고서 결과를 확인하고, `migrate:run`, `migrate:upload`, 원격 Wrangler 명령은 사용자가
  명시적으로 요청한 경우에만 실행한다.
- 원격 데이터 변경이나 대량 동기화에는 runbook id, rollback 가능 여부, 재실행 방법을 기록한다.

## 관련 문서

- 콘텐츠 저장소·계약을 바꾸면
  [콘텐츠 권위와 계약](../../docs/development-guide.md#콘텐츠-권위와-계약)을 확인한다.
- Cloudflare 리소스 변경은 `apps/rag-worker`의 설정·문서와
  [Worker 지침](../../apps/rag-worker/AGENTS.md)을 함께 확인한다.
- 검증과 완료 보고는 [개발 작업 가이드](../../docs/development-guide.md#검증)를 따른다.
