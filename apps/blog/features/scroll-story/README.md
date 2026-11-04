# 호조리카 스크롤 시안

미리보기: `/experiments/scroll-story`. 운영 홈을 교체하지 않는 독립 시안입니다.

인사와 About → 글쓰기와 Blog → 작업과 Work 순서입니다. 링크는 기존 `/resume`, `/blog`, `/projects`로
연결합니다. 스크롤 스냅으로 이동할 장면을 선택하면 1초짜리 전환 MP4를 한 번 재생합니다. 첨부된 Lena
Varga Hero 화면 기록을 참고해 카메라 시점이 바뀌는 캐릭터 영상, 기울어지는 바닥과 사선 장면 교체를
영상 안에 합성했습니다. HTML 화면 전체를 회전하지 않습니다. 메뉴는 고정하고 제목은 도착 후 글자마다
순서대로 나타납니다. 도착한 화면의 영상만 반복 재생하고 나머지는 정지합니다. 스크롤 위치로 영상
시간을 되감지 않습니다. 하단에는 다음 장면 이동만 표시합니다. 모션 줄이기를 켜면 정지 이미지로
표시합니다. 탭이 가려지면 영상도 정지합니다. 헤더 버튼과 하단 버튼으로도 화면을 이동할 수 있습니다.

이미지는 `public/brand/scroll-story/`에 보관합니다. 기존 호조리카 캐릭터를 참고해 내장 image_gen으로
생성했습니다. 현재 폰트는 앱의 기존 본문 폰트를 상속합니다.

## 챗봇

오른쪽 아래에서 기존 `PortfolioChat`을 그대로 엽니다. 픽셀룸의 채팅 스타일과 공개 자료
검색·모델·대화 처리를 재사용합니다. 챗봇은 스크롤 컨테이너 밖에 두어 채팅창 스크롤이 장면 전환을
일으키지 않게 했습니다. 화면 위에 고정되며 모바일에서도 좌우 24px 안에 들어옵니다.
열기·닫기·Escape와 추천 질문 응답을 확인했습니다. 모델 실행의 브라우저 지원 조건은 기존 챗봇과
같습니다.

## 반복 영상

현재 재생 파일은 `plates-centered/`의 H.264 MP4입니다. 가로 1920×1080, 세로 1080×1620을 화면 비율에
맞춰 선택합니다. 캐릭터는 두 비율 모두 수평 중앙에 배치합니다. 세 가지 반복 장면과 여섯 방향의
전환을 각각 두 비율로 준비했습니다. 정지 JPG를 재생 실패/모션 줄이기 대체 화면으로 사용합니다.
배경과 캐릭터는 영상에 포함되고 문구·링크·메뉴는 HTML입니다. Wan 2.2로 각 장면의 카메라 궤도 이동
컷을 3초씩 새로 생성했습니다. 전환은 이 생성 컷과 바닥·사선 마스크를 합성한 시안이며 실제 3D 모델
렌더가 아닙니다. AI 영상의 얼굴·가구 형태 변화와 반복/전환 경계의 작은 자세 차이가 남을 수 있습니다.
재생 중 반대 장면을 선택하면 현재 표시 장면을 기준으로 새 전환을 시작합니다. 모션 정지/줄이기에서는
바로 장면을 교체합니다. 생성 원본과 프롬프트는 작업 폴더 `outputs/hozorica-turns/`, 스크립트는
`outputs/generate-hozorica-turns.py`, 합성 스크립트는 `outputs/render-hozorica-story.py`입니다.

인사 장면의 idle/orbit 원본은 640×640에서 832×816으로 재생성했습니다. 다른 네 컷은 무료 계정의 생성
횟수 제한으로 기존 640×640 원본을 사용합니다. 출력 크기가 원본 디테일 해상도를 뜻하지는 않습니다.
재압축 손실을 줄이기 위해 CRF 24에서 16으로 변경했고, 가로 화면에서 캐릭터를 과도하게 확대하지
않습니다. 모든 장면에서 제목·안내·바로가기를 캐릭터 위쪽 중앙에 순서대로 모아 배치합니다. 블로그와
포트폴리오는 짧은 제목과 한 문장 설명을 사용합니다. 장면 번호와 분류 표시는 제거했습니다. 실제 사용
원본은 `plates-centered/sources.json`에 기록합니다. HQ 생성 스크립트는 작업 폴더의
`outputs/generate-hozorica-hq.py`, 성공한 HQ 원본은 `outputs/hozorica-hq/`에 있습니다.

블로그의 배경은 흰색 소형 글자 대비를 위해 CSS와 합성 영상 모두 `#3d6ed5`로 맞췄습니다. 정상 배경
대비는 약 4.78:1이며, 어두운 바닥에서는 더 높습니다. 가로 영상은 캐릭터 크기를 유지하고 4vh 아래로
옮겨 바로가기와 머리 사이 여유를 확보했습니다. 버튼은 최소 44×44px입니다.

## 전환 회귀 확인

1. About에서 Blog를 누르고 전환 영상이 시작되자마자 About을 다시 누릅니다. 제목과 바로가기가
   복구되고 `data-transitioning` 속성이 없어야 합니다.
2. About → Blog → Portfolio → About을 이동합니다. 도착한 장면의 영상만 재생되고 다른 장면은 정지해야
   합니다.

### 이전 알파 반복 영상

`greeting-loop.webm`, `writing-loop.webm`, `working-loop.webm`은 로그인된 Hugging Face 계정의 무료
ZeroGPU로 생성한 Wan 2.2 I2V 14B 영상입니다. 원본 동작은 각 3초이며, 정방향과 역방향을 연결해 반복
경계의 튐을 줄였습니다. 초록 배경을 제거한 알파 WebM이며, 세 파일 합계 약 900 KB입니다. 재생 실패 시
기존 PNG를 유지합니다. 실제 3D 캐릭터 리깅이나 걷기 전환을 포함하지 않고, 각 화면에서
인사·필기·타이핑 동작을 반복합니다. 영상 원본·정확한 프롬프트·생성 스크립트는 작업 폴더의
`outputs/hozorica-loops/`와 `outputs/generate-hozorica-loops.py`에 보관합니다.

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
