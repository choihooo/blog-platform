function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PostHeader({ title, date, demo = false }: { title: string; date: string; demo?: boolean }) {
  return (
    <header className="not-prose mb-12">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <time
        dateTime={date}
        className="mt-2 block text-sm text-neutral-500 dark:text-neutral-400"
      >
        {formatDate(date)}
      </time>
      {demo && (
        <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          화면 확인을 위한 예시 글입니다.
        </p>
      )}
    </header>
  );
}
