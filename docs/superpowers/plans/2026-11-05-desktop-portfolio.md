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
- [ ] 5. 실제 브라우저에서 가로·세로·드래그·창 제어·접근성·영상/네트워크·테스트/타입/빌드 확인, 독립 코드 리뷰.
- [ ] 6. 사용자에게 레퍼런스 영상과 검토 가능한 실험 화면 전달. 운영 교체는 시안 검토 후 별도 진행.
