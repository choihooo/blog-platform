import type { ReactNode } from "react";

import type { CmsSession } from "../../lib/auth/index";
import { getShellNavigation } from "./navigation";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

type CmsShellProps = {
  activePath: string;
  children?: ReactNode;
  session: CmsSession;
  title: string;
};

export function CmsShell({ activePath, children, session, title }: CmsShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground sm:flex">
      <Sidebar items={getShellNavigation(activePath)} />
      <div className="min-w-0 flex-1">
        <TopBar session={session} title={title} />
        <main className="px-5 py-6">{children}</main>
      </div>
    </div>
  );
}
