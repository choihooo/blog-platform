import type { Metadata } from "next";

import { HomeExperience } from "@/features/home/home-experience";

export const metadata: Metadata = {
  title: "최호 | 프론트엔드 개발자",
  description: "프론트엔드 개발자 최호의 프로젝트, 글, 이력서를 한곳에 모았습니다.",
  alternates: { canonical: "/" },
};

export default function PortfolioHomePage() {
  return <HomeExperience />;
}
