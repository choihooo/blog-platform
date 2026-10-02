import type { ProjectCaseStudy } from "../project-types";

export const stillProject = {
  slug: "still",
  index: "10",
  name: "STILL",
  format: "showcase",
  meta: "오디오 브랜드 웹사이트 · Web Publishing",
  description:
    "헤드폰과 두 종류의 이어폰을 하나의 시각적 언어로 묶은 웹 퍼블리싱 작업입니다. 제품의 형태가 돋보이는 이미지 배치와 타이포그래피로 차분한 브랜드 분위기를 표현했습니다.",
  role: "웹 퍼블리싱",
  organization: "Web Publishing",
  technologies: [],
  metrics: [],
  evidence: [
    { type: "deployment", label: "사이트 바로 보기", href: "https://still.hozorica.com/" },
  ],
  sections: [
    {
      id: "visual",
      eyebrow: "STILL / AUDIO",
      title: "세 가지 소리, 하나의 디자인 언어",
      blocks: [
        {
          type: "image",
          src: "/projects/still/desktop.jpg",
          alt: "어두운 배경 위에 실버 헤드폰과 두 종류의 이어폰을 배치한 STILL 메인 화면",
          caption: "제품 3종의 형태와 큰 타이포그래피가 함께 보이는 데스크톱 첫 화면.",
          width: 1440,
          height: 900,
          layout: "full",
        },
        {
          type: "text",
          body: "STILL은 헤드폰, 무선 이어폰, 유선 이어폰을 소개하는 오디오 브랜드 웹사이트입니다. 첫 화면에서 세 제품을 함께 보여주고, 컬렉션과 라이프스타일 장면으로 이어지는 흐름을 웹 화면으로 구현했습니다.",
        },
      ],
    },
    {
      id: "details",
      eyebrow: "PUBLISHING DETAILS",
      title: "제품이 중심이 되는 화면 구성",
      blocks: [
        {
          type: "columns",
          layout: "full",
          items: [
            {
              title: "제품 이미지의 위계",
              body: "크기가 다른 세 제품을 한 화면에 배치하고, 헤드폰을 중심으로 이어폰의 형태까지 함께 읽히도록 구성했습니다.",
            },
            {
              title: "일관된 컬렉션",
              body: "제품명, 종류, 짧은 소개를 같은 순서로 배치해 서로 다른 제품을 하나의 컬렉션으로 보여줍니다.",
            },
            {
              title: "타이포그래피와 여백",
              body: "큰 영문 헤드라인과 짧은 한글 설명을 구분하고, 어두운 바탕과 여백으로 제품의 실루엣을 강조했습니다.",
            },
          ],
        },
        {
          type: "image",
          src: "/projects/still/collection.jpg",
          alt: "STILL 헤드폰과 무선·유선 이어폰을 같은 형식으로 소개하는 컬렉션 화면",
          caption: "제품마다 같은 정보 위계를 적용한 컬렉션.",
          width: 1440,
          height: 900,
          layout: "full",
        },
      ],
    },
    {
      id: "mobile",
      eyebrow: "MOBILE VIEW",
      title: "작은 화면에서 이어지는 제품 경험",
      blocks: [
        {
          type: "image",
          src: "/projects/still/mobile.jpg",
          alt: "390px 너비에서 본 STILL 모바일 첫 화면",
          caption: "390 × 844 화면에서 촬영한 모바일 뷰.",
          width: 390,
          height: 844,
          layout: "portrait",
        },
      ],
    },
  ],
} satisfies ProjectCaseStudy;
