# 플랫폼 단순화 운영 배포와 확인

## 배포 범위

사용자가 운영 배포와 배포 후 검증을 요청했다. `b321ad5` 및 기존 사용자 미커밋 변경을 포함한, 앞서
함께 검증했던 소스를 고정한 snapshot으로 배포했다. 사용자 변경을 별도 제품 커밋으로 묶거나 Git
push하지 않았다. 기존 도메인·공개 경로·D1·R2·Vectorize 설정은 유지했다.

배포 snapshot은 785개 파일이며 manifest SHA-256은
`09f96d2a9f5d19c98b6158b53186f13015ac331303cf8ace60915aba75a3b453`다. 실제 `.env`·개인 모델·로컬
생성물은 업로드하지 않았다. 각 서비스의 기존 운영 환경변수를 사용했다.

| 서비스 | 새 운영 배포                           | 확인                                          |
| ------ | -------------------------------------- | --------------------------------------------- |
| CMS    | `dpl_7TPvJqF44hGdG6AEk5UtGTDDzAgP`     | `cms.hozorica.com`이 해당 Ready 배포를 가리킴 |
| Blog   | `dpl_G6d2dkYm1D6ipCgp4LzfYwsauDL2`     | `hozorica.com`이 해당 Ready 배포를 가리킴     |
| Worker | `f2e0ee34-ebcc-4537-bb5a-a50cc6195ef3` | 기존 workers.dev URL에서 health·인증 검색 200 |

CMS·Blog는 production 설정의 `--skip-domain` 후보에서 검사한 뒤 promote했다. CLI 출력의 초기
`INITIALIZING`과 Ready를 혼동하지 않고 실제 빌드 종료와 운영 배포 ID를 확인했다. Worker도
dry-run으로 binding을 확인한 뒤 배포했다.

## 검증 결과

- 배포 전 전체 테스트를 재실행했다. 앞서 검증한 648개 통과·1개 건너뜀 결과가 Turbo cache에서
  재사용됐으며, 제품 소스는 해당 검증본과 동일하다. CMS·Blog는 Vercel에서 실제 운영 빌드를 완료했다.
- CMS 후보에서 기존 발행 글 200과 새 비공개 probe 404를 확인했다. promote 후 운영 CMS API와 Blog도
  비공개 probe를 404로 응답했고 본문 marker가 없었다. 기존 발행 글은 API·Blog 모두 200이었다.
- 운영 HTTP 21개 경로가 예상한 200·308·404를 반환했다. 홈·About·Resume·프로젝트·블로그·RSS·sitemap·
  robots와 기존 경로 redirect를 포함한다. canonical 중복 없음, 필요한 noindex, sitemap의 비공개 URL
  부재와 기존 글 JSON-LD 파싱을 확인했다.
- 운영 CMS에서 기존 로그인 세션과 글 39개 목록을 확인했다. 실제 프로젝트 창 열기와 390×844 화면에서
  가로 넘침 없음(`scrollWidth = 390`)·헤더 1개를 확인했다.
- Worker 직접 검색과 Blog `/api/rag` 모두 200으로 기존 Nexacro 프로젝트를 반환했다. Blog 응답의
  `Cache-Control: no-store`도 유지됐다. 기존 R2 이미지의 실제 HTTP 응답도 확인했다.

`seo-technical` 스킬의 공개 접근·색인·URL·서버 HTML 관련 항목을 적용했다. 로컬 검증은 앞선 감사에
있으며 이번 기록은 실제 배포 후 검사다. 외부 검색엔진 색인과 실사용 CWV 수치를 측정한 것은 아니다.
운영에서 새 콘텐츠의 업로드·발행을 다시 실행하지는 않았다. 이전 운영 E2E 기록과 새 배포의
공개/비공개 조회·인증·검색·이미지 응답을 구분한다.

## 정리와 rollback

비공개 probe `deploycheck-platform-20261108-a691d3`는 정확한 id·slug·제목과 비공개 조건으로 단일
행만 삭제했다. 삭제 1건·남은 0건을 확인했다. 기존 글은 변경하지 않았고 새 이미지·벡터도 만들지
않았다. 상세 조건과 이전 운영 배포로 되돌리는 방법은
[배포 runbook](../runbooks/2026-11-08-platform-deployment.md)에 있다.

실행 로그와 snapshot manifest는 ignored `_workspace/platform-simplification/deploy/`에 남겼다. 기존
사용자 미커밋 작업은 보존했고, 배포 감사·runbook만 후속 문서 커밋으로 통합한다.
