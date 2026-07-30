export type ShellNavigationItem = {
  id: "posts" | "settings";
  label: "Posts" | "Settings";
  href: "/posts" | "/settings";
  state: "active" | "available" | "disabled";
};

export function getShellNavigation(pathname: string): ShellNavigationItem[] {
  return [
    {
      id: "posts",
      label: "Posts",
      href: "/posts",
      state: pathname.startsWith("/posts") ? "active" : "available",
    },
    {
      id: "settings",
      label: "Settings",
      href: "/settings",
      state: pathname.startsWith("/settings") ? "active" : "available",
    },
  ];
}
