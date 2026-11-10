import type { Metadata } from "next";

import { PortfolioPrintDocument } from "@/features/portfolio-print/portfolio-print-document";

export const metadata: Metadata = {
  title: "최호 프론트엔드 포트폴리오 샘플",
  description: "Hozui 컴포넌트로 구성한 A4 포트폴리오 표지와 프로젝트 샘플",
  robots: { index: false, follow: false },
};

export default function PortfolioPrintPage() {
  return <PortfolioPrintDocument />;
}
