import { Pagination, PaginationItem, PaginationList, PaginationStatus } from "@hozui/react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

function PaginationLink({
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
  const Icon = control === "previous" ? ChevronLeft : ChevronRight;
  const className =
    "inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted";
  if (disabled) {
    return (
      <span aria-label={label} aria-disabled="true" className={`${className} opacity-40`}>
        <Icon aria-hidden="true" size={18} />
      </span>
    );
  }
  return (
    <Link
      aria-label={label}
      className={className}
      href={href}
      rel={control === "previous" ? "prev" : "next"}
    >
      <Icon aria-hidden="true" size={18} />
    </Link>
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
            <PaginationLink
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
            <PaginationLink
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
