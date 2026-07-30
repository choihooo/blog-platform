# Research: Media Upload

## Decision: 서버 측 이미지 검증과 webp 정규화를 사용한다

**Rationale**: CMS upload는 repository에 저장될 파일을 결정하는 mutation이므로 브라우저 환경 차이나
클라이언트 우회를 신뢰하지 않는다. 서버 action에서 파일 크기, MIME/확장자, 이미지 decode 가능 여부를
검증하고 가능한 경우 webp로 정규화하면 공개 경로에 저장되는 파일 형식과 용량을 예측 가능하게 유지할
수 있다.

**Alternatives considered**:

- 클라이언트 canvas 변환만 사용: 빠른 preview에는 유용하지만 보안과 저장 원본 검증에는 부족하다.
- 원본 파일 그대로 저장: 구현은 단순하지만 동일 정책, 파일 크기, 확장자 spoofing 방어가 약해진다.

## Decision: `sharp`를 CMS dependency로 추가한다

**Rationale**: Node.js server action에서 이미지 metadata 확인, decode 검증, webp 변환, 크기 측정에
검증된 라이브러리를 사용한다. custom image parser는 헌법의 검증된 라이브러리 사용 원칙과 맞지
않는다.

**Alternatives considered**:

- `squoosh` 계열 WASM 변환: 배포 크기와 runtime 비용이 커질 수 있고 현재 CMS server action 요구에는
  과하다.
- 브라우저 `createImageBitmap`: 서버 mutation 검증을 대체하지 못한다.

## Decision: 미디어 path는 slug와 content hash 기반으로 결정한다

**Rationale**: 같은 파일명 충돌과 overwrite를 피하면서 Git history에서 어떤 글의 미디어인지 추적하기
쉽다. cover image는 `public/media/covers/<slug>-<hash>.webp`, 본문 이미지는
`public/media/posts/<slug>/<hash>.webp`로 분리한다.

**Alternatives considered**:

- 원본 파일명 유지: 사람이 보기 쉽지만 충돌, 특수문자, privacy leak 위험이 있다.
- UUID만 사용: 충돌은 줄지만 글과의 관계가 약해져 운영자가 repository에서 추적하기 어렵다.

## Decision: slug 없는 새 초안은 이미지 업로드 전에 저장 가능한 slug 후보를 요구한다

**Rationale**: 본문 이미지 경로는 `posts/<slug>/`에 묶여야 하므로 slug 없는 임시 id로 commit하면
이후 글 저장 시 미디어 경로와 글 경로가 어긋난다. 새 초안은 제목 기반 slug 후보를 만들 수 있을 때
업로드를 허용하고, 후보 생성이 불가능하면 제목 입력을 먼저 요구한다.

**Alternatives considered**:

- 임시 draft id 경로에 저장 후 나중에 이동: 추가 commit과 참조 migration이 필요해 MVP 범위를 키운다.
- 모든 본문 이미지를 flat directory에 저장: 경로는 단순하지만 글별 정리와 추적성이 떨어진다.

## Decision: editor document에는 업로드 성공 후 public path만 반영한다

**Rationale**: 저장 가능한 MDX에 blob URL, data URL, 임시 로컬 경로가 남으면 공개 블로그 렌더링과
repository 원본이 오염된다. 업로드 중 상태는 UI state와 local draft backup의 pending marker로만
관리하고, 성공한 public path만 editor body나 frontmatter에 반영한다.

**Alternatives considered**:

- 업로드 전 blob URL을 image node src로 저장: preview는 쉬워지지만 저장 실패 시 원본 오염 위험이
  크다.
- 실패한 업로드도 placeholder node로 저장: 운영자가 실패 상태를 놓치면 깨진 이미지가 남는다.

## Decision: 미디어 삭제는 글 참조 제거까지만 지원한다

**Rationale**: repository 미사용 파일 정리는 참조 분석, history, 여러 글 간 재사용 판단이 필요하다.
MVP에서는 운영자가 글에서 이미지 참조를 제거하는 것까지만 다루고, 파일 정리는 Post-MVP로 둔다.

**Alternatives considered**:

- 참조 제거 시 repository 파일도 즉시 삭제: 동일 파일 재사용이나 글 저장 실패 상황에서 데이터 손실
  가능성이 있다.
- 정기 미사용 파일 청소: scheduler와 repository scan policy가 필요해 MVP에서 금지된 범위를 건드린다.
