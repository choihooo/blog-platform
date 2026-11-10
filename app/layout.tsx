import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";
import { getSiteConfig } from "@/lib/site";
import { FooterLinks } from "@/components/FooterLinks";

const site = getSiteConfig();

const suit = localFont({
  src: "./fonts/suit/SUIT-Variable.woff2",
  weight: "100 900",
  variable: "--font-suit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: site.url,
  title: {
    default: "최호 | 프론트엔드 개발자",
    template: "%s — 최호",
  },
  description: "프론트엔드 개발자 최호의 블로그. 개발하며 마주친 문제와 배운 것들을 기록합니다.",
  alternates: { canonical: "/" },
  robots: { index: site.indexable, follow: site.indexable },
  openGraph: {
    type: "website", locale: "ko_KR", siteName: "최호", url: site.url,
    title: "최호 | 프론트엔드 개발자",
    description: "사용자에게는 호감 가는 경험을, 동료에게는 호흡이 잘 맞는 사람이 되고 싶습니다. AI에 호기심이 많습니다.",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "최호 | 프론트엔드 개발자" }],
  },
  twitter: { card: "summary_large_image", images: ["/opengraph-image.png"] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${suit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6">
          <SiteHeader />
          <main className="flex-1 pt-4 pb-24">{children}</main>
          <footer className="flex items-center justify-between border-t border-neutral-200 py-8 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <span>© {new Date().getFullYear()} 최호</span>
            <FooterLinks linkedinUrl="https://www.linkedin.com/in/howuchoi/" />
          </footer>
        </div>
      </body>
    </html>
  );
}
