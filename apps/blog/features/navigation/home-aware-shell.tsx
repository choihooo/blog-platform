"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Keep the existing server-rendered header on content pages, but let the room
// occupy the entire home viewport. Re-evaluate on client-side navigation.
export function HomeAwareShell({ children, header }: { children: ReactNode; header: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/experiments/scroll-story";

  return (
    <div className="min-h-screen bg-background">
      {!isHome && header}
      {children}
    </div>
  );
}
