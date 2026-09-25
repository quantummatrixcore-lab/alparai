"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  getPageHref?: (page: number) => string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  getPageHref,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

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

  const renderPageItem = (page: number | string, index: number) => {
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

    const pageNum = page as number;
    const isCurrent = pageNum === currentPage;
    const itemClass = cn(
      "inline-flex items-center rounded-md border-t-2 px-4 pt-4 text-sm font-medium transition-colors cursor-pointer",
      "focus-visible:ring-brand-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
      isCurrent
        ? "border-brand-500 text-brand-400"
        : "text-fg-muted hover:border-border-strong hover:text-fg-primary border-transparent",
    );

    if (getPageHref) {
      return (
        <Link
          key={`page-${pageNum}`}
          href={getPageHref(pageNum)}
          aria-label={`Page ${pageNum}`}
          className={itemClass}
          aria-current={isCurrent ? "page" : undefined}
        >
          {pageNum}
        </Link>
      );
    }

    return (
      <button
        key={`page-${pageNum}`}
        type="button"
        onClick={() => onPageChange?.(pageNum)}
        aria-label={`Page ${pageNum}`}
        className={itemClass}
        aria-current={isCurrent ? "page" : undefined}
      >
        {pageNum}
      </button>
    );
  };

  return (
    <nav
      className={cn("border-border-subtle mt-8 flex items-center justify-between border-t px-4 py-4 sm:px-0", className)}
      aria-label="Pagination"
    >
      <div className="-mt-px flex w-0 flex-1">
        {currentPage > 1 ? (
          getPageHref ? (
            <Link
              href={getPageHref(currentPage - 1)}
              aria-label="Previous"
              className="text-fg-muted hover:border-border-strong hover:text-fg-primary focus-visible:ring-brand-500 inline-flex items-center rounded-md border-t-2 border-transparent pt-4 pr-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <ChevronLeft className="text-fg-muted mr-2 h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onPageChange?.(currentPage - 1)}
              aria-label="Previous"
              className="text-fg-muted hover:border-border-strong hover:text-fg-primary focus-visible:ring-brand-500 inline-flex items-center rounded-md border-t-2 border-transparent pt-4 pr-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none cursor-pointer"
            >
              <ChevronLeft className="text-fg-muted mr-2 h-4 w-4" aria-hidden="true" />
            </button>
          )
        ) : (
          <span className="text-fg-disabled inline-flex cursor-not-allowed items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium">
            <ChevronLeft className="text-fg-disabled mr-2 h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="hidden md:-mt-px md:flex">{getPages().map(renderPageItem)}</div>

      <div className="-mt-px flex w-0 flex-1 justify-end">
        {currentPage < totalPages ? (
          getPageHref ? (
            <Link
              href={getPageHref(currentPage + 1)}
              aria-label="Next"
              className="text-fg-muted hover:border-border-strong hover:text-fg-primary focus-visible:ring-brand-500 inline-flex items-center rounded-md border-t-2 border-transparent pt-4 pl-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <ChevronRight className="text-fg-muted ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onPageChange?.(currentPage + 1)}
              aria-label="Next"
              className="text-fg-muted hover:border-border-strong hover:text-fg-primary focus-visible:ring-brand-500 inline-flex items-center rounded-md border-t-2 border-transparent pt-4 pl-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none cursor-pointer"
            >
              <ChevronRight className="text-fg-muted ml-2 h-4 w-4" aria-hidden="true" />
            </button>
          )
        ) : (
          <span className="text-fg-disabled inline-flex cursor-not-allowed items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium">
            <ChevronRight className="text-fg-disabled ml-2 h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
