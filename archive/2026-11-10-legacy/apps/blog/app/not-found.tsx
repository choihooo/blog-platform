import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 place-items-center px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid justify-items-center gap-4 text-center">
        <p className="text-sm font-semibold tracking-widest text-primary">404</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          주소가 변경되었거나 삭제되었을 수 있어요. 아래에서 계속 둘러볼 수 있습니다.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <Link
            className="inline-flex items-center border border-border px-4 py-2 text-sm font-semibold text-foreground no-underline transition-colors hover:border-primary hover:text-primary hover:no-underline"
            href="/"
          >
            홈으로
          </Link>
          <Link
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-primary no-underline hover:no-underline"
            href="/blog"
          >
            블로그 글 목록 보기
          </Link>
        </div>
      </div>
    </main>
  );
}
