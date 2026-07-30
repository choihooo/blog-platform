import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@blog-platform/design-system";
import { LogOut, UserCircle } from "lucide-react";

import type { CmsSession } from "../../lib/auth/index";

type TopBarProps = {
  session: CmsSession;
  title: string;
};

export function TopBar({ session, title }: TopBarProps) {
  return (
    <header className="cms-topbar">
      <div>
        <p className="cms-eyebrow">Workspace</p>
        <h1>{title}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Account menu" className="cms-account" variant="ghost">
            <UserCircle aria-hidden="true" size={18} />
            <span>{session.displayName ?? session.githubLogin}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a className="flex items-center gap-2" href="/api/auth/signout">
              <LogOut aria-hidden="true" size={14} />
              Sign out
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
