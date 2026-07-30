# Contract: CMS SEO Panel

## Scope

CMS editor는 현재 편집 중인 글의 SEO report와 발행 글의 외부 링크를 표시한다. 점수와 issue 계산은
`packages/seo-engine`를 사용하고, 외부 콘솔 링크는 `packages/analytics`를 사용한다.

## UI States

### Blocking

**When**: 발행 전 해결해야 하는 issue가 하나 이상 있다.

**Must show**:

- 0-100 SEO score
- 차단 오류 목록
- 경고 목록
- 검색/공유 미리보기 fallback 상태
- 발행 상태와 public output 반영 가능 여부

### Warning

**When**: 차단 오류는 없지만 권장 개선 issue가 있다.

**Must show**:

- SEO score
- 경고 목록
- 통과 항목 요약
- 검색 결과 미리보기
- 공유 미리보기

### Pass

**When**: 차단 오류와 경고가 없다.

**Must show**:

- SEO score
- 통과 상태
- 검색 결과 미리보기
- 공유 미리보기
- JSON-LD preview

### Analytics Links

**When**: 글이 `published` 상태이고 public URL을 계산할 수 있다.

**Must show**:

- 공개 글 열기
- GA4에서 페이지 성과 보기 또는 비활성 이유
- Search Console에서 검색 성과 보기 또는 비활성 이유

## Interactions

- editor title/body/frontmatter 변경 후 SEO report는 현재 editor document 기준으로 갱신된다.
- 저장 실패나 repository conflict가 있어도 현재 입력에 대한 SEO report는 표시할 수 있다.
- publish 시 차단 오류가 남아 있으면 운영자는 발행 전 해결할 항목을 볼 수 있어야 한다.
- disabled analytics provider에서는 외부 콘솔 링크 영역이 설정 부족 상태를 보여준다.

## Acceptance Criteria

- 완성된 샘플 글은 90점 이상과 pass 또는 warning 상태를 표시한다.
- 필수 metadata가 누락된 샘플 글은 최소 하나의 blocking issue를 표시한다.
- SEO report는 일반 MVP 글에서 2초 이내에 표시된다.
- UI는 GA4/Search Console 지표 값을 직접 표시하지 않는다.
