import {
  Pagination,
  PaginationControl,
  PaginationItem,
  PaginationList,
  PaginationStatus,
} from "@hozui/react";

type PostPaginationProps = {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

export const POSTS_PER_PAGE = 8;

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

function paginationTarget(href: string) {
  const url = new URL(href, "https://local.blog");

  return {
    action: url.pathname,
    fields: Array.from(url.searchParams.entries()),
  };
}

function PaginationSubmitControl({
  control,
  disabled,
  href,
  label,
}: {
  control: "previous" | "next";
  disabled: boolean;
  href: string;
  label: string;
}) {
  const target = paginationTarget(href);

  return (
    <form action={target.action} method="get">
      {target.fields.map(([name, value]) => (
        <input key={`${name}:${value}`} name={name} type="hidden" value={value} />
      ))}
      <PaginationControl aria-label={label} control={control} disabled={disabled} type="submit" />
    </form>
  );
}

export function PostPagination({ currentPage, totalPages, hrefForPage }: PostPaginationProps) {
  if (totalPages <= 1) return null;

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="flex w-full justify-center pt-5">
      <Pagination
        aria-label="글 목록 페이지"
        className="inline-flex items-center justify-center"
        variant="simple"
      >
        <PaginationList className="items-center gap-3">
          <PaginationItem>
            <PaginationSubmitControl
              control="previous"
              disabled={!hasPreviousPage}
              href={hrefForPage(currentPage - 1)}
              label="이전"
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationStatus className="min-w-20 text-center text-sm font-medium text-foreground">
              {currentPage}/{totalPages}페이지
            </PaginationStatus>
          </PaginationItem>
          <PaginationItem>
            <PaginationSubmitControl
              control="next"
              disabled={!hasNextPage}
              href={hrefForPage(currentPage + 1)}
              label="다음"
            />
          </PaginationItem>
        </PaginationList>
      </Pagination>
    </div>
  );
}
