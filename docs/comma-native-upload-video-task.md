# Comma Native 사진 업로드 영상 제작 작업서

## 1. 작업 목적

Comma 프로젝트의 두 번째 사례인 `WebView의 React 화면에서 Native 기능을 직접 사용할 수 없음`을
영상으로 증명한다.

영상에서 보여줘야 하는 핵심은 단순한 사진 게시 기능이 아니다. React WebView에서 시작한 사용자 행동이
typed AppBridge를 거쳐 Native 갤러리를 열고, Native가 선택한 파일과 Web 입력값을 조합해 multipart
요청으로 게시물을 생성한 뒤 다시 Web 피드에 결과가 표시되는 전체 연결 과정이다.

최종 영상은 다음 흐름을 한 번에 보여줘야 한다.

```text
Web 활동 완료
→ 사진 추가 요청
→ Native 갤러리 표시
→ 사진 선택
→ Web 리뷰·해시태그 입력
→ Native multipart 업로드
→ 게시 완료
→ Web 피드에 새 게시물 표시
```

## 2. 관련 저장소와 페이지

- Comma 앱 저장소: `/Users/choiho/coding/comma-Front`
- 포트폴리오 저장소: `/Users/choiho/coding/blog`
- 포트폴리오 프로젝트 데이터: `apps/blog/features/projects/data/comma.ts`
- 포트폴리오 에셋 폴더: `apps/blog/public/projects/comma`
- 삽입 대상 사례: `typed-native-bridge`
- 삽입 위치: Bridge 구조 도식 다음, `결과` 블록 이전

기존 Bridge 도식은 다음 경로에 있다.

```text
apps/blog/public/projects/diagrams/comma-native-bridge.png
```

## 3. 촬영 방식

### 필수 방식

- 실제 휴대폰의 내장 화면 녹화 기능을 사용한다.
- 휴대폰 외관을 다른 카메라로 촬영하지 않는다.
- iPhone은 제어 센터의 화면 기록을 사용한다.
- Android는 시스템 내장 화면 녹화를 사용한다.
- 세로 방향으로 촬영한다.
- 가능하면 실제 배포 빌드 또는 배포 빌드와 동일한 설정의 앱을 사용한다.
- 시뮬레이터는 실제 기기 촬영이 불가능할 때만 대안으로 사용한다.

### 실제 기기가 좋은 이유

- Native 갤러리와 권한 UI가 실제 운영 환경과 동일하게 보인다.
- WebView와 Native 화면 사이의 전환이 자연스럽게 기록된다.
- 플랫폼별 파일 URI와 미디어 권한을 처리한 구현 의도를 시각적으로 증명할 수 있다.
- 시뮬레이터 특유의 마우스 포인터와 데스크톱 프레임이 노출되지 않는다.

## 4. 촬영 전 준비

### 개인정보 제거

- 알림 미리보기를 끈다.
- 방해 금지 모드를 켠다.
- 상태 표시줄에 민감한 정보가 표시되지 않는지 확인한다.
- 실제 이름, 이메일, 전화번호, 토큰, 서버 주소를 노출하지 않는다.
- 갤러리에는 촬영에 사용할 테스트 이미지 외의 개인 사진이 보이지 않게 한다.
- 피드에 다른 사용자의 실명이나 프로필 이미지가 노출되면 테스트 계정과 테스트 데이터로 교체한다.

### 테스트 데이터

- 갤러리 첫 화면에 테스트용 사진을 배치한다.
- 음식, 책상, 풍경처럼 개인정보가 없는 사진을 사용한다.
- 리뷰 문구는 짧고 실제 서비스 문맥에 맞게 준비한다.
- 권장 리뷰: `잠깐 쉬고 나니 다시 집중할 수 있었어요.`
- 권장 해시태그: `#짧은휴식 #집중회복`
- 공개 여부 등 추가 설정이 있다면 최종 게시 상태를 미리 결정한다.

### 앱 상태

- 테스트 계정으로 로그인한다.
- 업로드 API가 정상 동작하는지 촬영 전에 한 번 확인한다.
- 사진 권한은 촬영 흐름에 맞춰 결정한다.
  - 권한 요청까지 구현 범위로 보여주려면 권한을 초기화한다.
  - 영상 길이를 줄이려면 권한을 미리 허용한다.
- 활동 완료 직전 또는 사진 게시를 시작할 수 있는 화면까지 미리 이동한다.
- 네트워크가 안정적인 환경에서 촬영한다.

## 5. 권장 촬영 시나리오

원본은 앞뒤 여유를 포함해 20~~30초로 촬영하고, 최종본은 10~~15초로 편집한다.

| 구간        | 화면과 행동         | 보여줘야 하는 내용                    |
| ----------- | ------------------- | ------------------------------------- |
| 0.0~1.5초   | 활동 완료 화면      | Web에서 게시 흐름이 시작된다는 맥락   |
| 1.5~3.0초   | `사진 추가` 선택    | Web 요청이 Native 기능으로 이어짐     |
| 3.0~5.0초   | Native 갤러리 표시  | 실제 시스템 갤러리 또는 Native picker |
| 5.0~6.5초   | 테스트 사진 선택    | 선택 결과가 앱으로 반환됨             |
| 6.5~9.0초   | 리뷰·해시태그 화면  | Web UI와 선택한 사진이 함께 표시됨    |
| 9.0~10.5초  | 게시 버튼 선택      | 업로드 요청 시작                      |
| 10.5~13.0초 | 업로드 완료 후 피드 | 새 게시물이 실제 피드에 표시됨        |

리뷰와 해시태그를 직접 입력하는 장면이 길어지면 미리 입력해 둔다. Bridge 사례의 핵심은 타이핑이
아니라 Native 파일 선택과 게시 흐름의 연결이다.

## 6. 촬영 원본 검수

다음 조건을 모두 만족하지 않으면 다시 촬영한다.

- [ ] 세로 화면 전체가 잘리지 않았다.
- [ ] 실제 Native 갤러리가 명확히 보인다.
- [ ] 선택한 사진이 리뷰 작성 화면에 표시된다.
- [ ] 리뷰 또는 해시태그가 게시 요청에 포함된다는 사실을 확인할 수 있다.
- [ ] 게시 버튼을 누르는 장면이 포함되어 있다.
- [ ] 업로드 완료 후 피드에 새 게시물이 표시된다.
- [ ] 개인 사진이나 개인정보가 노출되지 않는다.
- [ ] 알림 배너가 화면을 가리지 않는다.
- [ ] 로딩 오류, 디버그 메뉴, 개발 서버 주소가 보이지 않는다.
- [ ] 촬영 중 기기 회전이나 화면 크기 변화가 없다.

## 7. 편집 규격

### 최종 영상

- 권장 길이: 10~15초
- 방향: 세로
- 프레임 레이트: 30fps
- 비디오 코덱: H.264
- 오디오: 제거
- MP4 픽셀 포맷: `yuv420p`
- 브라우저 자동 재생을 위해 `faststart` 적용
- 원본 비율을 유지하고 강제로 늘리지 않는다.
- 불필요한 대기 구간만 제거한다.
- 기능 전환을 오해하게 만드는 속도 조절이나 장면 재배열은 하지 않는다.
- Native 갤러리 진입과 피드 게시 완료 장면은 반드시 유지한다.

### WebM

- VP9으로 변환한다.
- MP4와 길이, 해상도, 시작·종료 프레임을 동일하게 맞춘다.

### Poster

- Native 갤러리에서 사진을 선택했거나 리뷰 화면에 선택 이미지가 표시된 프레임을 사용한다.
- 첫 화면만으로도 사진 업로드 기능임을 이해할 수 있어야 한다.
- 흰 화면, 로딩 화면, 빈 피드는 poster로 사용하지 않는다.

## 8. 권장 파일명

다음 세 파일을 생성한다.

```text
apps/blog/public/projects/comma/native-photo-upload.mp4
apps/blog/public/projects/comma/native-photo-upload.webm
apps/blog/public/projects/comma/native-photo-upload-poster.jpg
```

편집 전 원본은 포트폴리오 public 폴더에 넣지 않는다. 원본 위치와 파일명만 작업 결과에 기록한다.

## 9. FFmpeg 예시

입력 영상의 방향과 해상도가 정상이라는 가정의 예시다. 시작 시간과 길이는 실제 원본에 맞게 조정한다.

```bash
ffmpeg -ss 00:00:02.000 -i input.mov -t 13 \
  -an -vf "fps=30" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -movflags +faststart \
  apps/blog/public/projects/comma/native-photo-upload.mp4
```

```bash
ffmpeg -i apps/blog/public/projects/comma/native-photo-upload.mp4 \
  -an -c:v libvpx-vp9 -crf 30 -b:v 0 -row-mt 1 \
  apps/blog/public/projects/comma/native-photo-upload.webm
```

```bash
ffmpeg -ss 00:00:05 -i apps/blog/public/projects/comma/native-photo-upload.mp4 \
  -frames:v 1 -update 1 \
  apps/blog/public/projects/comma/native-photo-upload-poster.jpg
```

## 10. 포트폴리오 삽입 작업

현재 프로젝트 블록 타입에는 단일 영상 블록이 없다. 다음 순서로 구현한다.

1. `project-types.ts`에 단일 영상 블록 타입을 추가한다.
2. 블록 필드는 MP4, WebM, poster, 대체 설명, 캡션, width, height를 지원한다.
3. `project-block-renderer.tsx`에서 자동 재생 가능한 단일 영상 UI를 구현한다.
4. 기존 `AutoplayVideo` 컴포넌트를 재사용한다.
5. 영상은 `muted`, `loop`, `playsInline` 조건을 유지한다.
6. 영상 컨트롤과 키보드 접근성을 기존 비교 영상과 동일하게 제공한다.
7. Comma의 `typed-native-bridge` 사례에서 Bridge 도식 다음, 결과 블록 이전에 영상 블록을 삽입한다.

권장 캡션:

```text
Web에서 시작한 게시 흐름이 typed AppBridge를 통해 Native 갤러리와 multipart 업로드로 이어지고,
완료된 게시물이 다시 Web 피드에 표시되는 과정
```

권장 대체 설명:

```text
활동 완료 화면에서 Native 갤러리 사진을 선택하고 리뷰와 해시태그를 입력해 피드에 게시하는 과정
```

## 11. 시각 디자인 기준

- 영상은 Bridge 도식과 같은 본문 폭을 사용한다.
- 세로 영상이 본문 전체 높이를 과도하게 차지하지 않도록 최대 너비를 제한한다.
- 데스크톱에서는 약 360~430px 너비가 적절하다.
- 모바일에서는 컨테이너 너비를 넘지 않게 한다.
- 영상 주위에 별도의 장식용 카드나 중첩 카드를 만들지 않는다.
- 캡션은 영상 아래에 배치한다.
- 기존 Hozui 토큰과 프로젝트 상세 페이지의 border, radius, caption 스타일을 재사용한다.

## 12. 최종 검증

### 파일 검증

```bash
ffprobe -v error \
  -show_entries stream=codec_name,width,height,avg_frame_rate,pix_fmt \
  -show_entries format=duration \
  apps/blog/public/projects/comma/native-photo-upload.mp4
```

- [ ] MP4가 H.264로 인코딩됐다.
- [ ] MP4가 `yuv420p`를 사용한다.
- [ ] MP4와 WebM의 길이가 일치한다.
- [ ] MP4와 WebM의 해상도가 일치한다.
- [ ] poster가 영상과 동일한 비율이다.

### 페이지 검증

- [ ] 데스크톱에서 영상이 자동 재생된다.
- [ ] 모바일에서 영상이 컨테이너 밖으로 넘치지 않는다.
- [ ] MP4와 WebM 중 하나를 지원하는 브라우저에서 재생된다.
- [ ] poster가 흰 화면으로 보이지 않는다.
- [ ] 반복 재생 시 시작과 종료가 지나치게 어색하지 않다.
- [ ] 영상과 Bridge 도식이 같은 내용을 중복 설명하지 않고 구조와 실제 동작을 각각 보완한다.
- [ ] 포트폴리오 lint와 테스트가 통과한다.

```bash
pnpm --filter blog lint
pnpm --filter blog test
```

## 13. 완료 조건

다음 결과가 모두 준비되면 작업 완료로 본다.

1. 개인정보가 제거된 실제 휴대폰 원본 영상
2. 10~15초 길이의 H.264 MP4
3. 동일한 WebM 영상
4. 기능을 식별할 수 있는 poster JPG
5. Comma Bridge 사례에 삽입된 단일 영상 블록
6. 반응형 화면과 자동 재생 검증
7. lint와 테스트 통과
8. 사용한 원본 경로, 최종 영상 길이, 해상도와 검증 결과가 포함된 작업 보고

## 14. 에이전트에게 전달할 요청문

아래 문장을 작업 요청으로 그대로 사용할 수 있다.

```text
docs/comma-native-upload-video-task.md를 기준으로 Comma Native 사진 업로드 영상을 제작하고
포트폴리오의 typed-native-bridge 사례에 삽입해줘. 실제 휴대폰 화면 녹화 원본을 사용하고,
개인정보 제거와 MP4/WebM/poster 생성, 단일 영상 블록 구현, 반응형 검증, lint와 테스트까지
완료해줘. 원본이 제공되지 않았거나 실제 갤러리→리뷰→피드 게시 흐름이 영상에 없으면 임의로
합성하지 말고 필요한 원본을 먼저 요청해줘.
```
