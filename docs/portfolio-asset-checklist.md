# 포트폴리오 에셋 체크리스트

프로젝트 페이지에 사용할 영상, 도식, 스크린샷, 코드와 지표 자료를 정리한 문서입니다. 현재 만들거나
확보할 수 있는 항목에 체크합니다.

## 체크 결과 요약

체크된 항목은 이미 완성된 파일이 아니라 현재 제작하거나 확보할 수 있는 자료를 의미합니다.

- 확보·제작 가능: **16개**
- 에셋 구성이 충분한 프로젝트: **Kusting, Comma, 거부기린**
- 도식 중심으로 구성 가능한 프로젝트: **AI 수정 workflow, AI 포렌식 Evidence UI, API 기반 운영
  데이터 전환, 다국어 리소스 검증**
- 현재 텍스트와 수치 중심으로 구성해야 하는 프로젝트: **Nexacro–React, TypeScript 5 마이그레이션**

### 프로젝트별 확보 가능 자료

| 프로젝트                  | 확보·제작 가능한 자료                                       | 현재 판단                           |
| ------------------------- | ----------------------------------------------------------- | ----------------------------------- |
| AI 수정 workflow          | workflow 전체 구조 도식                                     | 도식 1개로 핵심 구조 설명 가능      |
| Nexacro–React             | 없음                                                        | 텍스트 중심, 추가 자료 필요         |
| AI 포렌식 Evidence UI     | 검증 정보 계층 도식, 공통 Evidence 모델 도식                | 도식 2개로 구조 설명 가능           |
| API 기반 운영 데이터 전환 | 데이터 원천 Before/After 도식                               | Before/After 중심 구성 가능         |
| 다국어 리소스 검증        | 다국어 검증·CI 차단 도식                                    | CI 흐름 중심 구성 가능              |
| TypeScript 5 마이그레이션 | 없음                                                        | 코드·차트 없이 텍스트와 숫자만 사용 |
| Kusting                   | 추천 파이프라인 도식, 추천 UI, 캘린더 투표 화면             | 화면과 구조를 함께 제시 가능        |
| Comma                     | 로딩 비교 영상, Web–Native Bridge 도식, Native 업로드 영상  | 영상 중심의 강한 사례 구성 가능     |
| 거부기린                  | 자세 측정 영상, 백그라운드 영상, 추론·릴리스 도식, 6단계 UI | 대표 프로젝트용 에셋 충분           |

### 현재 제작 방향

1. **거부기린**은 대표 프로젝트로 사용합니다. 첫 화면에 자세 측정 영상을 배치하고, 세 사례에
   백그라운드 영상과 추론·릴리스 도식을 나눠 배치합니다.
2. **Comma**는 성능과 Web–Native 연동을 각각 영상으로 증명합니다. 두 사례 모두 실제 동작 자료가
   있으므로 텍스트보다 영상이 먼저 보이게 구성합니다.
3. **Kusting**은 추천 파이프라인 도식과 실제 추천 UI를 연결하고, 일정 사례에는 캘린더 화면을
   사용합니다.
4. **AI 포렌식 Evidence UI**는 실제 화면 없이 두 개의 도식으로 정보 계층과 공통 모델을 설명합니다.
5. **AI 수정 workflow, API 데이터 전환, 다국어 검증**은 각각 하나의 대표 도식을 사용하고 본문과
   수치를 보조 자료로 둡니다.
6. **Nexacro–React, TypeScript 마이그레이션**은 현재 확보 가능한 시각 자료가 없어 우선 텍스트형
   사례로 유지합니다.

## 공통 기준

- [ ] 모든 화면에서 사용자 이름, 이메일, 토큰, 서버 주소와 고객사 데이터를 제거한다.
- [ ] 실제 데이터를 사용할 수 없으면 같은 구조의 테스트 데이터로 교체한다.
- [ ] 영상은 8~15초, 음소거, 반복 재생을 기준으로 만든다.
- [ ] 영상 첫 프레임만 봐도 내용을 이해할 수 있는 poster 이미지를 준비한다.
- [ ] 영상은 데스크톱 기준 MP4와 WebM을 준비한다.
- [ ] 스크린샷은 가능하면 2배 해상도 PNG 또는 WebP로 준비한다.
- [ ] Before/After 자료는 동일한 viewport와 데이터 조건을 사용한다.
- [ ] 성과 수치에는 측정 기간, 횟수, 환경과 비교 기준을 함께 기록한다.
- [ ] 도식은 한 화면에 하나의 메시지만 담고 프로젝트당 최대 2개로 제한한다.
- [ ] 에셋마다 한 줄 캡션과 대체 텍스트를 작성한다.

## 01. AI 수정 workflow 자동화

### 필수

- [x] **workflow 전체 구조 도식** `[diagram]`
  - 흐름: 수정 요청 → DOM Tree 추출 → 작업 카드 → 의존성 판단 → Claude/Codex 실행 → AC 검증 → 결과
    병합
  - 권장 파일명: `ai-workflow-architecture.webp`
- [ ] **화면 이미지와 DOM Tree 비교 이미지** `[screenshot/diagram]`
  - 같은 UI 요소를 스크린샷 위치와 selector/DOM 계층으로 비교
  - 권장 파일명: `ai-workflow-image-vs-dom.webp`
- [ ] **실행 비용·토큰·처리 시간 비교표** `[metric]`
  - 입력 토큰 10.3%, 실행 비용 35.4%, 전체 처리 시간 31.6% 개선
  - dry-run 10회 중앙값 조건 포함

### 선택

- [ ] **Claude/Codex 선택 및 병렬 실행 영상** `[video]`
  - 여러 수정 카드 입력 → agent 선택 → 병렬 실행 → 검증 → 실제 화면 변경
  - 권장 파일명: `ai-workflow-parallel-run.mp4`
- [ ] **공통 agent adapter 코드** `[code]`
  - 공통 interface와 Claude/Codex adapter 차이를 짧게 비교
- [ ] **작업 카드 예시** `[screenshot/code]`
  - selector, sourceFile, DOM context, Acceptance Criteria 포함

## 02. Nexacro–React 전환 자동화

### 필수

- [ ] **Nexacro→React 변환 파이프라인 도식** `[diagram]`
  - Nexacro 화면 → Playwright 추출 → Markdown 명세 → AI 구현 → Playwright 검증
  - 권장 파일명: `nexacro-react-pipeline.webp`
- [ ] **구조화 전후 명세 비교** `[screenshot]`
  - 전체 정보가 섞인 입력과 화면 구조·기능·제약·AC로 분리된 명세 비교
  - 권장 파일명: `nexacro-spec-before-after.webp`
- [ ] **화면 유형 5종 검증 결과표** `[metric]`
  - 화면 유형, 핵심 기능, AC 통과 여부 표시

### 선택

- [ ] **원본 Nexacro와 React 동작 비교 영상** `[video]`
  - 동일 viewport에서 같은 입력, 버튼 클릭과 화면 이동을 나란히 실행
  - 권장 파일명: `nexacro-react-comparison.mp4`
- [ ] **Playwright AC 실행 결과** `[screenshot]`
  - 테스트 데이터로 통과 항목과 실패 시 메시지 표시
- [ ] **생성된 Markdown 명세 일부** `[code/document]`

## 03. AI 포렌식 Evidence UI

### 필수

- [x] **검증 정보 계층 도식** `[diagram]`
  - AI 검색 결과 → 핵심 Evidence → 원본 파일
  - 권장 파일명: `forensic-evidence-hierarchy.webp`
- [x] **공통 Evidence 모델 도식** `[diagram]`
  - 문서 문장, 이미지 OCR, 음성 STT, 영상 STT → 공통 Evidence
  - 권장 파일명: `forensic-evidence-model.webp`
- [ ] **검색 결과와 Evidence UI 스크린샷** `[screenshot]`
  - 관련도, 근거 텍스트, 출처와 원본 이동 UI 포함

### 선택

- [ ] **Evidence에서 원본 타임스탬프로 이동하는 영상** `[video]`
  - 검색 결과 선택 → Evidence 확인 → 음성/영상 원본의 해당 구간 재생
  - 권장 파일명: `forensic-timestamp-navigation.mp4`
- [ ] **미디어 유형 4종 비교 이미지** `[screenshot]`
  - 문서·이미지·음성·영상 Evidence 표현 비교
- [ ] **Evidence 데이터 구조 코드** `[code]`

## 04. API 기반 운영 데이터 전환

### 필수

- [x] **데이터 원천 Before/After 도식** `[diagram]`
  - Before: Backend DB + Frontend enum
  - After: Backend API → LocalStorage → Recoil selector → UI
  - 권장 파일명: `api-data-source-before-after.webp`
- [ ] **신규 센터 추가 절차 비교표** `[metric]`
  - 4단계 → 2단계, 프론트엔드 재배포 1회 → 0회
- [ ] **기존 enum과 API 응답 예시** `[code]`
  - 회사 및 운영 데이터를 제거한 축약 예시

### 선택

- [ ] **센터 추가 후 운영 화면 반영 스크린샷** `[screenshot]`
- [ ] **Recoil selector 데이터 흐름 코드** `[code]`

## 05. 다국어 리소스 검증 자동화

### 필수

- [x] **다국어 검증 및 CI 차단 도식** `[diagram]`
  - 기준 JSON → 키 평탄화 → 언어별 비교 → 누락 발견 → CI 실패 → 배포 차단
  - 권장 파일명: `i18n-ci-validation.webp`
- [ ] **누락 키 오류 출력 화면** `[screenshot]`
  - 언어와 전체 키 경로가 함께 표시된 테스트 로그
- [ ] **중첩 JSON과 평탄화 결과 예시** `[code]`
- [ ] **성과 비교표** `[metric]`
  - 노출 키 63건 → 0건, 키별 확인 20~30초 → 1초 이내

### 선택

- [ ] **AWS CodePipeline pre_build 실패 화면** `[screenshot]`
- [ ] **검증 스크립트 핵심 로직** `[code]`

## 06. TypeScript 5 마이그레이션

### 필수

- [ ] **타입 정의 Before/After 코드** `[code]`
  - any API 응답과 GraphResponse/number 타입 적용 비교
- [ ] **타입 오류 분류표** `[table]`
  - 공통 타입, API 응답, 입력값, 화면 사용 코드 등 실제 분류 기준
- [ ] **컴파일 시간 비교 차트** `[chart]`
  - 246.22초 → 199.51초, 19% 단축
  - 동일 조건과 측정 방식 표시
- [ ] **런타임 오류 비교 차트** `[chart]`
  - 27건 → 10건, 마이그레이션 이후 7일 기준

### 선택

- [ ] **500건 이상 오류 정리 과정 이미지** `[screenshot]`
- [ ] **단계별 마이그레이션 순서 도식** `[diagram]`

## 07. Kusting

### 필수

- [x] **임베딩 추천 파이프라인 도식** `[diagram]`
  - 가입 관심사 + 클릭 기록 → 사용자 임베딩
  - 게시글 제목 + 설명 → 게시글 임베딩
  - pgvector HNSW → 추천 결과 + 키워드 기반 이유
  - 권장 파일명: `kusting-recommendation-pipeline.webp`
- [x] **추천 결과와 추천 이유 UI** `[screenshot]`
- [ ] **CTR 측정 조건 및 결과표** `[metric]`
  - 적용 전후 각 1주, 사용자 33명, 동일 노출 위치, 상대 15% 증가
- [x] **캘린더 일정 투표 화면** `[screenshot]`

### 선택

- [ ] **관심사·클릭에 따른 추천 흐름 영상** `[video]`
  - 관심사 확인 → 콘텐츠 클릭 → 추천 목록 및 추천 이유 확인
  - 권장 파일명: `kusting-recommendation.mp4`
- [ ] **일정 투표와 PWA Push 영상** `[video]`
  - 투표 생성 → 시작 Push → 날짜 선택 → 마감일 이후 자동 종료
- [ ] **OpenAI/Ollama provider interface 코드** `[code]`

## 08. Comma

### 필수

- [x] **체크리스트 로딩 Before/After 영상** `[video]`
  - Before: 빈 질문 영역 → 2,333.2ms 후 표시
  - After: Skeleton/Feed prefetch → 1,045.3ms 후 표시
  - 동일 viewport에서 좌우 또는 상하 동시 재생
  - 권장 파일명: `comma-checklist-performance.mp4`
  - [x] Before 원본 확보: `리스트 늦게 뜸.mov`
  - [x] After 원본 녹화: `apps/blog/public/projects/comma/checklist-loading-after.mp4`
  - [x] WebM 변환: `apps/blog/public/projects/comma/checklist-loading-after.webm`
  - [x] Poster 생성: `apps/blog/public/projects/comma/checklist-loading-after-poster.jpg`
- [ ] **질문 표시 시간 비교 차트** `[chart]`
  - 직접 진입 41.1%, Feed prefetch 경로 55.2% 개선
  - 430×932 viewport, 1초 mock API, 각 5회 평균 조건 포함
- [x] **Web–Native Bridge 도식** `[diagram]`
  - React Web ↔ typed AppBridge ↔ React Native/Expo
  - Gallery, Camera, SecureStore, Native Login, Multipart Upload, Back 포함
  - 권장 파일명: `comma-native-bridge.webp`
- [x] **Native 사진 업로드 영상** `[video]`
  - 활동 완료 → 갤러리/카메라 → 사진 선택 → 리뷰 작성 → 피드 게시
  - 권장 파일명: `comma-native-upload.mp4`
  - [ ] 원본 파일 확보 필요

### 확보한 추가 원본

- [x] `배경 사진 늦게 로드.mp4`
  - 로그인 화면의 배경 이미지가 늦게 표시되는 개선 전 영상
  - 현재 사례 본문에는 직접 대응하는 내용이 없어 보조 자료로 보관
- [x] `내 쉼표 늦게 로딩 됨.mov`
  - 내 쉼표 화면의 피드 콘텐츠가 늦게 표시되는 개선 전 영상
  - 현재 사례 본문에는 직접 대응하는 내용이 없어 보조 자료로 보관

### 선택

- [ ] **실제 질문 구조와 Skeleton 비교 이미지** `[screenshot]`
- [ ] **AppBridge 공통 타입 코드** `[code]`
- [ ] **React Query prefetch 코드** `[code]`

## 09. 거부기린

### 필수

- [x] **자세 측정 대표 영상** `[video]`
  - Normal → 나쁜 자세 → Warning → 자세 회복 → Normal
  - 웹캠 preview와 자세 점수/단계를 함께 표시
  - 권장 파일명: `geobugirin-posture-feedback.mp4`
- [x] **백그라운드 추론 영상** `[video]`
  - 측정 시작 → 다른 앱 활성화 → 최소화 → 측정 유지 → 복귀
  - 권장 파일명: `geobugirin-background-inference.mp4`
- [x] **자세 추론 파이프라인 도식** `[diagram]`
  - Webcam → Python sidecar → MediaPipe → PI → calibration/z-score → smoothing → 6단계 → Tauri event
    → React UI
  - 권장 파일명: `geobugirin-posture-pipeline.webp`
- [x] **데스크톱 릴리스 파이프라인 도식** `[diagram]`
  - React + Rust + Python sidecar → macOS/Windows → signing/notarization → updater artifact →
    Releases/R2
  - 권장 파일명: `geobugirin-release-pipeline.webp`
- [ ] **운영 지표 카드 또는 차트** `[metric]`
  - 최근 한 달 베타 사용자 43명
  - 최근 한 달 합산 사용 시간 약 1,300시간
  - AI Persona 시나리오 검증 10,000건은 실제 사용자와 분리

### 선택

- [x] **6단계 자세 분류 UI 이미지** `[screenshot]`
- [ ] **PI 계산과 개인 calibration 도식** `[diagram]`
- [ ] **macOS·Windows 설치 화면** `[screenshot]`
- [ ] **GitHub Actions 릴리스 결과** `[screenshot]`
- [ ] **Updater 동작 영상** `[video]`
  - 현재 운영 중이 아니므로 과거 검증 환경을 재현할 수 있을 때만 제작

## 우선 제작 순서

- [x] P0. 거부기린 자세 측정 영상 확보 가능
- [x] P0. 거부기린 백그라운드 추론 영상 확보 가능
- [x] P0. 거부기린 자세 추론 파이프라인 도식 제작 가능
- [x] P0. Comma 로딩 Before/After 영상 확보 가능
- [x] P0. Comma Web–Native Bridge 도식 제작 가능
- [x] P0. Comma Native 사진 업로드 영상 확보 가능
- [x] P1. AI 수정 workflow 구조 도식 제작 가능
- [x] P1. AI 포렌식 정보 계층·Evidence 모델 도식 제작 가능
- [x] P1. Kusting 추천 파이프라인 도식과 UI 확보 가능
- [x] P1. Kusting 캘린더 투표 화면 확보 가능
- [x] P1. 다국어 검증 CI 도식 제작 가능
- [x] P2. API 데이터 원천 Before/After 도식 제작 가능
- [ ] 보류. AI 포렌식 타임스탬프 이동 영상
- [ ] 보류. Nexacro–React 변환 파이프라인 및 실제 화면
- [ ] 보류. TypeScript 컴파일·런타임 오류 차트

## 실제 제작 묶음

### 1차: 대표 프로젝트

- [x] 거부기린 자세 측정 영상 파일 제작
- [x] 거부기린 백그라운드 추론 영상 파일 제작
- [x] 거부기린 자세 추론 파이프라인 도식 제작
- [x] 거부기린 릴리스 파이프라인 도식 제작
- [ ] 거부기린 6단계 자세 분류 이미지 정리
- [x] Comma 로딩 Before/After 영상 파일 제작 및 삽입
  - [x] Before 원본: `리스트 늦게 뜸.mov`
  - [x] After 원본: `checklist-loading-after.mp4`
  - [x] 동일 크기·길이로 정규화해 포트폴리오 비교 블록에 삽입
- [x] Comma Web–Native Bridge 도식 제작
- [ ] Comma Native 사진 업로드 영상 파일 제작
  - [ ] 업로드 과정을 담은 원본 필요

### 2차: 구조와 실제 화면

- [x] Kusting 추천 파이프라인 도식 제작
- [x] Kusting 추천 결과·추천 이유 UI 정리
  - 최신성 값과 게시 시점은 최근 콘텐츠 분포를 재현한 테스트 데이터로 합성
- [x] Kusting 캘린더 투표 화면 정리
- [x] AI 수정 workflow 전체 구조 도식 제작
- [x] AI 포렌식 검증 정보 계층 도식 제작
- [x] AI 포렌식 공통 Evidence 모델 도식 제작

### 3차: 보조 도식

- [x] API 데이터 원천 Before/After 도식 제작
- [x] 다국어 리소스 검증·CI 차단 도식 제작

완료된 도식의 Mermaid 원본은 `docs/diagrams`, SVG·PNG 결과물은
`apps/blog/public/projects/diagrams`에 있습니다.

### 보류

- [ ] Nexacro–React는 추가 자료 확보 전까지 텍스트형으로 유지
- [ ] TypeScript 마이그레이션은 추가 자료 확보 전까지 텍스트와 기존 수치만 사용
- [ ] AI 포렌식 타임스탬프 이동 영상은 실제 화면 확보 후 재검토

## 확보 여부 회신용 요약

아래 항목에 `가능`, `일부 가능`, `불가능` 중 하나를 적습니다.

| 프로젝트                  | 영상   | 실제 화면 스크린샷 | 코드 공개 | 측정 원본                    | 비고                             |
| ------------------------- | ------ | ------------------ | --------- | ---------------------------- | -------------------------------- |
| AI 수정 workflow          | 불가능 | 불가능             | 미확인    | 미확인                       | 구조 도식 가능                   |
| Nexacro–React             | 불가능 | 불가능             | 미확인    | 미확인                       | 현재 시각 자료 없음              |
| AI 포렌식 Evidence UI     | 불가능 | 불가능             | 미확인    | 미확인                       | 도식 2개 가능                    |
| API 기반 운영 데이터 전환 | 불가능 | 불가능             | 미확인    | 미확인                       | Before/After 도식 가능           |
| 다국어 리소스 검증        | 불가능 | 불가능             | 미확인    | 미확인                       | CI 도식 가능                     |
| TypeScript 5 마이그레이션 | 불가능 | 불가능             | 미확인    | 미확인                       | 현재 시각 자료 없음              |
| Kusting                   | 미확인 | 가능               | 미확인    | 미확인                       | 추천·캘린더 화면 가능            |
| Comma                     | 가능   | 영상에서 추출 가능 | 미확인    | 저장소에 성능 측정 기록 존재 | 영상 2개·도식 1개 가능           |
| 거부기린                  | 가능   | 가능               | 미확인    | DB·PostHog 및 벤치마크 일부  | 영상 2개·도식 2개·UI 이미지 가능 |
