# 픽셀룸 루트 이식 — 2026-09-06

## 적용

- apps/blog/app/page.tsx의 기존 HomeExperience 대신 PixelRoom 렌더링. 기존
  메타데이터·canonical·Person JSON-LD 유지.
- 기존 HomeExperience 소스는 보존. CMS·D1 데이터·프로젝트·이력서 내용은 변경하지 않음.
- Work → /projects, Blog → /blog, About → /resume. 준비 중 모달 제거, 실제 Next Link 연결.
- 루트에서만 SiteShell 헤더를 숨기고 하위 페이지와 클라이언트 이동 시 복원.
- 프런트엔드 스킬의 스타일 격리 원칙에 따라 모든 룸 CSS를 .pixel-room-page 아래로 제한. 기존 전역
  스타일·Tailwind 4 설정 유지.
- 사용 중인 이미지 6개만 이식. 캐릭터 3자세·시간대·조명·키보드 링크·reduced-motion 유지.
- hozui 채팅/Q8 로컬 런타임 이식. Q4 파일과 선택 버튼 제외. 모델은 사용자가 로드 버튼을 눌렀을 때만
  다운로드.
- predev/prebuild에서 설치된 wllama의 WASM을 public/wasm에 준비. 생성물은 gitignore 처리.
- 모델 다운로드에 필요한 Hugging Face 연결과 blob Worker를 CSP에 허용. 기존 보안 헤더 유지.
- 챗봇 안내를 ‘사이트 자료 미등록’이 아닌 ‘챗봇 자료 연결 준비 중’으로 정정. RAG와 환각 방어는
  미구현이며 사이트의 실제 경력을 답변 근거로 사용하지 않음.

## 검증

- 블로그 lint 통과.
- 프로덕션 build 및 포함된 TypeScript 검사 통과.
- Vitest 17개 파일, 49개 테스트 통과. 신규 4개는 루트 SEO·링크·이미지 파일·스타일 범위·Q4 제외에
  대한 정적 계약 테스트.
- localhost:3001 프로덕션 미리보기: 픽셀룸 렌더링, About → Resume, 홈 복귀, Work → Projects, 헤더
  표시/숨김 확인.
- WASM 요청 200, application/wasm 확인.
- 이식 후 모델 전체 다운로드·응답 생성 재시험, 모바일/다른 브라우저 시각 검수는 아직 하지 않음.
- D1/Vectorize 원격 변경, 커밋·푸시·배포 없음. 기존 사용자 변경과 untracked 파일 보존.

## 실행

루트에서 `pnpm --filter @blog-platform/blog dev` 실행. 3000번 포트에 기존 실험 서버가 있다면 다른
포트를 지정한다. 현재 검증용 서버는
`pnpm --filter @blog-platform/blog exec next start --port 3001`로 실행 중이다.
