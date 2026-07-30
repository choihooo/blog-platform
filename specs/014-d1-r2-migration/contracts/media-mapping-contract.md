# Contract: Media Mapping

## Purpose

Supabase 미디어 URL을 R2 키로 이전하고, 본문 이미지 치환 및 썸네일 동기화를 안정적으로 수행하기 위한
맵핑과 검증 계약이다.

## Inputs

- Supabase 원본 URL 목록
- 대상 글 slug 목록 또는 postId 목록
- 정책값: `convertToWebp`, `deduplicate`, `overwritePolicy`, `dryRun`

## Mapping Record

| Field | Type | 설명 |
| --- | --- | --- |
| `source_url` | string | 기존 Supabase public URL |
| `canonical_post_slug` | string | 매핑 대상 글 slug |
| `target_r2_key` | string | `blog/{YYYY}/{MM}/{post-slug}/{uuid}.webp` 형식 |
| `r2_url` | string | 공개 접근 URL 또는 프록시 URL |
| `kind` | string | `hero`, `body`, `og`, `pdf` |
| `width` | integer | 이미지 실제 가로 |
| `height` | integer | 이미지 실제 세로 |
| `status` | string | `pending`, `uploaded`, `mapped`, `failed`, `skipped` |
| `notes` | string | 실패 사유 또는 예외 메모 |

## Validation Rules

- `source_url`은 Supabase 패턴과 일치해야 하며, 공백/빈 값은 허용하지 않는다.
- `target_r2_key`는 월 단위 디렉터리와 slug 기반 경로를 따른다.
- `r2_url`은 공개 모드 또는 서명 URL 정책을 준수해야 한다.
- `kind`는 허용 enum만 허용하고 기본값은 `body`이다.
- 상태 전이는 `pending -> uploaded -> mapped` 또는 `pending -> failed`, `uploaded -> mapped`로만 허용한다.

## Migration Procedure

1. 추출: 원본 URL 목록에서 텍스트 패턴 기반 후보를 추출한다.
2. 업로드: 이미지를 WebP로 정규화하고 R2에 업로드한다.
3. 키 확정: 중복 키 충돌 시 uuid suffix로 재생성한다.
4. 치환: `content` 텍스트에서 치환표를 사용해 URL을 대체한다.
5. 검증: 치환 실패 건을 `failed`로 기록하고 재시도 큐에 남긴다.

## Retry & Recovery

- 업로드/치환 실패는 동일 run에서 최대 지정 횟수만큼 재시도한다.
- `failed` 상태는 보고서에 남고, 다음 run에서 재수집 대상이 된다.
- 재시도 불가 항목은 수동 검증 대상으로 분리한다.

