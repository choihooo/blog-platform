import { Skeleton } from "@hozui/react";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="mt-10 h-12 w-full max-w-2xl" />
      <Skeleton className="mt-5 h-24 w-full max-w-3xl" />
      <div className="mt-12 grid gap-6 border-t border-border pt-10 sm:grid-cols-2">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </main>
  );
}
