# 운영 전환 검증 기록 — 2026-11-10

- 승인된 화면 기준: e0728cf. 운영 준비 커밋: b25ce2c.
- Node v24.22.2 / pnpm 10.28.1로 별도 작업 공간에 frozen-lockfile 설치.
- 테스트 19개, lint, Next.js build, tsc 통과. Vercel Preview에서도 release gate 통과.
- fixtures/approved-design.json으로 CSS·SUIT 폰트·프로필·헤더·목록·검색·목차/복사 관련 컴포넌트와 RootLayout 본문 일치 검증.
- 원래 작업 폴더 아카이브의 추적 파일 909개 SHA-256 일치. 아카이브·fixtures·docs·이전 apps가 Next.js runtime trace에 없음을 확인.
- 실제 콘텐츠 0개 상태에서 홈·canonical·robots·sitemap·OG 1200x630·favicon 정상. Preview/noindex와 Production/indexable 환경을 실제 로컬 HTTP 응답으로 확인. 최종 Production은 noindex를 유지한다.
- localhost 전용 임시 release-smoke 글로 상세 canonical, 목차 앵커, 코드 복사 성공 표시, 15px/700 본문, 14px 코드, 390x844 모바일 전체 화면 검색과 한글 검색·Esc 복원을 확인한 뒤 글을 제거했다. 해당 경로는 배포 경계 테스트에서 금지한다.
- 실제 단말 키보드·IME와 OS 다크 모드 전환은 직접 검증하지 않았다. 해당 코드는 승인 기준과 동일하며 추후 실제 기기 확인 항목이다.
- 독립 코드 리뷰: P0/P1/P2 없음. Node 24 테스트 19개 재실행 통과. 라이선스 사용 허락은 코드 리뷰의 판단 범위가 아니며 NOTICE에 확인 상태를 기록했다.
- GitHub Actions는 계정 결제 잠금으로 runner가 시작되지 못했다. Vercel release gate로 동일 검사 완료. 결제 설정을 수정하거나 CI를 우회해 성공 처리하지 않았다.

## 미리보기

https://blog-a1s6ksl51-hochois-projects.vercel.app — Ready, b25ce2c. 보호 설정 유지. 인증된 Vercel curl로 홈 200·빈 콘텐츠·noindex·canonical·robots와 비교 페이지 404 확인.

## 운영

운영 URL https://hozorica.com. Production 배포 후 검증 결과를 추가한다.
