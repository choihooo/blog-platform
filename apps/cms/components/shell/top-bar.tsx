"use client";

import { Avatar, AvatarFallback, Button, Menu } from "@hozui/react";
import { LogOut } from "lucide-react";

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
      <Menu
        align="end"
        items={[
          {
            id: "sign-out",
            icon: <LogOut aria-hidden="true" size={14} />,
            label: "Sign out",
            onSelect: () => {
              window.location.href = "/api/auth/signout";
            },
          },
        ]}
        trigger={
          <Button
            aria-label="Account menu"
            className="cms-account"
            label={session.displayName ?? session.githubLogin}
            leadingIcon={
              <Avatar decorative size="xs">
                <AvatarFallback>
                  {(session.displayName ?? session.githubLogin).slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            }
            type="button"
            variant="ghost"
          />
        }
      />
    </header>
  );
}
