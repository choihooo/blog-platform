import type { Metadata } from "next";

import { ProjectsPage } from "@/features/projects/projects-page";

export const metadata: Metadata = {
  title: "Projects",
  description: "최호가 진행한 프로젝트와 문제 해결 과정을 소개합니다.",
  alternates: { canonical: "/projects" },
};

export default function Page() {
  return <ProjectsPage />;
}
