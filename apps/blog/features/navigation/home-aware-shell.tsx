"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MainHeader } from "./main-header";

// Home, desktop and rounded blog pages own their header placement. Other portfolio
// pages share MainHeader; legacy archives retain search and category navigation.
export function HomeAwareShell({ children, header }: { children: ReactNode; header: ReactNode }) {
  const pathname = usePathname();
  const isBlogArticle =
    /^\/blog\/[^/]+\/?$/.test(pathname) &&
    !["search", "tags", "categories", "page", "rss.xml"].includes(pathname.split("/")[2] ?? "");
  const isHome =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/blog" ||
    isBlogArticle ||
    pathname.startsWith("/posts/") ||
    pathname === "/projects";

  return (
    <div className="min-h-screen bg-background">
      {!isHome &&
        (pathname === "/projects" || /^\/projects\/[^/]+\/?$/.test(pathname) ? (
          <MainHeader active="work" />
        ) : (
          header
        ))}
      {children}
    </div>
  );
}
