"use client";

import { Link } from "@/i18n/routing";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  category?: string;
  severity?: string;
  q?: string;
  sort?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  category,
  severity,
  q,
  sort,
}: PaginationProps) {
  const t = useTranslations("common");

  if (totalPages <= 1) return null;

  const getPageHref = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (severity) params.set("severity", severity);
    if (q) params.set("q", q);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (pageNumber > 1) params.set("page", String(pageNumber));
    const qs = params.toString();
    return qs ? `/incidents?${qs}` : "/incidents";
  };

  const getPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 3;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      className="border-border-subtle mt-8 flex items-center justify-between border-t px-4 py-4 sm:px-0"
      aria-label="Pagination"
    >
      <div className="-mt-px flex w-0 flex-1">
        {currentPage > 1 ? (
          <Link
            href={getPageHref(currentPage - 1)}
            className="text-fg-muted hover:border-border-strong hover:text-fg-primary inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium transition-colors"
          >
            <ChevronLeft className="text-fg-muted mr-2 h-4 w-4" aria-hidden="true" />
            {t("previous")}
          </Link>
        ) : (
          <span className="text-fg-disabled inline-flex cursor-not-allowed items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium">
            <ChevronLeft className="text-fg-disabled mr-2 h-4 w-4" aria-hidden="true" />
            {t("previous")}
          </span>
        )}
      </div>

      <div className="hidden md:-mt-px md:flex">
        {getPages().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="text-fg-disabled inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium"
              >
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <Link
              key={`page-${page}`}
              href={getPageHref(page as number)}
              className={cn(
                "inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium transition-colors",
                isCurrent
                  ? "border-brand-500 text-brand-400"
                  : "text-fg-muted hover:border-border-strong hover:text-fg-primary border-transparent",
              )}
              aria-current={isCurrent ? "page" : undefined}
            >
              {page}
            </Link>
          );
        })}
      </div>

      <div className="-mt-px flex w-0 flex-1 justify-end">
        {currentPage < totalPages ? (
          <Link
            href={getPageHref(currentPage + 1)}
            className="text-fg-muted hover:border-border-strong hover:text-fg-primary inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium transition-colors"
          >
            {t("next")}
            <ChevronRight className="text-fg-muted ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className="text-fg-disabled inline-flex cursor-not-allowed items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium">
            {t("next")}
            <ChevronRight className="text-fg-disabled ml-2 h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
