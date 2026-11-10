"use client";

import {
  Avatar,
  AvatarFallback,
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@hozui/react";
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
      <Menu>
        <MenuTrigger asChild>
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
        </MenuTrigger>
        <MenuContent align="end">
          <MenuItem
            icon={<LogOut aria-hidden="true" size={14} />}
            onSelect={() => {
              window.location.href = "/api/auth/signout";
            }}
          >
            Sign out
          </MenuItem>
        </MenuContent>
      </Menu>
    </header>
  );
}
