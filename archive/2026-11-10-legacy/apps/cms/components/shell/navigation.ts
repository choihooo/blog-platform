export type ShellNavigationItem = {
  id: "dashboard" | "posts" | "analytics" | "settings";
  label: "Dashboard" | "Posts" | "Analytics" | "Settings";
  href: "/" | "/posts" | "/analytics" | "/settings";
  state: "active" | "available" | "disabled";
};

export function getShellNavigation(pathname: string): ShellNavigationItem[] {
  return [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/",
      state: pathname === "/" ? "active" : "available",
    },
    {
      id: "posts",
      label: "Posts",
      href: "/posts",
      state: pathname.startsWith("/posts") ? "active" : "available",
    },
    {
      id: "analytics",
      label: "Analytics",
      href: "/analytics",
      state: pathname.startsWith("/analytics") ? "active" : "available",
    },
    {
      id: "settings",
      label: "Settings",
      href: "/settings",
      state: pathname.startsWith("/settings") ? "active" : "available",
    },
  ];
}
