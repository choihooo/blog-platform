import { FileText, Settings } from "lucide-react";
import Link from "next/link";

import type { ShellNavigationItem } from "./navigation";

type SidebarProps = {
  items: ShellNavigationItem[];
};

export function Sidebar({ items }: SidebarProps) {
  const icons = {
    posts: FileText,
    settings: Settings,
  };

  return (
    <aside className="w-full border-b bg-background px-4 py-3 sm:min-h-screen sm:w-56 sm:border-b-0 sm:border-r">
      <div className="mb-4 text-sm font-semibold">CMS</div>
      <nav className="flex gap-2 sm:flex-col" aria-label="CMS navigation">
        {items.map((item) => {
          const Icon = icons[item.id];
          return (
            <Link
              aria-current={item.state === "active" ? "page" : undefined}
              className={
                item.state === "active"
                  ? "inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
                  : "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }
              href={item.href}
              key={item.id}
            >
              <Icon aria-hidden="true" size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
