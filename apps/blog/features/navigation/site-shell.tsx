import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { DesktopNavigation } from "./desktop-navigation";
import { MobileNavigationMenu, type MobileNavigationCategory } from "./mobile-navigation-menu";
import { ThemeSwitch } from "./theme-switch";
import { HomeAwareShell } from "./home-aware-shell";

type SiteShellProps = {
  children: ReactNode;
  categories: MobileNavigationCategory[];
  siteName: string;
  headerSearch?: ReactNode;
};

export function SiteShell({ categories, children, siteName, headerSearch }: SiteShellProps) {
  return (
    <HomeAwareShell
      header={
        <header className="public-site-header border-b border-border bg-background print:hidden">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
            <Link
              className="flex items-center gap-2 text-lg font-semibold tracking-normal"
              href="/"
            >
              <Image
                alt=""
                className="h-8 w-8 rounded-md"
                height={32}
                priority
                src="/brand/hozorica-logo.webp"
                width={32}
              />
              {siteName}
            </Link>
            <div className="hidden items-center gap-4 xl:flex">
              {headerSearch}
              <DesktopNavigation />
              <ThemeSwitch />
            </div>
            <MobileNavigationMenu categories={categories} />
          </div>
        </header>
      }
    >
      {children}
    </HomeAwareShell>
  );
}
