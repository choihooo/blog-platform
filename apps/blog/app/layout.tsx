import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";

import { getSiteConfig } from "../lib/content-source";
import { analyticsInit } from "../lib/analytics";
import { AnalyticsProvider } from "./components/analytics-provider";
import { SiteShell } from "./components/site-shell";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return {
    metadataBase: new URL(site.siteUrl),
    title: {
      default: site.siteName,
      template: `%s | ${site.siteName}`,
    },
    description: site.description,
    alternates: {
      canonical: site.siteUrl,
      types: { "application/rss+xml": `${site.siteUrl.replace(/\/+$/, "")}/rss.xml` },
    },
    icons: {
      icon: "/icon.png",
      apple: "/apple-icon.png",
    },
    openGraph: {
      title: site.siteName,
      description: site.description,
      url: site.siteUrl,
      siteName: site.siteName,
      images: [{ url: "/brand/hozorica-card.webp", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: site.siteName,
      description: site.description,
      images: ["/brand/hozorica-card.webp"],
    },
  };
}

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const site = await getSiteConfig();
  const analytics = analyticsInit(site);
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
        <AnalyticsProvider>
          <SiteShell siteName={site.siteName}>{children}</SiteShell>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
