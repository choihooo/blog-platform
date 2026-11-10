import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="blog-header">
      <nav aria-label="블로그 탐색">
        <Link href="/#writing">글</Link>
        <Link href="/#about">소개</Link>
        <a href="https://github.com/choihooo" target="_blank" rel="noopener noreferrer">
          GitHub
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M6 18 18 6M6 6h12v12" />
          </svg>
        </a>
      </nav>
    </header>
  );
}
