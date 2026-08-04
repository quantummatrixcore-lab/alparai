"use client";

import { Toaster } from "sonner";
import dynamic from "next/dynamic";

const CookieBanner = dynamic(
  () => import("./legal/cookie-banner").then((mod) => mod.CookieBanner),
  {
    ssr: false,
  },
);

export function ClientProviders() {
  return (
    <>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "rgb(var(--color-bg-elevated))",
            border: "1px solid rgb(var(--color-border-subtle))",
            color: "rgb(var(--color-fg-primary))",
          },
        }}
      />
      <CookieBanner />
    </>
  );
}
