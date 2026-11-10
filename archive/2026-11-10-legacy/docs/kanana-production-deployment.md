# Kanana 운영 배포 · 2026-09-06

사용자 요청에 따라 실험용 네이버 모델에서 기존 Kanana 2 1.3B Q8으로 복귀했다. 사용자의 이용 판단을
전제로 진행했으며, 이 문서는 라이선스 적합성을 보증하는 법률 검토가 아니다.

## 구성

- 개발: 기존 로컬 3조각 GGUF 파일. 기존 캐시는 삭제하지 않았다.
- 운영: `kanana-model.json`에 고정된 Hugging Face revision의 단일 Q8 파일(1,377,890,688 bytes).
  Range GET 206, GGUF 헤더와 CORS 확인.
- 운영 모델을 Vercel 정적 파일로 재업로드하지 않는다. 배포용 복사본에서 `public/models`를 제외했다.
- RAG: `https://hozorica-portfolio-rag.hochoi8621.workers.dev`에 기존 D1·Vectorize·Workers AI
  바인딩으로 배포.
- RAG 인증 키는 Worker secrets와 Vercel `blog` 프로젝트의 Production sensitive 환경변수로 설정했다.
  이 문서에 키를 기록하지 않는다.
- Turbo 환경변수 허용 목록에 RAG 설정과 모델 URL override를 추가했다.
- 기존 CMS 프로젝트 연결과 개발 서버는 변경하지 않았다. 별도 임시 복사본을 `blog` 프로젝트로 연결해
  배포했다.

## 검증

- Blog 94테스트 및 lint 통과.
- Worker dry run 통과. 배포 버전: `9e89373f-0728-4d33-b9fa-301a7024f2de`.
- 운영 Worker의 AI 태그/React 질문에 공개 게시글 검색 HTTP 200 확인.
- Vercel 운영 빌드 및 도메인 전환 결과는 아래 최종 기록을 참고한다.

## 최종 배포 결과

- Vercel 빌드 성공(타입 검사·142개 정적 페이지 생성 완료).
- 배포 ID: `dpl_FDHhZt3pXg55wAyuVgDcQPuGHzW4`.
- 불변 배포 URL: `https://blog-bxz3nksog-hochois-projects.vercel.app`.
- 검증 후 `vercel promote` 성공, `https://hozorica.com`으로 운영 전환 완료.
- 새 배포의 홈·블로그·이력서·프로젝트·WASM HTTP 200 확인. 브라우저에서 픽셀 작업실과 핫스팟·채팅
  열기 UI 확인.
- 운영 도메인의 픽셀 작업실 및 RAG API 응답 확인. 모델 원본 Range/CORS와 배포 번들의 Kanana 표시는
  확인했으나, 이번 배포 검증에서 브라우저의 전체 모델 다운로드 후 답변 생성까지 재실행하지는 않았다.
- CMS는 배포하지 않았으며 git commit/push도 하지 않았다. 로컬 수정 사항은 보존되어 있으므로 이후 Git
  자동 배포 전에는 이 변경을 커밋해야 한다.
