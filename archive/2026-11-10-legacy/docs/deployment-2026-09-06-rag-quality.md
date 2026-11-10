# 챗봇 품질 개선 운영 배포 · 2026-09-06

- 운영 URL: https://hozorica.com
- Vercel 배포: `dpl_F74VsKETL4N6bzokkeuNm6GTuWUs`
- 불변 URL: https://blog-ih2dip6nw-hochois-projects.vercel.app
- Worker 버전: `9d92ca2b-4e23-450a-98eb-19bd7c134c6b`
- 기존 D1·Vectorize·R2와 인증 설정을 유지했다. 데이터 삭제·마이그레이션·모델 재업로드는 하지 않았다.
- 임시 복사본에서 로컬 모델, 환경변수 파일, 작업 산출물을 제외하고 기존 Vercel `blog` 프로젝트에
  배포했다. CMS는 배포하지 않았다.

## 검증

- Blog 134개 및 Worker 5개 테스트 통과. Blog lint와 git diff 공백 검사 통과.
- Vercel 운영 빌드와 타입 검사, 142개 정적 페이지 생성 성공.
- 새 배포에서 검색·프로필·프로젝트·후속 질문 API 회귀 검증 30/30 통과. 브라우저 모델의 생성 문장
  품질 검증과는 별개다.
- 새 배포의 홈·블로그·이력서·프로젝트·WASM HTTP 200 확인 후 promote 성공.
- 운영 도메인에서 픽셀 작업실과 주요 페이지, 대표 프로젝트 및 AI 글 검색 응답을 확인했다.
- 이번 배포에서 브라우저 전체 모델 다운로드와 GPU 답변 생성을 재실행하지 않았다.
- 기존 미사용 인증·Slack 환경변수의 Turbo 허용 목록 경고는 남아 있다. 현재 블로그와 공유 패키지에서
  해당 변수 참조는 발견되지 않았다.

## 보존 및 롤백

- 로컬 개발 서버와 기존 수정 사항을 유지했다. Git commit/push는 하지 않았다. 이후 Git 자동 배포 전에
  변경을 커밋해야 한다.
- 직전 블로그 배포: `dpl_2Jr5PsdGcDZsuL6VSae6fM6WUeu1` (블로그만 되돌릴 경우 해당 배포를 promote).
- 이번 변경 내용: [RAG 품질 개선](./rag-quality-improvements.md).
