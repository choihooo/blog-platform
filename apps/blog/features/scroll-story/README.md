# 호조리카 스크롤 홈

헤더는 `features/navigation/main-header.tsx`를 작업실·프로젝트 페이지와 공유합니다. 홈의
About/Blog/Portfolio는 기존 장면 이동 콜백을 사용하고, 로고는 처음 장면으로 이동합니다. 파란 Blog
장면에서는 상위 장면의 흰색을 상속합니다. 다른 페이지에서는 같은 메뉴가 실제 URL로 연결됩니다.
브랜드/메뉴의 폰트·간격·포커스·모바일 규칙은 `main-header.css`에서 함께 관리합니다.

## 현재 영상: 무료 ZeroGPU 고해상도 재생성 (2026-11-04)

현재 미디어 경로는 `public/brand/scroll-story/plates-ultrawide-v2/`입니다. 인사·글쓰기·작업의 반복
영상 3개와 양방향 전환 6개를 wide/tall/short 각각 제공하며 JPG 정지 화면도 포함합니다. wide/short는
3840×1080, tall은 1080×1620, 모두 30fps 무음 H.264/faststart입니다. 배경색·바닥·사선 전환을 전체
프레임 안에 합성했으므로 CSS 양옆 확장이나 마스크를 사용하지 않습니다. `cover`로 중앙을 유지하며
일반 가로 화면에서는 양옆만 자릅니다. 높이 500px 이하의 가로 화면은 캐릭터를 작게 배치한 short, 세로
화면은 tall을 선택합니다.

모션 원본은 Hugging Face 무료 ZeroGPU에서 생성했습니다. Lightricks/LTX-2-3으로 인사·글쓰기의
idle/orbit를 1024×1536, 작업 idle을 1024×1024로 만들었습니다. 작업 orbit은 남은 무료 한도에 맞춰
Saravutw/WAN2.2_I2V_LIGHTNING_4-8step_custom에서 832×816으로 생성했습니다. 3840×1080은 배경을 포함한
합성 크기이며 캐릭터 자체가 4K로 생성된 것은 아닙니다. 캐릭터 소스는 확대하지 않으며 작업 장면은
낮은 쪽 원본 높이에 맞춰 반복/전환 크기를 통일합니다. 기존 16:9 중앙 프레임과 CSS 배경 확장 방식은
전환 중 배경 불일치 때문에 폐기했습니다.

정식 주소: `/`. 이전 `/experiments/scroll-story`는 `/`로 영구 이동합니다. 픽셀룸은
`/experiments/pixel-room`에서 noindex로 보관합니다.

`/#about`, `/#blog`, `/#work`로 장면에 직접 진입합니다. 장면 이동은 hash를 replace하며 Next의
history state를 유지합니다. 상세 방문 후 뒤로 가기나 화면 회전에서는 해당 장면을 복원합니다. 전환
실패·재생 거절·4초 지연은 목적 장면의 JPG/CTA로 복구하며 오래된 전환 이벤트는 무시합니다. JavaScript
미실행용 일반 링크와 reduced-motion 정지 화면을 제공합니다. 챗봇은 최초 열기 전에는 모델을 불러오지
않습니다. 현재 미디어의 생성 정보는 `plates-ultrawide-v2/sources.json`에 보존합니다.

인사와 About → 글쓰기와 Blog → 작업과 Work 순서입니다. 링크는 `/about`, `/blog`, `/projects`로
연결합니다. 스크롤 스냅으로 이동할 장면을 선택하면 1초짜리 전환 MP4를 한 번 재생합니다. 첨부된 Lena
Varga Hero 화면 기록을 참고해 카메라 시점이 바뀌는 캐릭터 영상, 기울어지는 바닥과 사선 장면 교체를
영상 안에 합성했습니다. HTML 화면 전체를 회전하지 않습니다. 메뉴는 고정하고 제목은 도착 후 글자마다
순서대로 나타납니다. 도착한 화면의 영상만 반복 재생하고 나머지는 정지합니다. 스크롤 위치로 영상
시간을 되감지 않습니다. 하단에는 다음 장면 이동만 표시합니다. 모션 줄이기를 켜면 정지 이미지로
표시합니다. 탭이 가려지면 영상도 정지합니다. 헤더 버튼과 하단 버튼으로도 화면을 이동할 수 있습니다.

작업실에서 사용하는 `working.png`는 `public/brand/scroll-story/`에 보관합니다. 기존 호조리카
캐릭터를 참고해 내장 image_gen으로 생성했습니다. 현재 폰트는 앱의 기존 본문 폰트를 상속합니다.

## 챗봇

오른쪽 아래에서 기존 `PortfolioChat`을 그대로 엽니다. 픽셀룸의 채팅 스타일과 공개 자료
검색·모델·대화 처리를 재사용합니다. 챗봇은 스크롤 컨테이너 밖에 두어 채팅창 스크롤이 장면 전환을
일으키지 않게 했습니다. 화면 위에 고정되며 모바일에서도 좌우 24px 안에 들어옵니다.
열기·닫기·Escape와 추천 질문 응답을 확인했습니다. 모델 실행의 브라우저 지원 조건은 기존 챗봇과
같습니다.

## 이전 생성 시안

`plates/`, `plates-centered/`, 알파 WebM과 인사·필기 PNG는 현재 코드에서 사용하지 않아 공개 배포
폴더에서 제거했습니다. 이전 버전과 생성 기록은 Git 이력과 기존 작업 폴더의 `outputs/`에서 확인할 수
있습니다. 현재 홈의 반복·전환·정지 화면은 모두 `plates-ultrawide-v2/`를 사용합니다.

## 전환 회귀 확인

1. About에서 Blog를 누르고 전환 영상이 시작되자마자 About을 다시 누릅니다. 제목과 바로가기가
   복구되고 `data-transitioning` 속성이 없어야 합니다.
2. About → Blog → Portfolio → About을 이동합니다. 도착한 장면의 영상만 재생되고 다른 장면은 정지해야
   합니다.

## 생성 프롬프트

```json
[
  {
    "asset": "greeting.png",
    "tool": "built-in image_gen",
    "reference": "/Users/choiho/Desktop/hozorica/brand/character-sheet.png",
    "prompt": "Use case: stylized-concept. Create a single isolated transparent-background website character asset, NOT a sheet. Reference image: same Hozorica character identity, soft high quality 3D clay-like cartoon, black center parted hair, half-lidded calm dark eyes, offwhite sweatshirt, charcoal trousers, offwhite sneakers. Preserve face and proportions closely. Full body standing facing camera, friendly slight smile, right hand raised in a small greeting wave. No furniture. All parts completely inside canvas with generous padding. Transparent background, no floor, no scene, no lettering, no labels, no watermark. Soft studio lighting. Character fills most height."
  },
  {
    "asset": "writing.png",
    "tool": "built-in image_gen",
    "reference": "/Users/choiho/Desktop/hozorica/brand/character-sheet.png",
    "prompt": "Use case: stylized-concept. Create a single isolated transparent-background website character asset, NOT a sheet. Reference image: same Hozorica character identity, soft high quality 3D clay-like cartoon, black center parted hair, half-lidded calm dark eyes, offwhite sweatshirt, charcoal trousers, offwhite sneakers. Preserve face and proportions closely. Full body character seated at a minimal light beige desk, writing in an open notebook with a blue pen, three-quarter view facing left, simple stool visible, small stack of books. All parts completely inside canvas with generous padding. Transparent background, no floor, no scene, no lettering, no labels, no watermark. Soft studio lighting. Character fills most height."
  },
  {
    "asset": "working.png",
    "tool": "built-in image_gen",
    "reference": "/Users/choiho/Desktop/hozorica/brand/character-sheet.png",
    "prompt": "Use case: stylized-concept. Create a single isolated transparent-background website character asset, NOT a sheet. Reference image: same Hozorica character identity, soft high quality 3D clay-like cartoon, black center parted hair, half-lidded calm dark eyes, offwhite sweatshirt, charcoal trousers, offwhite sneakers. Preserve face and proportions closely. Full body character seated at a minimal desk with a large blue-accented computer monitor, typing on keyboard, three-quarter view facing left, simple stool visible. All parts completely inside canvas with generous padding. Transparent background, no floor, no scene, no lettering, no labels, no watermark. Soft studio lighting. Character fills most height."
  }
]
```
