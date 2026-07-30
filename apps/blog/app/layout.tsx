import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import type { ReactNode } from "react";
import { Separator } from "@blog-platform/design-system";

import { getSiteConfig } from "../lib/content-source";
import { analyticsInit } from "../lib/analytics";
import { AnalyticsProvider } from "./components/analytics-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ho's Blog",
    template: "%s | Ho's Blog",
  },
  description: "파일 기반 MDX 기술 블로그",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const analytics = analyticsInit(await getSiteConfig());
  return (
    <html lang="ko">
      <body>
        {analytics.ok ? (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `window.__BLOG_ANALYTICS__=${JSON.stringify(analytics)};`,
              }}
            />
            {analytics.provider === "ga4" ? (
              <>
                <Script
                  src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
                    analytics.measurementId,
                  )}`}
                  strategy="afterInteractive"
                />
                <Script id="blog-ga4" strategy="afterInteractive">
                  {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){window.dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', ${JSON.stringify(analytics.measurementId)});
                  `}
                </Script>
              </>
            ) : null}
            {analytics.provider === "gtm" ? (
              <Script id="blog-gtm" strategy="afterInteractive">
                {`
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer',${JSON.stringify(analytics.containerId)});
                `}
              </Script>
            ) : null}
          </>
        ) : null}
        <div className="min-h-screen bg-background">
          <header className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-14">
            <Link className="font-semibold no-underline" href="/">
              Ho's Blog
            </Link>
            <nav
              className="flex flex-wrap gap-4 text-sm text-muted-foreground"
              aria-label="Primary navigation"
            >
              <Link href="/">Posts</Link>
              <Link href="/categories/engineering">Engineering</Link>
              <Link href="/tags/mdx">MDX</Link>
            </nav>
          </header>
          <Separator />
          <AnalyticsProvider>{children}</AnalyticsProvider>
          <Separator />
          <footer className="px-5 py-4 text-sm text-muted-foreground sm:px-14">
            Repository-backed MDX blog
          </footer>
        </div>
      </body>
    </html>
  );
}
