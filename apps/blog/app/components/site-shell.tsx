import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { BlogHeaderSearchForm } from "./blog-search-form";
import { ThemeSwitch } from "./theme-switch";

type SiteShellProps = {
  children: ReactNode;
  siteName: string;
};

export function SiteShell({ children, siteName }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link className="flex items-center gap-2 text-lg font-semibold tracking-normal" href="/">
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
          <div className="flex items-center gap-4">
            <BlogHeaderSearchForm />
            <nav aria-label="주요 메뉴" className="flex items-center gap-5 text-sm font-medium">
              <Link className="text-foreground hover:text-primary" href="/#posts">
                글
              </Link>
              <Link className="text-muted-foreground hover:text-primary" href="/tags">
                태그
              </Link>
            </nav>
            <ThemeSwitch />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
