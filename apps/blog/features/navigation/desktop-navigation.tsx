"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/projects", label: "프로젝트" },
  { href: "/blog", label: "블로그" },
  { href: "/resume", label: "이력서" },
] as const;

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="주요 메뉴" className="flex items-center gap-5 text-sm font-medium">
      {navigationItems.map((item) => {
        const isCurrent = isCurrentPath(pathname, item.href);
        const className = `no-underline transition-colors hover:no-underline hover:text-primary ${
          isCurrent ? "text-foreground" : "text-muted-foreground"
        }`;

        return (
          item.href === "/projects" ? (
            <a
              aria-current={isCurrent ? "page" : undefined}
              className={className}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ) : (
            <Link
              aria-current={isCurrent ? "page" : undefined}
              className={className}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          )
        );
      })}
    </nav>
  );
}
