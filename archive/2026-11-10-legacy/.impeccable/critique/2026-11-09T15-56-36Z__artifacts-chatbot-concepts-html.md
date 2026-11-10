---
target: 챗봇 A/B/C HTML 시안
total_score: 28
max_score: 36
na_heuristics: 9
p0_count: 0
p1_count: 1
target_identity: "file:/Users/choiho/coding/blog/artifacts/chatbot-concepts.html"
target_fingerprint: "sha256:7a8d452bf40a4c2c8374f0f48d78795c75aca4445e93edc2bfdff059595440f2"
target_path: /Users/choiho/coding/blog/artifacts/chatbot-concepts.html
timestamp: 2026-11-09T15-56-36Z
slug: artifacts-chatbot-concepts-html
closed: true
---
Method: dual-agent (A: /root/design_review · B: /root/evidence_review)
# 챗봇 A/B/C 수정 전 평가
Target: artifacts/chatbot-concepts.html
Mode: Operate
## 디자인 고유성
B는 크림색, 캐릭터, 문장형 질문으로 사이트에 가장 잘 맞는다. A는 간결하지만 범용적이다. C는 근거 탐색에 유리하지만 헤더가 강하다. 세 방향은 유지하고 공통 결함을 다듬는다.
## 휴리스틱 평가 (각 4점)
| 기준 | A | B | C |
|---|---:|---:|---:|
| 상태 전달 |3|3|3|
| 현실과 일치 |4|4|4|
| 사용자 제어 |3|3|3|
| 일관성 |3|3|3|
| 실수 예방 |3|3|3|
| 인지 용이성 |3|4|3|
| 효율 |2|2|2|
| 미학·간결함 |3|3|3|
| 오류 복구 |n/a|n/a|n/a|
| 도움말 |3|3|3|
| 합계 |27/36|28/36|27/36|
오류 복구: 로컬 예시로 네트워크 실패 경로 없음. 총점 메타데이터는 추천안 B의 28/36이다.
## 장점
B 브랜드 연결, C 답변/출처 위계, 공통 추천 질문/Enter/Escape.
## 우선 문제
1. [P1] C만 답변 시작. 같은 첫 화면/답변/접힌 상태를 공통 선택해 비교. command: clarify.
2. [P2] 예시 답변이 시안 설명에 머물고 출처도 안내만 표시. 실제 저장소 프로젝트 기반의 명시된 예시 답변과 원문 링크 제공. command: polish.
3. [P2] 좁은 화면 전환이 명확한 휴대폰 폭을 보여주지 않음. 폭을 제한한 미리보기로 개선. command: adapt.
4. [P2] 34–36px 제어와 작은 안내문, outline:none 입력. 44px 대상, 12px 이상 안내문과 선명한 포커스. command: harden.
5. [P2] 반복 안내/빈 공간. 인사와 질문 간격 정리, 기존 SUIT 글꼴과 동일 높이 사용. command: polish.
## 페르소나
Jordan: A 아이콘 버튼 의미 불명확, C의 미리 채운 대화가 이전 대화처럼 보임.
Sam: 입력 포커스 약함, 초기화가 초안까지 제거.
Casey: 작은 전송/닫기 버튼, 비교용 페이지의 긴 스크롤.
## 인지 부담·감정
각 질문 3개로 선택량은 낮지만 서로 다른 상태 때문에 비교 부담 발생. B는 환영, C는 신뢰감을 주지만 형식적인 예시 답변과 동작하지 않는 출처가 마무리 경험 저하.
## 자동·브라우저 근거
CLI warnings 3: overused-font, cream-palette, dark-glow. All line 0. Cream is pinned brand; dark page/glow is a false positive on light surfaces. Use existing SUIT instead of Arial.
390px no horizontal overflow. Enter/Escape/reopen work, chat retained on collapse. Close 36px, send34px. Input outline none, wrapper 1px border only.
## 작은 관찰
닫힌 버튼 이름/아이콘을 실제 동작에 맞게 바꾸고 초기화 때 초안 보존. 전 페이지 고정·페이지 이동 대화 유지는 적용 목표이며 이 HTML에서는 미검증.
## 검토 질문
브랜드의 친근함과 근거 읽기를 어떻게 결합할까? 동일 답변에서 어떤 외형이 읽기 좋은가?
Questions skipped: user already requested critique followed by polish, existing brand and all three concepts preserved.
