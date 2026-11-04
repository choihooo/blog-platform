"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MainHeader } from "./main-header";

// Home and desktop own their header placement. Portfolio pages share MainHeader;
// other content pages retain search and category navigation. Re-evaluate on navigation.
export function HomeAwareShell({ children, header }: { children: ReactNode; header: ReactNode }) {
  const pathname = usePathname();
  const isHome =
    pathname === "/" ||
    pathname === "/experiments/pixel-room" ||
    pathname === "/experiments/interactive-portfolio";

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
