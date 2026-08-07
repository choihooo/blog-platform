import { Skeleton } from "@hozui/react";

export function BlogListingSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
      <h1 className="sr-only">블로그 목록 로딩 중</h1>
      <div className="grid gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <aside aria-label="카테고리 로딩 중" className="lg:pt-11">
          <Skeleton height={24} width={88} />
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton height={18} key={index} width={index % 2 === 0 ? "80%" : "62%"} />
            ))}
          </div>
        </aside>
        <section aria-label="글 목록 로딩 중" className="min-w-0 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <Skeleton height={20} width={160} />
            <div className="flex gap-2">
              <Skeleton height={40} variant="rect" width={40} />
              <Skeleton height={40} variant="rect" width={40} />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <article className="overflow-hidden bg-card shadow-sm" key={index}>
                <Skeleton className="aspect-[1.91/1] w-full" variant="rect" />
                <div className="grid gap-4 p-5">
                  <Skeleton height={18} width="56%" />
                  <Skeleton height={30} width="88%" />
                  <Skeleton height={18} width="100%" />
                  <Skeleton height={18} width="72%" />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export function BlogPostSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-12">
      <h1 className="sr-only">글 로딩 중</h1>
      <div className="mb-6 flex gap-2">
        <Skeleton height={18} width={56} />
        <Skeleton height={18} width={120} />
        <Skeleton height={18} width={180} />
      </div>
      <article className="grid gap-12 lg:grid-cols-[minmax(0,68ch)_220px] lg:justify-center lg:gap-16">
        <div className="min-w-0">
          <header className="mb-12 grid gap-5 bg-card pb-10">
            <Skeleton className="aspect-[16/9] w-full" variant="rect" />
            <Skeleton height={52} width="90%" />
            <Skeleton height={20} width="62%" />
            <div className="flex gap-2">
              <Skeleton height={24} width={64} />
              <Skeleton height={24} width={76} />
              <Skeleton height={24} width={84} />
            </div>
          </header>
          <div className="grid gap-4">
            {Array.from({ length: 10 }, (_, index) => (
              <Skeleton
                height={index % 4 === 0 ? 30 : 20}
                key={index}
                width={index % 3 === 0 ? "72%" : "100%"}
              />
            ))}
          </div>
        </div>
        <aside aria-label="목차 로딩 중" className="hidden h-fit bg-card p-4 shadow-sm lg:block">
          <Skeleton height={20} width={104} />
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton height={16} key={index} width={index % 2 === 0 ? "90%" : "70%"} />
            ))}
          </div>
        </aside>
      </article>
    </main>
  );
}
