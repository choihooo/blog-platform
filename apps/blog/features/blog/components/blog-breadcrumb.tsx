"use client";

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@hozui/react";

type BreadcrumbEntry = {
  href?: string;
  label: string;
};

export function BlogBreadcrumb({
  entries,
  label,
  replace = false,
}: {
  entries: BreadcrumbEntry[];
  label: string;
  replace?: boolean;
}) {
  return (
    <Breadcrumb aria-label={label} className="mb-6" size="sm">
      <BreadcrumbList>
        {entries.map((entry, index) => (
          <BreadcrumbItem key={`${entry.href ?? "current"}:${entry.label}`}>
            {index > 0 ? <BreadcrumbSeparator /> : null}
            {entry.href ? (
              <Link className="hods-breadcrumb__link" href={entry.href} replace={replace}>
                {entry.label}
              </Link>
            ) : (
              <BreadcrumbPage>{entry.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
