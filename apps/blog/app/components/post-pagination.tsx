import { Button } from "@hozui/react";

type PostPaginationProps = {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

export const POSTS_PER_PAGE = 9;

export function parsePageParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

export function paginateItems<T>(items: T[], page: number, pageSize = POSTS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    currentPage,
    totalCount: items.length,
    totalPages,
    items: items.slice(start, start + pageSize),
  };
}

export function PostPagination({ currentPage, totalPages, hrefForPage }: PostPaginationProps) {
  if (totalPages <= 1) return null;

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <nav
      aria-label="글 목록 페이지"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"
    >
      <p className="text-sm text-muted-foreground">
        {currentPage} / {totalPages} 페이지
      </p>
      <div className="flex items-center gap-2">
        {hasPreviousPage ? (
          <a
            className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
            href={hrefForPage(currentPage - 1)}
          >
            이전
          </a>
        ) : (
          <Button disabled label="이전" variant="secondary" />
        )}
        {hasNextPage ? (
          <a
            className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
            href={hrefForPage(currentPage + 1)}
          >
            다음
          </a>
        ) : (
          <Button disabled label="다음" variant="secondary" />
        )}
      </div>
    </nav>
  );
}
