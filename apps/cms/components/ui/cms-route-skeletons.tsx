import { Skeleton } from "@hozui/react";

export function CmsTablePageSkeleton({ titleWidth = 140 }: { titleWidth?: number }) {
  return (
    <main className="cms-main">
      <section className="space-y-7">
        <div className="flex items-center justify-between gap-4">
          <div className="grid gap-2">
            <Skeleton height={18} width={120} />
            <Skeleton height={38} width={titleWidth} />
            <Skeleton height={18} width={240} />
          </div>
          <Skeleton height={40} variant="rect" width={112} />
        </div>
        <div className="flex max-w-3xl gap-2">
          <Skeleton height={40} variant="rect" width={280} />
          <Skeleton height={40} variant="rect" width={120} />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="grid gap-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                className="grid grid-cols-[minmax(0,1fr)_7rem_7rem_7rem] items-center gap-4"
                key={index}
              >
                <Skeleton height={22} width={index % 3 === 0 ? "80%" : "62%"} />
                <Skeleton height={22} width="100%" />
                <Skeleton height={22} width="100%" />
                <Skeleton height={22} width="72%" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function CmsSettingsSkeleton() {
  return (
    <main className="cms-main">
      <div className="max-w-5xl space-y-9">
        <section>
          <Skeleton height={18} width={120} />
          <Skeleton className="mt-2" height={38} width={180} />
          <Skeleton className="mt-4" height={18} width="56%" />
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="rounded-lg border border-border bg-card p-5" key={index}>
              <Skeleton height={20} width={140} />
              <Skeleton className="mt-5" height={24} width={index % 2 === 0 ? "70%" : "54%"} />
              <Skeleton className="mt-2" height={16} width="64%" />
            </div>
          ))}
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
            <Skeleton height={20} width={128} />
            <div className="mt-5 grid gap-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton height={48} key={index} width="100%" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
