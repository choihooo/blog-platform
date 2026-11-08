import type { Metadata } from "next";

import { AboutStory } from "@/features/about/about-story";
import { getSiteConfig } from "@/features/blog/server/content-source";
import { profile } from "@blog-platform/core/content/catalog";
import { profilePageJsonLd, serializeJsonLd } from "@/shared/seo/person-json-ld";

const description =
  "프론트엔드 개발자 최호, 호조리카의 이야기. 만드는 일부터 축구, 스터디와 사진까지 소개합니다.";

export const metadata: Metadata = {
  title: "About · 호조리카의 이야기",
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "호조리카의 이야기",
    description,
    url: "/about",
    type: "profile",
    images: [{ url: "/brand/about/story-poster.webp", width: 832, height: 468 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "호조리카의 이야기",
    description,
    images: ["/brand/about/story-poster.webp"],
  },
};

export default async function Page() {
  const site = await getSiteConfig();
  const identity = { ...profilePageJsonLd(site), url: new URL("/about", site.siteUrl).toString() };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(identity) }}
      />
      <AboutStory contact={{ email: profile.email, githubUrl: profile.githubUrl }} />
    </>
  );
}
