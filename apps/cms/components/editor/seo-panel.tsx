"use client";

import type { SeoReport } from "@blog-platform/seo-engine";
import type { ExternalConsoleLinks } from "@blog-platform/analytics";
import { Badge, Card, CardContent } from "@blog-platform/design-system";

type Props = {
  report: SeoReport;
  links?: ExternalConsoleLinks;
};

export function SeoPanel({ report, links }: Props) {
  const tone = report.status === "pass" ? "default" : "secondary";
  return (
    <Card className="m-4">
      <CardContent className="space-y-4 p-4 text-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">SEO</h3>
          <Badge variant={tone}>{report.score}/100</Badge>
        </div>
        <section className="space-y-2 rounded-md border border-border/60 bg-muted/25 p-3">
          <h4 className="text-xs font-semibold tracking-wide text-foreground">Issues</h4>
          {[...report.blockingIssues, ...report.warnings].length === 0 ? (
            <p className="text-sm text-emerald-600">All checks passed.</p>
          ) : (
            <ul className="list-disc space-y-1.5 pl-5 text-sm">
              {[...report.blockingIssues, ...report.warnings].map((issue) => (
                <li key={issue.code} className="leading-relaxed">
                  {issue.message}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="space-y-2 rounded-md border border-border/60 bg-muted/25 p-3">
          <h4 className="text-xs font-semibold tracking-wide text-foreground">Search Preview</h4>
          <p className="text-sm font-medium">{report.searchPreview.title}</p>
          <p className="break-all text-sm text-muted-foreground">{report.searchPreview.url}</p>
          <p className="text-sm leading-relaxed">{report.searchPreview.description}</p>
        </section>
        <section className="space-y-2 rounded-md border border-border/60 bg-muted/25 p-3">
          <h4 className="text-xs font-semibold tracking-wide text-foreground">Analytics Links</h4>
          <div className="space-y-1.5 text-sm">
            {links?.publicPostUrl ? (
              <a href={links.publicPostUrl} className="block text-blue-600 underline-offset-4 hover:underline">
                Open public post
              </a>
            ) : null}
            {links?.ga4Url ? (
              <a
                href={links.ga4Url}
                className="block text-blue-600 underline-offset-4 hover:underline"
              >
                Open GA4
              </a>
            ) : null}
            {links?.searchConsoleUrl ? (
              <a
                href={links.searchConsoleUrl}
                className="block text-blue-600 underline-offset-4 hover:underline"
              >
                Open Search Console
              </a>
            ) : null}
            {links?.disabledReasons?.map((reason) => (
              <p className="text-sm text-muted-foreground" key={reason}>
                {reason}
              </p>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
