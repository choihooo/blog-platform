# 모핑 아이폰 재현 데모

글 경로: `/blog/moping-retrospective`. 원본은 `../page.mdx`이며 발행일은 사용자 요청에 따라 2024년 12월 1일로 표기합니다. `/demos/moping`도 development에서 같은 글을 표시하며 production에서는 404입니다.

글의 「생각대로 움직이지 않던 핀」에서 `ref`로 이전 핀을 복원하는 설명 뒤에 데모를 삽입했습니다. 바텀시트 절 아래에는 낮음 → 높음 → 중간 순서의 조작 불가능한 고정 화면을 표시합니다.

```mdx
import { MopingDemo } from './visuals/MopingDemo';

<MopingDemo />
```

아이폰 외형·상태 표시줄·홈 인디케이터는 공통 `components/IPhoneMockup.tsx`를 사용합니다. 다른 글에서도 이 컴포넌트 안에 화면을 넣어 사용할 수 있습니다. 크기 조정, 지도, 장소 정보와 시트 동작은 이 글의 `visuals/`에서 관리합니다. `screenRef`와 `screenProps`로 화면 크기 측정과 이벤트·접근성 속성을 전달하며, `statusTone`으로 상태 표시줄의 글자색을 정합니다.

```tsx
import { IPhoneMockup } from '@/components/IPhoneMockup';

<IPhoneMockup statusTone="dark">
  <YourScreen />
</IPhoneMockup>
```

## 원본

- 저장소: https://github.com/Team-pingping/pingping-FE
- 참조 revision: `3402a80a6d2d2d41518dd08b18d7d0cb06429bfe`
- README의 GUI 이미지: https://github.com/user-attachments/assets/3c74868c-a653-4114-a34a-29dd17200bdb
- `fe/src/app/event-maps/[id]/components/MapComponent.tsx`: 선택 핀 35×40, 기본 핀 28×32, 선택 해제
- `BottomDrawer.tsx`, `RecommendInActive.tsx`, `StoreItem.tsx`, `PingInformation.tsx`: 어두운 시트, 참여자 필터, 장소 목록·상세
- `fe/public/pin/level1.svg`~`level4.svg`, `fe/public/profile/level1.svg`~`level4.svg`: 원본 에셋을 파일명만 바꿔 복사
- `fe/tailwind.config.ts`: 앱 내부 색상 기준. 외부 블로그의 기존 디자인은 변경하지 않음

## 재현 범위

원본 화면 디자인을 참고한 로컬 React 데모이며 원본 앱 자체를 실행하지 않습니다. 네이버 지도 SDK, 실시간 타일, 서버 요청, 로그인, 실제 위치 정보는 사용하지 않습니다. 지도는 직접 그린 예시 지도입니다. 장소명 일부는 README 화면을 참고했으며, 좌표·참여자·상세 설명은 예시 데이터입니다. 상세 버튼도 외부 서비스 대신 데모 내부 예시 화면으로 연결합니다.

핀 선택·복원·해제, 참여자별 필터, 시트 드래그·근접 정지·키보드 조작, 목록 스크롤을 체험할 수 있습니다. 드래그는 손잡이에만 연결했습니다. 원본의 전체 시트 드래그와 구분한 데모용 조정입니다.
