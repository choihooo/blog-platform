import type { Metadata } from "next";
import { DesktopPortfolio } from "@/features/projects/desktop/desktop-portfolio";
import "@/features/projects/desktop/desktop-portfolio.css";

export const metadata: Metadata = {
  title: "호조리카 작업 바탕화면",
  robots: { index: false, follow: false },
  alternates: { canonical: "/projects" },
};
export default function Page() {
  return <DesktopPortfolio />;
}
