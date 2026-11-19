# 가계부 체험 데모

개인 가계부 프로젝트(`/Users/choiho/coding/personal-ledger`)의 2026-11-17 UI·도메인 코드 스냅샷을 사용합니다. 원본 프로젝트는 수정하지 않습니다.

- `src/components`, `src/features`, `src/domain`: 실제 화면·계산·입력 검증. import 경로만 이 폴더 기준으로 바꿉니다.
- `src/demo-model.ts`, `src/features/ledger/use-ledger.ts`: 현재 달·지난달의 가상 거래, 메모리 전용 저장. 새로고침 시 복원합니다.
- 시세 조회·종목 검색은 고정된 목 데이터만 반환합니다. 운영 API, IndexedDB, 서비스 워커, 로그인, 금융 계좌는 연결하지 않습니다.
- 화면 전환·다이얼로그의 브라우저 히스토리는 iframe이 블로그 뒤로가기에 영향을 주지 않도록 메모리와 Escape 처리로 대체합니다.
- `scripts/build-ledger-demo.mjs`가 독립 HTML·JS·CSS를 `public/demos/personal-ledger/`에 생성합니다. 블로그 dev/build 전에 자동 실행합니다. 생성 파일은 Git에서 제외합니다.
- iframe에서는 앱의 원래 색상·배치와 SUIT 700을 사용합니다. CSP로 외부 연결을 차단합니다. 예시 시세는 실시간이 아닙니다.
