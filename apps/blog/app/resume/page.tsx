import type { Metadata } from "next";

import { ResumePage } from "@/features/resume/resume-page";

export const metadata: Metadata = {
  title: "Resume",
  description: "프론트엔드 개발자 최호의 경력과 활동을 정리한 이력서입니다.",
  alternates: { canonical: "/resume" },
};

export default function Page() {
  return <ResumePage />;
}
