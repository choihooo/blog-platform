import Script from "next/script";
import { AnalyticsEvents } from "@/components/AnalyticsEvents";

export function Analytics() {
  // Keep local development and Vercel previews out of the production reports.
  if (process.env.VERCEL_ENV !== "production") return null;

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();

  return (
    <>
      {gaId && /^G-[A-Z0-9]+$/.test(gaId) && (
        <>
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
          </Script>
          <Script
            id="ga4-script"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <AnalyticsEvents measurementId={gaId} />
        </>
      )}
      {clarityId && /^[a-z0-9]+$/i.test(clarityId) && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${clarityId}");`}
        </Script>
      )}
    </>
  );
}
