# R2 썸네일·DB 표지 교체 Implementation Plan

> **For agentic workers:** Execute inline in this session using the existing approved deployment
> workflow.

**Goal:** 승인된 35개 썸네일을 R2에 저장하고 D1의 표지 참조를 변경해 CMS와 공개 Blog가 같은 이미지를
사용한다.

**Architecture:** 기존 `hero_image_key`와 `media_refs` 계약을 유지한다. 로컬 slug별 이미지
override를 제거하며 OG·Twitter는 DB에서 읽은 coverImage를 사용한다.

**Tech Stack:** Cloudflare R2/D1, Wrangler CLI, Next.js, Vitest, Vercel.

**Spec:** 사용자 요청 및 `docs/deployment-2026-11-03-thumbnails.md`.

## Global Constraints

- 사용자 기존 홈·스크롤 변경과 비밀값은 배포에 포함하지 않는다.
- 원격 변경 전 백업·dry-run, 업로드 검증 후 DB 적용. 원본 이미지는 삭제하지 않는다.
- Runbook ID `blog-thumbnails-r2-20261103`; 재실행과 rollback SQL 기록.

## Review Focus

- CMS에서 나중에 표지를 변경하면 기존 slug에도 그대로 반영되어야 한다.
- 기존 hero/og media_refs가 새 표지를 가리지 않아야 한다.
- 업로드 실패·누락 시 DB 변경을 중단한다.
- 비공개 글·본문·게시 날짜·조회수는 변경하지 않는다.
- 이미지 없는 글의 OG fallback과 미존재 글 404를 유지한다.

## Tasks

- [x] 기존 CMS 표지 선택을 검증하는 테스트를 먼저 변경하고 실패 확인.
- [x] slug override 제거 후 Blog·SEO 검증.
- [x] D1 기존 표지/미디어 스냅샷 및 대상 35개 매칭·PNG 크기 검증; SQL과 rollback 생성.
- [x] 버전된 R2 경로에 35개 업로드; 공개 GET 해시·크기 확인 후 D1 변경 적용.
- [x] D1 재조회로 35개 표지·미디어 일치 확인. 새 DB 기반 격리 배포 및 OG·Twitter·본문 검증.
- [x] Runbook에 배포·검증·rollback 결과 기록.
