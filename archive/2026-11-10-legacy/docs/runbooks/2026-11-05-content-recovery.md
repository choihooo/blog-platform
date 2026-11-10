# 콘텐츠 복구 — content-rendering-recovery-20261105

사용자가 2026-11-05 전수 조사 결과 전체 수정과 원문 코드·표 복구를 요청했다.

## 대상과 보존

- 공개 글 35개 중 티스토리 이전 글 32개의 본문만 복구한다. CMS 작성 3개는 본문을 유지하고 호환 목록
  렌더링을 적용한다. 비공개 4개는 변경하지 않는다.
- 원문 HTML은 `.tt_article_useless_p_margin` 안에서만 가져온다. 코드 내용을 태그 제거 정규식에 넣지
  않는다. signed Kakaocdn URL은 안정적인 asset 경로로 기존 R2 mapping에 연결한다.
- title/id/slug/summary/category/tags/hero/media_refs/게시일/수정일/공개 상태는 보존한다. 조회수는
  동시 방문으로 증가할 수 있으므로 검증에서 변경 금지 대상으로 취급하지 않는다.
- 백업과 manifest는 git-ignored `_workspace/content-rendering-recovery-20261105/`에 보관한다.
  `before.json`은 전체 posts와 media_refs, `original-*.html`은 원문, `manifest.json`은 before/after,
  `review.json`은 글별 해시와 개수다. 백업을 덮어쓰지 않는다.

## 실행 순서

1. 이전 변환기의 결과를 migration-baseline.json으로 동결한다. 32개 현재 본문이 이 결과와 일치하는지
   검사하되 이후 수행된 R2 PNG/JPEG → WebP URL 변경만 정규화한다. 차이가 더 있으면 중단한다.
2. `pnpm migrate:dry-run`을 실행한다. 이 명령은 기존 migration 시뮬레이션이므로 아래 검증도 필수다.
3. `tsx scripts/migration/recover-published-content.ts prepare`로 원격 snapshot과 원문·복구안을
   생성한다. 기존 snapshot이 있으면 `rebuild`로 그 snapshot/원문에서만 새 parser 결과를 재생성한다.
4. `CONTENT_RECOVERY_MANIFEST=<manifest 절대 경로> pnpm --filter @blog-platform/cms exec vitest run components/editor/content-round-trip.test.ts`로
   32개 모두 실제 Tiptap schema round-trip을 확인한다.
5. 공유 패키지·Blog·CMS의 테스트/lint/typecheck/build와 복구 전후 원문 개수·코드 diff를 확인한다.
6. 호환 Blog/CMS를 배포하고 공개 글에서 `data-content-schema="1-rich"`를 확인한다.
7. `tsx scripts/migration/recover-published-content.ts dry-run`을 실행한다. 결과는 manifest SHA에
   묶인다.
8. `tsx scripts/migration/recover-published-content.ts apply --runbook=content-rendering-recovery-20261105 --compatible-blog=https://hozorica.com/blog/regular-expression`을
   실행한다.
9. `tsx scripts/migration/recover-published-content.ts verify`로 본문·metadata·비공개
   글·media_refs를 대조한다. 공개 API 및 운영 HTML 35개를 다시 검사하고 필요한 콘텐츠 cache/RAG
   refresh를 수행한다.

공유 모델을 직접 import하는 RAG Worker도 호환 배포한다. Worker가 editor를 workspace dependency로
선언하여 이후 공유 모델 변경 때 Turbo의 build/test cache가 함께 갱신되도록 했다. 내용 변경 후에는
복구 대상 slug별 `/sync`의 모든 offset을 완료한다. 토큰은 기존 로컬 `.dev.vars`에서 읽고 출력하지
않는다.

사전 생성된 `/posts/[slug]` HTML은 데이터 복구 전에 생성된 본문을 포함할 수 있다. CMS CDN과 Blog
cache를 갱신하고 복구 후 Blog를 다시 build/deploy하여 초기 prerender 파일도 최신으로 만든다. rich-v1
매핑 결과는 `blog-content-rich-v1` cache key로 분리한다. 최종 확인 명령은 다음과 같다.

```sh
python3 scripts/migration/verify-published-rendering.py
```

## 재실행과 롤백

- apply는 이미 after와 동일한 본문을 건너뛴다. before와도 다르면 중단한다. SQL은 content와
  updated_at, id/slug/공개 상태를 함께 비교하므로 실행 중 편집도 덮어쓰지 않는다.
- 부분 실패 시 같은 manifest로 apply를 재실행한다. 다른 snapshot을 새로 만들지 않는다.
- 데이터 rollback:
  `tsx scripts/migration/recover-published-content.ts rollback --runbook=content-rendering-recovery-20261105`.
  after와 updated_at이 그대로인 글만 before로 복원한다. 이후 편집된 글은 덮어쓰지 않는다. R2 파일은
  변경·삭제하지 않는다.
- 코드 rollback은 data rollback 후 이전 Vercel deployment를 promote한다. 확장 데이터를 남긴 채 구형
  렌더러로 되돌리지 않는다.
- D1 API token이 없으면 기존 로그인된 Wrangler OAuth로 실행한다. 자격 증명을 파일·로그에 출력하지
  않는다.

## 검증·배포 결과

- 32개 글에 guarded content-only update 적용. 전체 39개 레코드 재조회: 공개 35개·비공개 4개, 모든
  metadata(동시 증가할 수 있는 조회수 제외)와 media_refs 보존 확인.
- 원문 HTML의 코드 블록 130개는 JSX·제네릭·빈 줄·들여쓰기·마지막 개행까지 일치한다. 표 15개의 283개
  셀은 공백 정규화 후 내용과 행/열 경계가 모두 일치한다. 추가 복원한 이미지 URL 3개도 curl GET HTTP
  200/image Content-Type 확인.
- 복구 32개 전체가 실제 Tiptap JSON 왕복을 통과했다. 이미지 링크·rich caption의 HTML 복사/붙여넣기,
  Markdown 표/JSX 붙여넣기, nested validation, 공개 안전 렌더링 회귀 테스트 통과.
- 운영 CMS API와 canonical HTML 35개 전수 대조 통과: 코드 블록 149개, 표 15개, 본문 이미지 106개.
  복구 대상의 heading 계층·마크다운 잔여 문자도 검사했다.
- 검색 Worker 호환 배포 후 32개 slug, 352개 chunk 동기화 성공. 실제 `/search` 응답 HTTP 200과 관련
  source 반환 확인. Vectorize namespace/model/dimension은 유지했다.
- `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` 통과. 테스트 651개 통과, manifest 전용
  검사 1개는 기본 suite에서 skip되며 manifest를 지정한 별도 실행에서는 32개 글 포함 3개 검사 통과.
  cache key 변경 후 Blog 439개 테스트·lint·typecheck와 Vercel 최종 빌드도 통과했다.
- editor/Blog/CMS format:check, git diff --check 통과. CMS의 기존 filesystem tracing 경고와 Worker
  dry-run build의 Turbo output 경고는 남아 있지만 빌드는 성공했다. 전체 기기 시각 검수는 범위
  밖이며, 대표 표 글의 390px 모바일/데스크톱 검수를 수행했다. 긴 breadcrumb의 가로 넘침을 수정했다.
- 별도 read-only preview 서버로 복구안을 확인했다. 최초 호환 배포에는 이번 수정만 포함했고, 최종
  통합 배포에서는 최신 main에 반영된 디자인과 스크롤 동작을 유지했다. 로컬 env는 포함하지 않았다.

### 주요 수정 파일

- `packages/editor/src/{document,post-content,html-content,rich-content,inline-content,tiptap-content,validation}.ts`:
  rich inline·표·목록 모델, 안전한 HTML/Markdown 변환, Tiptap 왕복과 중첩 validation.
- `apps/cms/components/editor/{editor-screen.tsx,content-extensions.ts,editor-toolbar.tsx}` 및
  `apps/cms/lib/editor/{editor-save,publish-workflow}.ts`: 편집·붙여넣기·캡션·저장/발행 경계.
- `apps/blog/app/posts/[slug]/post-body-renderer.tsx`, 상세 page·breadcrumb·CSS,
  `apps/blog/features/blog/server/content-source-d1r2.ts`: 안전한 공개 렌더링, 목록/표 구조,
  모바일과 cache key.
- `scripts/migration/{content-recovery,recover-published-content,import-tistory}.ts`,
  `scripts/migration/verify-published-rendering.py`: 원문 복구·guarded 쓰기·rollback·운영 재검증.
- `apps/rag-worker/package.json`, 패키지 README·콘텐츠 계약·회귀 테스트: 공유 모델 의존성과 검증.

### 배포 식별자

| 대상       | 최종 배포                                                                                | 복구 전 배포                                                                             |
| ---------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Blog       | `dpl_9JU9c4Y699ea2pZ1ZkJsLGnEvDTN`, `https://blog-6dz1zspy7-hochois-projects.vercel.app` | `dpl_5QvqbD1uKMsa6ZaDo5jmL15MyNcW`, `https://blog-o79zoblaw-hochois-projects.vercel.app` |
| CMS        | `dpl_BubVU1h77ieYaBLE3CpjqBD5ktke`, `https://blog-aeilftzcp-hochois-projects.vercel.app` | `dpl_Cw36CPVLDrdcF2HrVs71gDe8ELRz`, `https://blog-lug048aj3-hochois-projects.vercel.app` |
| RAG Worker | `a73a7140-7973-497f-a46d-4fc7a7d2e6c5`                                                   | `9d92ca2b-4e23-450a-98eb-19bd7c134c6b`                                                   |

Blog의 최초 호환 배포는 `dpl_99MHA595e33WFH7PACgBM6E6iGcm`이며, 데이터 복구 후 prerender를
재생성했다. 이후 별도 디자인 작업의 구형 parser 배포가 운영을 덮어쓴 것을 확인하여, 최신 main
`5cda2847051630394ed463cd378e4daaa6a583bc`의 디자인과 복구 코드를 합친 위 최종 배포로 전환했다.
CMS도 호환 배포로 복원했다. 통합 소스는
`_workspace/content-rendering-recovery-20261105/combined-source/`다. 통합 Blog 테스트
442개·lint·typecheck·build 통과 후 보호된 배포와 운영 35개를 재검증했다. 운영 별칭은
`https://hozorica.com`, `https://cms.hozorica.com`이다. 데이터 rollback 후 코드를 되돌릴 때에는 위
복구 전 배포를 사용하고, 검색 색인도 다시 동기화한다.

### Git 전달 상태

다음 main 배포에도 호환 코드가 유지되도록 최신 main 기준 패치를
`_workspace/content-rendering-recovery-20261105/content-repair-on-main.patch`에 보관하고
`codex/content-preservation-recovery` 브랜치로 분리해 전달한다. 다음 배포는 이 변경을 포함해야 하며,
구형 editor/parser만 다시 배포하면 table을 포함한 본문을 처리할 수 없다. 사용자 작업 브랜치의 다른
UI 변경은 보존했다.

전달 PR: https://github.com/choihooo/blog-platform/pull/8. 최초 전달 커밋은 `ff61f27`이다. Git 연동
미리보기 빌드에서 콘텐츠 API 주소 누락을 확인하여 Blog 프로젝트의 Production 및 이번 Preview
브랜치에 `BLOG_CONTENT_PROXY_URL=https://cms.hozorica.com`을 설정했다. 다음 main 배포도 동일한 공개
CMS 경로를 사용한다. 이 설정에는 비밀값이 없으며 운영 데이터는 변경하지 않는다.
