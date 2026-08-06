import { ChartNoAxesColumnIncreasing, FileText, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";

import type { ShellNavigationItem } from "./navigation";

type SidebarProps = {
  items: ShellNavigationItem[];
};

export function Sidebar({ items }: SidebarProps) {
  const icons = {
    dashboard: LayoutDashboard,
    posts: FileText,
    analytics: ChartNoAxesColumnIncreasing,
    settings: Settings,
  };

  return (
    <aside className="cms-sidebar">
      <a className="cms-brand" href="/">
        <span className="cms-brand-mark">H</span>
        <span>
          <strong>Hozorica</strong>
          <small>Content desk</small>
        </span>
      </a>
      <nav className="cms-navigation" aria-label="CMS navigation">
        {items.map((item) => {
          const Icon = icons[item.id];
          return (
            <Link
              aria-current={item.state === "active" ? "page" : undefined}
              className={
                item.state === "active" ? "cms-nav-item cms-nav-item-active" : "cms-nav-item"
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
