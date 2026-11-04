import type { Metadata } from "next";

import { getSiteConfig } from "@/features/blog/server/content-source";
import { ScrollStoryHome } from "@/features/scroll-story/scroll-story-home";
import { personJsonLd, serializeJsonLd } from "@/shared/seo/person-json-ld";

export const metadata: Metadata = {
  title: "최호 | 프론트엔드 개발자",
  description: "프론트엔드 개발자 최호의 프로젝트, 글, 이력서를 한곳에 모았습니다.",
  alternates: { canonical: "/" },
};

export default async function PortfolioHomePage() {
  const site = await getSiteConfig();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(personJsonLd(site)) }}
        type="application/ld+json"
      />
      <ScrollStoryHome />
    </>
  );
}
