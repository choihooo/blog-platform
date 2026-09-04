import type { Metadata } from "next";

import { getSiteConfig } from "@/features/blog/server/content-source";
import { ResumePage } from "@/features/resume/resume-page";
import { profilePageJsonLd, serializeJsonLd } from "@/shared/seo/person-json-ld";

export const metadata: Metadata = {
  title: "Resume",
  description: "프론트엔드 개발자 최호의 경력과 활동을 정리한 이력서입니다.",
  alternates: { canonical: "/resume" },
};

export default async function Page() {
  const site = await getSiteConfig();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(profilePageJsonLd(site)) }}
        type="application/ld+json"
      />
      <ResumePage />
    </>
  );
}
