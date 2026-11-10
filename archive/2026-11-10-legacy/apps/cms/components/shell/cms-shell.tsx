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
    <div className="cms-shell">
      <Sidebar items={getShellNavigation(activePath)} />
      <div className="cms-workspace">
        <TopBar session={session} title={title} />
        <main className="cms-main" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
