"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine if this is the homepage (with or without locale prefix)
  const isHome =
    !pathname ||
    pathname === "/" ||
    pathname === "/en" ||
    pathname === "/tr" ||
    pathname === "/en/" ||
    pathname === "/tr/";

  // Determine if this is an admin page
  const isAdmin =
    pathname &&
    (/^\/(?:en|tr)\/admin(?:\/|$)/.test(pathname) ||
      pathname === "/admin" ||
      pathname.startsWith("/admin") ||
      pathname.includes("/admin/"));

  // Apply padding-top only to non-home and non-admin pages to clear the fixed navigation header
  const shouldHavePadding = !isHome && !isAdmin;

  return (
    <main id="main-content" className={cn("flex-1", shouldHavePadding && "pt-24")} tabIndex={-1}>
      {children}
    </main>
  );
}
