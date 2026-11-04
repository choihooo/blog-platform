# 프로젝트 케이스 스터디 작성 가이드

## 작업 바탕화면

프로젝트 상세 `/projects/[slug]`도 작업실과 같은 아이보리·남색·블루의 문서 창 스타일을 사용합니다.
`project-document.css`는 상세 본문에만 적용되며, 전역 테마 설정은 바꾸지 않습니다. 헤더는 메인·
작업실·프로젝트 목록/상세가 `navigation/MainHeader`를 공유합니다. 홈에서는 장면 이동 버튼, 다른
페이지에서는 `/resume`, `/blog`, `/projects` 링크로 동작합니다. 상단 문서 바에서 작업실 또는 기존
프로젝트 목록으로 이동합니다. 본문·성과·목차· 증거 링크·관련 글과 canonical URL을 유지합니다.
모바일의 전후 영상 비교는 세로로 쌓습니다.

정식 주소는 `/projects`입니다. `/experiments/interactive-portfolio`는 `/projects`로 영구 이동합니다.
기존 스크롤 메인 `/`은 유지하고 Portfolio 바로가기는 정식 작업실을 엽니다. `desktop/`의 React 상태로
전체 11개 프로젝트 아이콘 이동, 모델리스 창, 최소화/복원/최대화/닫기를 제공합니다. 소개와 모든
프로젝트는 Dock에서 열며 상세 내용은 기존 `/projects/[slug]`로 연결합니다. 바탕화면 아이콘은 고정
격자 대신 결정적인 개별 위치·기울기를 사용하고, 사용자가 옮긴 위치가 우선합니다. 작은 화면의 터치
탐색을 위해 모바일에서는 그리드로 전환합니다. 안내 문구는 표시하지 않습니다. 미리보기의
`ProjectWindowSummary`는 기존 프로젝트 데이터에서 역할·기간·팀 구성·기술·성과와 측정 조건을
표시합니다. 주요 작업은 앞의 세 섹션에 직접 연결하고, 관련 블로그 기록 및 외부 증거 링크를
제공합니다. 누락된 기술/성과/팀 정보는 빈 영역으로 만들지 않습니다. 자세히 보기 버튼은 미디어 위에
배치합니다. 시연 영상은 활성 창의 스크롤 영역 안에 보일 때만 자동 재생합니다. 페이지 하단의 중복
프로젝트 목록과 상단 '모든 작업' 링크는 제거했습니다. 전체 11개 아이콘 및 Dock의 프로젝트 창에서
작업을 탐색합니다. JavaScript 없이도 noscript의 실제 프로젝트 상세 링크 11개로 탐색할 수 있습니다.
예전 `/projects#slug` 주소는 해당 미리보기 창을 복원합니다. 모바일/낮은 가로 화면은 아이콘을
그리드로 정렬하고, 넓은 화면에서는 자유 이동합니다. 화면 밖으로 창이 나가지 않도록 좌표를 제한하며
영상은 활성 창에서만 재생합니다. 창 제목 표시줄을 드래그해 이동하고, 네 변과 네 모서리를 드래그해
크기를 바꿀 수 있습니다. 오른쪽 아래 크기 조절 핸들은 방향키(16px), Shift+방향키(40px)도 지원합니다.
각 창의 위치와 크기는 최소화·복원·최대화 전환 동안 유지하며, 작은 화면에서는 표시 크기를 화면 안으로
제한합니다. `prefers-reduced-motion`에서는 자동재생을 멈춥니다. CSS는 아이보리·블루·남색으로
스코프되어 전역 테마를 변경하지 않습니다. 기존 상세 페이지의 모달 정책은 바꾸지 않습니다.

프로젝트 상세 페이지는 공통 헤더와 디자인을 유지하면서, 각 프로젝트의 본문 순서를 자유롭게 구성할 수
있는 블록 시스템을 사용합니다.

## 파일 구조

```text
features/projects/
├── data/                         # 프로젝트별 콘텐츠
│   ├── ai-workflow.ts            # 네이티브 블록 작성 예시
│   └── ...
├── project-block-renderer.tsx    # 블록별 화면 렌더링
├── project-content.ts            # 기존 stories 변환 + TOC 생성
├── project-data.ts               # 프로젝트 순서와 slug 조회
├── project-detail-page.tsx       # 상세 페이지 공통 셸
└── project-types.ts              # 블록과 프로젝트 타입
```

## 새 프로젝트 추가

1. `data/`에 `{slug}.ts` 파일을 만듭니다.
2. `sections` 안에 원하는 순서로 블록을 배치합니다.
3. `project-data.ts`에서 import하고 `projects` 배열에 추가합니다.
4. 이미지는 `apps/blog/public/projects/{slug}/`에 둡니다.

## 관련 블로그 글 연결

프로젝트 상세와 모달 하단에 관련 글을 노출하려면 프로젝트 데이터에 `relatedPosts`를 추가합니다.

```ts
relatedPosts: [
  {
    slug: "typescript-5-migration",
    title: "TypeScript 5 마이그레이션 회고",
    excerpt: "500개 이상의 타입 오류를 정리하며 세운 전환 기준입니다.",
  },
],
```

`slug`는 공개된 블로그 글의 slug와 동일해야 합니다. 관련 글이 없거나 배열이 비어 있으면 영역은
렌더링되지 않습니다.

```ts
import type { ProjectCaseStudy } from "../project-types";

export const sampleProject = {
  slug: "sample",
  index: "10",
  name: "프로젝트 이름",
  meta: "서비스 유형 · 2026",
  description: "목록과 상세 헤더에 표시할 한 문장 설명",
  role: "Frontend Engineer",
  period: "2026.01 ~ 2026.03",
  organization: "팀 이름",
  technologies: ["Next.js", "TypeScript"],
  evidence: [
    {
      type: "repository",
      label: "GitHub 저장소",
      href: "https://github.com/owner/repository",
    },
  ],
  metrics: [],
  sections: [
    {
      id: "background",
      eyebrow: "Context 01",
      title: "프로젝트 배경",
      blocks: [
        {
          type: "text",
          id: "situation",
          title: "Situation",
          body: ["첫 번째 문단", "두 번째 문단"],
        },
        {
          type: "image",
          src: "/projects/sample/overview.png",
          alt: "프로젝트 화면 설명",
          caption: "이미지 캡션",
          layout: "wide",
        },
        {
          type: "result",
          id: "outcome",
          title: "Outcome",
          body: "핵심 결과",
        },
      ],
    },
  ],
} satisfies ProjectCaseStudy;
```

전체 예시는 `data/ai-workflow.ts`를 참고합니다.

## TOC 생성 규칙

- `section.id`와 `section.title`은 TOC 1단계 항목이 됩니다.
- 블록에 `id`와 `title`을 모두 넣으면 TOC 2단계 항목이 됩니다.
- `tocLabel`을 넣으면 본문 제목 대신 짧은 TOC 이름을 사용할 수 있습니다.
- 제목이 필요하지만 TOC에는 노출하고 싶지 않다면 `id`를 생략합니다.
- `section.id`는 프로젝트 안에서 중복되지 않아야 합니다.
- 같은 섹션 안에서 블록 `id`도 중복되지 않아야 합니다.

```ts
{
  type: "text",
  id: "technical-decision",
  title: "기술 선택과 트레이드오프",
  tocLabel: "기술 선택",
  body: "...",
}
```

위 블록은 `#섹션-id-technical-decision` 앵커로 연결됩니다.

## 블록 종류

### `text`

한 문단 또는 여러 문단을 표시합니다. `body`에 문자열이나 문자열 배열을 넣을 수 있습니다.

```ts
// 같은 문단 안에서 줄만 바꾸기
{ type: "text", title: "배경", body: "첫째 줄\n둘째 줄" }

// 의미가 다른 문단으로 나누기
{ type: "text", title: "배경", body: ["문단 1", "문단 2"] }
```

- `\n`은 같은 문단 안의 강제 줄바꿈으로 표시됩니다.
- 문자열 배열은 각 항목을 별도 문단으로 만들고 문단 사이 여백을 줍니다.
- 독립된 문장은 문자열 배열을 권장하고, 주소나 짧은 문구처럼 한 문단 안에서 줄만 바꿀 때 `\n`을
  사용합니다.

`result`, `quote`, 목록 항목, 지표 설명, 이미지와 코드 캡션에서도 `\n`을 같은 방식으로 사용할 수
있습니다. `code` 블록은 `<pre>` 요소이므로 원래 입력한 줄바꿈을 그대로 유지합니다.

### `image`

로컬 이미지를 캡션과 함께 표시합니다. `width`와 `height`는 원본 비율 계산용 숫자입니다.

```ts
{
  type: "image",
  src: "/projects/sample/result.png",
  alt: "결과 화면",
  caption: "개선 후 화면",
  width: 1600,
  height: 900,
  layout: "wide",
}
```

### `bullets`

구현 내용이나 의사결정을 순서와 무관한 목록으로 표시합니다.

```ts
{ type: "bullets", title: "구현 내용", items: ["항목 1", "항목 2"] }
```

### `metrics`

본문 중간에 성과 지표를 배치합니다.

```ts
{
  type: "metrics",
  title: "검증 결과",
  items: [{ label: "처리 시간", value: "31.6%", detail: "중앙값 기준 단축" }],
}
```

### `result`

왼쪽 강조선이 있는 핵심 결과 블록입니다.

```ts
{ type: "result", id: "result", title: "Result", body: "핵심 결과" }
```

### `quote`

사용자 피드백이나 프로젝트의 핵심 문장을 강조합니다.

```ts
{ type: "quote", body: "인용문", attribution: "인터뷰 참여자" }
```

### `code`

코드나 설정 예시를 표시합니다.

```ts
{
  type: "code",
  title: "데이터 구조",
  language: "ts",
  code: "const result = normalize(payload);",
  caption: "검색 결과 정규화 예시",
}
```

### `divider`

같은 섹션 안에서 내용 흐름을 분리합니다.

```ts
{
  type: "divider";
}
```

### `columns`

명시적으로 비교가 필요할 때만 2열 이상을 사용합니다. 모바일에서는 한 열로 표시됩니다.

```ts
{
  type: "columns",
  title: "Before / After",
  items: [
    { title: "Before", body: "기존 방식" },
    { title: "After", body: "개선 방식" },
  ],
}
```

기본 읽기 흐름은 위에서 아래입니다. `columns`는 직접 선택한 경우에만 가로 배치됩니다.

## 본문 폭

제목과 본문이 있는 블록에는 `layout`을 선택적으로 지정할 수 있습니다.

- `reading`: 긴 글에 적합한 기본 본문 폭
- `wide`: 이미지나 넓은 비교 자료용
- `full`: 상세 페이지 콘텐츠 영역 전체 사용

지정하지 않으면 이미지는 `wide`, 나머지 블록은 `reading`을 사용합니다.

## 기존 `stories` 형식

기존 프로젝트의 `stories`는 삭제하지 않아도 됩니다. `project-content.ts`가 각 story를 이미지,
Problem, Approach, Result 블록으로 자동 변환합니다.

새 프로젝트는 `sections`를 사용하고, 기존 프로젝트도 레이아웃을 다르게 구성할 때 `sections`로
전환합니다. 한 프로젝트에서 `stories`와 `sections`를 동시에 사용할 수는 없습니다.

## 검증

루트에서 아래 명령을 순서대로 실행합니다.

```bash
pnpm --dir apps/blog typecheck
pnpm --dir apps/blog lint
pnpm --dir apps/blog test
pnpm --dir apps/blog build
```

확인할 항목:

- 프로젝트 slug가 중복되지 않는지
- section과 TOC용 block id가 중복되지 않는지
- 이미지 경로와 alt가 올바른지
- 모바일에서 `columns`가 한 열로 내려오는지
- TOC 링크가 정확한 본문 제목으로 이동하는지
