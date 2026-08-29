"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine if this is the homepage (with or without locale prefix)
  const isHome = !pathname || pathname === "/" || /^\/[a-z]{2}\/?$/.test(pathname);

  // Determine if this is an admin page
  const isAdmin =
    pathname &&
    (/^\/[a-z]{2}\/admin(-v2)?(?:\/|$)/.test(pathname) ||
      pathname === "/admin" ||
      pathname.startsWith("/admin") ||
      pathname.includes("/admin-v2") ||
      pathname.includes("/admin/"));

  // Apply clean standard padding-top to all public subpages to clear fixed header + ticker
  const shouldHavePadding = !isHome && !isAdmin;

  return (
    <main id="main-content" className={cn("flex-1", shouldHavePadding && "pt-28")} tabIndex={-1}>
      {children}
    </main>
  );
}
