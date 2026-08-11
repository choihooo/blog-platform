"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@hozui/react";

type BreadcrumbEntry = {
  href?: string;
  label: string;
};

export function BlogBreadcrumb({ entries, label }: { entries: BreadcrumbEntry[]; label: string }) {
  return (
    <Breadcrumb aria-label={label} className="mb-6" size="sm">
      <BreadcrumbList>
        {entries.map((entry, index) => (
          <BreadcrumbItem key={`${entry.href ?? "current"}:${entry.label}`}>
            {index > 0 ? <BreadcrumbSeparator /> : null}
            {entry.href ? (
              <BreadcrumbLink href={entry.href}>{entry.label}</BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{entry.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
