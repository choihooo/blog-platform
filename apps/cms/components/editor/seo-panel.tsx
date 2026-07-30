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
        <section className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Issues</h4>
          {[...report.blockingIssues, ...report.warnings].length === 0 ? (
            <p>All checks passed.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-4">
              {[...report.blockingIssues, ...report.warnings].map((issue) => (
                <li key={issue.code}>{issue.message}</li>
              ))}
            </ul>
          )}
        </section>
        <section className="space-y-1">
          <h4 className="text-xs font-medium text-muted-foreground">Search Preview</h4>
          <p className="font-medium">{report.searchPreview.title}</p>
          <p className="break-all text-muted-foreground">{report.searchPreview.url}</p>
          <p>{report.searchPreview.description}</p>
        </section>
        <section className="space-y-1">
          <h4 className="text-xs font-medium text-muted-foreground">Analytics Links</h4>
          {links?.publicPostUrl ? <a href={links.publicPostUrl}>Open public post</a> : null}
          {links?.ga4Url ? (
            <a className="block" href={links.ga4Url}>
              Open GA4
            </a>
          ) : null}
          {links?.searchConsoleUrl ? (
            <a className="block" href={links.searchConsoleUrl}>
              Open Search Console
            </a>
          ) : null}
          {links?.disabledReasons?.map((reason) => (
            <p className="text-muted-foreground" key={reason}>
              {reason}
            </p>
          ))}
        </section>
      </CardContent>
    </Card>
  );
}
