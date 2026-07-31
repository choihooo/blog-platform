import Link from "next/link";
import type { ReactNode } from "react";

type SiteShellProps = {
  children: ReactNode;
  siteName: string;
};

export function SiteShell({ children, siteName }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link className="text-lg font-semibold tracking-normal" href="/">
            {siteName}
          </Link>
          <nav aria-label="주요 메뉴" className="flex items-center gap-5 text-sm font-medium">
            <Link className="text-foreground hover:text-primary" href="/#posts">
              글
            </Link>
            <Link className="text-muted-foreground hover:text-primary" href="/#categories">
              카테고리
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
