import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const suit = localFont({
  src: "./fonts/suit/SUIT-Variable.woff2",
  weight: "100 900",
  variable: "--font-suit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "최호 | 프론트엔드 개발자",
    template: "%s — 최호",
  },
  description: "프론트엔드 개발자 최호의 블로그. 개발하며 마주친 문제와 배운 것들을 기록합니다.",
  robots: { index: false, follow: false },
};

function GitHubIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11.02 11.02 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${suit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6">
          <SiteHeader />
          <main className="flex-1 pt-4 pb-24">{children}</main>
          <footer className="flex items-center justify-between border-t border-neutral-200 py-8 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <span>© {new Date().getFullYear()} 최호</span>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/choihooo"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="transition-colors hover:text-foreground"
              >
                <GitHubIcon />
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
