import type { Metadata } from "next";

import { PortfolioPreview } from "@/features/portfolio-preview/portfolio-preview";

export const metadata: Metadata = {
  title: "포트폴리오 C+D 레이아웃 프리뷰",
  description: "데이터 중심 구조와 강한 블루 브랜딩을 결합한 포트폴리오 프리뷰",
  robots: { index: false, follow: false },
};

export default function PortfolioPreviewPage() {
  return <PortfolioPreview />;
}
