import type { ProjectCaseStudy } from "../project-types";

export const geobugirinProject = {
  slug: "geobugirin",
  index: "09",
  name: "거부기린",
  meta: "데스크톱 앱 · 2026",
  description: "웹캠 기반 자세 측정과 상태별 피드백을 제공하는 Tauri 데스크톱 앱입니다.",
  role: "Frontend Engineer",
  period: "2026.04 ~ 현재",
  organization: "Side Project",
  technologies: ["React", "Tauri", "Turborepo", "Webcam", "Pose", "R2"],
  metrics: [],
  stories: [
    {
      eyebrow: "Platform 01",
      title: "실제 배포 가능한 데스크톱 릴리스 구조 만들기",
      problem:
        "컴퓨터비전 기능을 구현하는 것과 별개로 signing, notarization, updater artifact와 배포 경로를 일관되게 관리할 기준이 필요했습니다.",
      approach:
        "React/Tauri 앱, 랜딩, admin, 디자인 시스템을 pnpm/Turborepo monorepo로 분리하고 R2 upload와 sidecar를 포함한 릴리스 체크리스트를 정리했습니다.",
      result:
        "빌드 산출물과 업데이트 경로를 명시해 반복 가능한 데스크톱 릴리스 기반을 만들었습니다.",
    },
    {
      eyebrow: "Engine 02",
      title: "웹캠과 자세 측정 엔진의 상태를 분리하기",
      problem:
        "카메라 연결, 모델 초기화, 프레임 추론과 점수 계산이 한 흐름에 섞이면 오류 원인과 사용자 상태를 구분하기 어려웠습니다.",
      approach:
        "camera stream, model initialization, frame loop, scoring 상태를 분리하고 목, 어깨, 상체 landmark 기준 posture score를 구성했습니다.",
      result:
        "loading, camera unavailable, detecting, warning, normal 상태마다 명확한 피드백을 제공할 수 있게 됐습니다.",
    },
  ],
} satisfies ProjectCaseStudy;
