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

운영 URL https://hozorica.com. Production c61bb16 / dpl_2z4v1w93Tc4zb6X2mgu9fEWmRs1C Ready. 실제 HTTPS 응답에서 홈·canonical·noindex·robots·sitemap·OG·favicon과 비공개 경로 15개 404 확인. HTTP 및 www 호스트는 308로 https://hozorica.com/ 에 연결됨. 운영 화면에서도 본문 15px/700·폭 672px·모바일 검색 전체 화면을 확인했다.

후속 사용자 요청으로 제목의 주황 강조를 제거하고 메일 hochoi8621@gmail.com 및 LinkedIn https://www.linkedin.com/in/howuchoi/ 를 푸터에 추가했다. 이 명시적 변경에 한해 승인 렌더링 해시를 갱신하며, 나머지 스타일은 그대로 유지한다. 공유 이미지의 이름도 기본색으로 맞췄다. 연락 링크는 제공된 주소로 연결하고, 후속 요청에 따라 lucide-react의 Github·Mail·Linkedin을 사용해 16px / strokeWidth 1.5로 통일했다. 나머지 CSS는 바꾸지 않았다.
