import type { ProjectCaseStudy } from "../project-types.js";

export const afterimageProject = {
  slug: "afterimage",
  index: "11",
  name: "AFTERIMAGE",
  format: "showcase",
  meta: "아이웨어 브랜드 웹사이트 · Web Publishing",
  description:
    "캠페인 비주얼과 인터랙션을 결합한 아이웨어 웹 퍼블리싱 작업입니다. 스크롤에 따른 연출과 프레임 컬러 선택으로 브랜드와 제품을 탐색하는 경험을 구성했습니다.",
  role: "웹 퍼블리싱 · 인터랙션 구현",
  organization: "Web Publishing",
  technologies: [],
  metrics: [],
  evidence: [
    { type: "deployment", label: "사이트 바로 보기", href: "https://afterimage.hozorica.com/" },
  ],
  sections: [
    {
      id: "experience",
      eyebrow: "AFTERIMAGE / EYEWEAR",
      title: "스크롤에서 컬러 선택까지",
      blocks: [
        {
          type: "video",
          mp4Src: "/projects/afterimage/interaction.mp4",
          poster: "/projects/afterimage/desktop.jpg",
          ariaLabel:
            "AFTERIMAGE의 스크롤 연출과 블랙·실버·코발트 프레임 선택 시 화면 변화를 보여주는 영상",
          caption: "실제 사이트의 스크롤과 프레임 컬러 선택 장면 · 약 1.4배속.",
          width: 1440,
          height: 900,
          layout: "full",
        },
        {
          type: "text",
          body: "AFTERIMAGE는 아이웨어의 형태와 시선을 주제로 한 브랜드 웹사이트입니다. 흑백 캠페인 이미지와 큰 타이포그래피로 시작해, 스크롤과 컬러 선택을 통해 제품의 다른 표정을 보여줍니다.",
        },
      ],
    },
    {
      id: "details",
      eyebrow: "PUBLISHING DETAILS",
      title: "사용자의 조작에 반응하는 제품 소개",
      blocks: [
        {
          type: "columns",
          layout: "full",
          items: [
            {
              title: "스크롤 연출",
              body: "첫 화면의 모델 장면이 스크롤에 따라 달라지며, 캠페인 비주얼에서 제품 소개로 시선을 이어줍니다.",
            },
            {
              title: "컬러에 연결된 콘텐츠",
              body: "블랙·실버·코발트를 선택하면 프레임 이미지와 컬러 이름, 소개 문구가 함께 바뀝니다.",
            },
            {
              title: "캠페인의 시각적 위계",
              body: "화면을 채우는 이미지와 큰 제목, 짧은 설명을 조합해 브랜드 인상과 제품 정보를 순서대로 전달합니다.",
            },
          ],
        },
        {
          type: "image",
          src: "/projects/afterimage/silver.jpg",
          alt: "실버 프레임을 선택해 제품 이미지와 이름이 Liquid silver로 바뀐 AFTERIMAGE 화면",
          caption: "실버 선택 상태. 제품 이미지, 컬러 이름과 설명이 함께 전환됩니다.",
          width: 1440,
          height: 900,
          layout: "full",
        },
      ],
    },
    {
      id: "mobile",
      eyebrow: "MOBILE VIEW",
      title: "모바일에서도 이어지는 캠페인",
      blocks: [
        {
          type: "image",
          src: "/projects/afterimage/mobile.jpg",
          alt: "390px 너비에서 본 AFTERIMAGE 모바일 캠페인 첫 화면",
          caption: "390 × 844 화면에서 촬영한 모바일 뷰.",
          width: 390,
          height: 844,
          layout: "portrait",
        },
      ],
    },
  ],
} satisfies ProjectCaseStudy;
