import type { Metadata } from "next";

import { DesktopPortfolio } from "@/features/projects/desktop/desktop-portfolio";
import "@/features/projects/desktop/desktop-portfolio.css";

export const metadata: Metadata = {
  title: "Projects",
  description: "최호가 진행한 프로젝트와 문제 해결 과정을 소개합니다.",
  alternates: { canonical: "/projects" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <DesktopPortfolio />;
}
