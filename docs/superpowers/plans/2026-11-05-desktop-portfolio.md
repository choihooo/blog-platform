# Hozorica Desktop Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사용자가 리본 대신 선택한 Interactive Portfolio를 호조리카의 작업 바탕화면으로 구현한다.
**Architecture:** React 상태로 프로젝트 아이콘과 modeless 창을 관리한다. 실제 상세 페이지는 보존하며 전체 11개 프로젝트 링크를 SSR로 제공한다. 실험 경로는 `/experiments/interactive-portfolio`.
**Tech Stack:** 기존 Next.js/React/TypeScript/CSS/Lucide/Vitest. Three.js 없음.
**Spec:** 사용자 선택(2026-11-05)과 `https://motionsites.ai/?prompt=interactive-portfolio`, 로컬 `outputs/motionsites-interactive-portfolio/reference-frames.jpg`.

## Global Constraints

- 기존 리본 계획을 대체한다. 리본 WIP는 별도 로컬 압축/patch로 보관하고 의존성을 제거한다.
- 아이보리 #f5f3ed, 블루 #3d6ed5, 남색 #172c52, 보조 #53647b. SUIT와 승인된 흰 옷 캐릭터를 유지한다.
- 사용자에게 없는 SNS/상업 성과를 만들지 않는다. 기존 프로젝트 콘텐츠와 링크를 사용한다.
- 실험에서만 창 UI를 사용한다. 기존 상세 페이지/블로그/홈의 라우팅·본문은 바꾸지 않는다.
- 모델 다운로드/유료 생성/DB 변경/운영 배포는 하지 않는다. 브라우저에서 검토 가능한 로컬 시안을 완성한다.

## Review Focus

1. JS가 없어도 전체 11개 상세 링크가 있어야 한다 → SSR 테스트.
2. 창 재열기·최소화·복원·닫기·중복 열기에서 정체성과 순서를 유지한다 → reducer 테스트.
3. 작은 화면에서 창/아이콘이 사라지지 않아야 한다 → clamp 테스트와 모바일 브라우저.
4. 키보드 탐색·Escape·포커스 복귀와 reduced-motion을 지원한다 → 브라우저 검증.
5. 드래그가 클릭을 잘못 발생시키거나 비활성 영상이 계속 재생되면 안 된다 → 브라우저 검증.

## Tasks

- [x] 1. 참조 원본 WebP 640×476/75프레임/약 5초를 MP4로 저장하고 6개 프레임으로 동작 분석.
- [x] 2. `features/projects/desktop/desktop-state.ts` 및 테스트: 중복 열기/포커스/닫기/최소화/최대화/좌표 제한 RED→GREEN.
- [x] 3. `desktop-data.ts`, `desktop-portfolio.tsx`, `desktop-portfolio.css`: 6개 대표 아이콘, 승인된 캐릭터 배경, 창과 Dock, 11개 SSR 링크. 자산 맵은 `project-card-assets.ts`로 공유.
- [x] 4. 실험 route와 정확한 경로에만 공통 헤더 숨김. SSR 및 shell 테스트 RED→GREEN.
- [x] 5. 실제 브라우저에서 가로·세로·드래그·창 제어·접근성·영상·테스트/타입/빌드 확인, 독립 코드 리뷰. 400 tests, lint/typecheck 통과. JS 미실행 링크는 SSR 테스트로 검증했고 별도 브라우저 JS-off 실험은 하지 않았다.
- [x] 6. 원본 미리보기를 MP4로 저장하고 독립 실험 화면을 Codex 브라우저에 열었다. 사용자 추가 요청에 따라 기존 메인과 `/projects`는 교체하지 않는다.

## 검증 기록

### 2026-11-05 추가 수정: 전체 프로젝트와 창 크기 조절

- 사용자 요청으로 큰 제목·소개 문구를 제거했다. 접근성용 h1만 시각적으로 숨겼다.
- 바탕화면에 전체 11개 프로젝트를 등록하고, 기존 개별 프로젝트 데이터 순서를 따른다.
- 창별 width/height와 위치를 상태에 저장한다. 네 변·모서리 resize와 제목줄 이동을 지원하고,
  최소 크기(320×220, 더 작은 화면에서는 화면 크기) 및 Dock 위 작업 영역을 벗어나지 않게 한다.
- browser: Kusting 720×560 → SE 드래그 830×620 → 제목줄 이동 (360,94)→(250,164),
  방향키로 폭 846px, 최소화/복원 후 유지 확인. 모바일 390×844에서 아이콘 11개/가로 overflow 없음.
- resize 방향/앵커/최소·최대 경계 및 크기 보존 단위 테스트 추가 RED→GREEN. 전체 403 tests,
  lint/typecheck 통과. production build 149페이지 통과. 기존 메인/프로젝트 route는 변경하지 않았다.

- 페이지: `/experiments/interactive-portfolio` (noindex), 기존 `/`, `/projects`, `/projects/[slug]`는 유지.
- 1440×900, 390×844 브라우저 화면에서 가로 넘침 없음; 844×390은 아이콘 겹침 RED→한 줄 배치로 GREEN.
- 아이콘 drag 후 창이 잘못 열리지 않음, 최소화→Dock 포커스/Enter 복원, 최대화, Escape 닫기/launcher 포커스 검증.
- 새 창을 열면 기존 비활성 영상 pause, reduced-motion에서 모든 영상 pause 검증.
- 독립 리뷰 Important 1건: 뒤쪽 창의 키보드 포커스가 활성 창을 바꾸지 않아 Escape가 다른 창을 닫음. 브라우저 재현 RED→onFocusCapture + 포커스 보존으로 GREEN, suite 400/400.
- 원본 Vante 리본 참고문서/계획은 이력으로 보관한다. 사용자 최신 선택과 이 계획이 우선한다.
