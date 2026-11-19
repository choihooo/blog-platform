# PWA

HTTPS로 배포한 블로그를 Android/데스크톱 Chrome의 설치 메뉴 또는 iOS Safari의 공유 → 홈 화면에 추가로 설치할 수 있습니다. 별도 설치 배너는 표시하지 않습니다.

- 매니페스트: `app/manifest.ts`, 기존 ‘호’ 로고의 192/512px 아이콘과 maskable 아이콘. iOS는 `app/apple-icon.png`를 사용합니다.
- 서비스 워커: `public/sw.js`. 프로덕션에서만 등록합니다. 로컬 검증은 `pnpm build` 후 `pnpm start`로 진행합니다(localhost 지원).
- 오프라인: 문서 이동 중 네트워크 연결이 실패하면 자체 폰트를 포함한 `public/offline.html`을 표시합니다. 다시 시도는 원래 요청한 주소를 새로고침합니다. 글 저장·오프라인 열람 기능은 포함하지 않습니다.
- HTML·RSC·API·댓글·좋아요·외부 요청은 캐시하지 않습니다. 캐시에는 오프라인 안내 화면만 저장합니다. 온라인 HTTP 오류 응답은 원래 응답을 그대로 표시합니다.
- 안내 화면을 바꾸면 `public/sw.js`의 `CACHE` 버전을 올립니다. 활성화 시 이 앱의 이전 캐시만 삭제합니다. 앱 번들은 저장하지 않으므로 새 워커를 즉시 활성화합니다.

아이콘/안내 화면 재생성: Pillow와 fontTools가 있는 Python에서 `python3 scripts/generate-pwa-assets.py`. 생성물을 저장하므로 빌드에 Python은 필요하지 않습니다. 원본 SUIT 폰트 라이선스는 `app/fonts/suit/LICENSE`에 있습니다.

검증: `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`. 프로덕션 서버에서 매니페스트·아이콘·서비스 워커 활성화와 브라우저 오프라인 상태의 안내 화면을 확인합니다. 개발 서버에서는 서비스 워커를 새로 등록하지 않습니다. 같은 origin에서 프로덕션을 먼저 검증했다면 개발 전 DevTools에서 해당 워커를 해제합니다.
