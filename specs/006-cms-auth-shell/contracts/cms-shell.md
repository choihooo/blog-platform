# Contract: CMS Shell

## Purpose

인증된 관리자가 CMS에 들어왔을 때 제공되는 기본 작업 표면과 navigation contract다. 이 contract는
editor, media upload, publish workflow 구현을 포함하지 않는다.

## Routes

| Route       | Access     | Purpose                              |
| ----------- | ---------- | ------------------------------------ |
| `/login`    | Public     | GitHub 로그인 시작과 인증 상태 안내  |
| `/`         | Admin only | CMS shell 기본 화면                  |
| `/posts`    | Admin only | 글 관리 영역의 시작점 또는 준비 상태 |
| `/settings` | Admin only | 설정 영역의 시작점 또는 준비 상태    |

## Shell Regions

```ts
type CmsShell = {
  sidebar: ShellNavigationItem[];
  topBar: {
    title: string;
    currentUser: {
      githubLogin: string;
      displayName?: string;
      avatarUrl?: string;
    };
    accountMenu: Array<"sign-out">;
  };
  contentState: "ready" | "empty" | "coming-soon" | "access-denied" | "misconfigured";
};
```

## Navigation Items

```ts
type ShellNavigationItem = {
  id: "posts" | "settings";
  label: "Posts" | "Settings";
  href: "/posts" | "/settings";
  state: "active" | "available" | "disabled";
};
```

Required behavior:

- Sidebar is visible on protected shell routes for authorized admins.
- Top bar shows current user identity and account menu.
- Active navigation state follows the current route.
- Posts and Settings routes may show readiness or placeholder content for this phase, but must not
  expose editor, media upload, or publish actions as usable features.
- Login route must not render protected shell navigation for anonymous or forbidden users.

## Visual Constraints

- Use design-system components for buttons, badges, dropdowns, tabs, dialogs, inputs, and forms when
  those primitives are needed.
- Use lucide-react icons for navigation and account actions when an icon is useful.
- Use default shadcn-compatible neutral, background, foreground, border, muted, accent, destructive,
  and ring tokens only.
- Do not introduce custom hex color palettes in this feature.
- Do not place cards inside cards; shell layout should be a work-focused app surface.

## Empty and Error States

| State           | Required content                                     | Forbidden content                         |
| --------------- | ---------------------------------------------------- | ----------------------------------------- |
| `coming-soon`   | Short readiness state for later editor/settings work | Fake editor, fake publish, fake upload    |
| `access-denied` | Account mismatch or permission status                | Draft body, config secrets, repo token    |
| `misconfigured` | Missing admin config field names and next action     | Protected content or credential values    |
| `empty`         | No items available for the selected shell area       | Broken navigation or blank protected page |

## Validation Scenarios

- Authorized admin lands on `/` and sees sidebar, top bar, account state, and shell content.
- Selecting Posts marks Posts active and shows the posts area readiness state.
- Selecting Settings marks Settings active and shows the settings area readiness state.
- Anonymous users visiting protected routes are sent to login.
- Non-admin users never see sidebar content or protected route details.
