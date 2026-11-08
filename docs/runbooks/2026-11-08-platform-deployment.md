# 플랫폼 단순화 운영 배포

## 범위

사용자가 운영 배포와 배포 후 공개·비공개 접근 검증을 요청했다. 기존 사용자 작업을 포함해 검증한
소스를 별도 snapshot으로 고정하고 CMS·Blog의 기존 도메인 및 Worker URL을 유지한다. Git push, 콘텐츠
마이그레이션, 대량 검색 동기화는 하지 않는다.

## 배포와 rollback

- CMS 이전 배포: `https://blog-8eqjz6pru-hochois-projects.vercel.app`.
- Blog 이전 배포: `https://blog-il4eh0ikv-hochois-projects.vercel.app`.
- 위 Vercel 배포는 `vercel promote <url> --scope hochois-projects --yes`로 되돌릴 수 있다.
- Worker 이전 version: `a73a7140-7973-497f-a46d-4fc7a7d2e6c5`. 실패 시 해당 version을 Wrangler
  rollback 대상으로 사용한다. D1·R2·Vectorize schema는 바꾸지 않는다.
- CMS·Blog는 production 설정으로 `--skip-domain` 후보를 만들고 검사 후 promote한다.

## 비공개 접근 probe

- Runbook id·slug·글 id: `deploycheck-platform-20261108-a691d3`.
- 제목: `[배포 검증] 비공개 접근 a691d3`.
- 공개하면 안 되는 본문 marker: `deploy-private-marker-a691d3`.
- D1에 위 단일 draft만 생성한다. 발행·미디어 업로드·Vectorize sync는 하지 않는다.
- 후보 및 운영 CMS API·Blog에서 404와 marker 부재를 확인한다.
- 성공·실패 모두 위 id·slug·제목과 `is_published = 0`이 일치하는 행만 삭제한다. 재실행할 때는 새
  id·slug를 사용한다. 기존 콘텐츠는 바꾸지 않는다.

## 기록

배포 snapshot hash manifest·배포 ID·검사 결과는 ignored
`_workspace/platform-simplification/deploy/`에 저장한다. 완료 결과는 감사 문서에 기록한다.

## 완료

CMS·Blog 후보 확인 후 기존 운영 도메인에 promote했고 Worker도 배포했다. 비공개 probe는 본문 없이
404를 반환했다. 검증 후 위 단일 D1 글을 삭제하고 0건임을 확인했다. 미디어·검색 리소스는 생성하지
않았다. 상세 배포 ID와 운영 검사는 [배포 감사](../audits/2026-11-09-platform-deployment.md)에
기록했다.
