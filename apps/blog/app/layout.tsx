import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ho's Blog",
    template: "%s | Ho's Blog",
  },
  description: "파일 기반 MDX 기술 블로그",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link className="brand" href="/">
              Ho's Blog
            </Link>
            <nav className="nav" aria-label="Primary navigation">
              <Link href="/">Posts</Link>
              <Link href="/categories/engineering">Engineering</Link>
              <Link href="/tags/mdx">MDX</Link>
            </nav>
          </header>
          {children}
          <footer className="site-footer">Repository-backed MDX blog</footer>
        </div>
      </body>
    </html>
  );
}
