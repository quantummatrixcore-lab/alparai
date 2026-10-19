"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/utils/logger";
import { Loader2 } from "lucide-react";

interface LemonCheckoutButtonProps {
  variant?: "primary" | "outline" | "secondary";
  className?: string;
  tier?: string;
  locale?: string;
  /** i18n strings for the transient checkout states. */
  loadingLabel?: string;
  errorLabel?: string;
  children?: React.ReactNode;
}

export function LemonCheckoutButton({
  variant = "primary",
  className,
  tier = "developer",
  locale = "tr",
  loadingLabel,
  errorLabel,
  children,
}: LemonCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setFailureMessage(null);
    try {
      const res = await fetch("/api/checkout/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, locale }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setFailureMessage(data.error || errorLabel || "Checkout session could not be created.");
    } catch (err) {
      logger.error(
        "Lemon Squeezy checkout trigger error",
        undefined,
        err instanceof Error ? err : undefined,
      );
      setFailureMessage(errorLabel || "Checkout session could not be created.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant={variant}
        className={className}
        onClick={handleCheckout}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{loadingLabel || "Redirecting..."}</span>
          </span>
        ) : (
          children || "Buy"
        )}
      </Button>
      {failureMessage ? (
        <p role="alert" className="text-danger-500 mt-2 text-center text-xs">
          {failureMessage}
        </p>
      ) : null}
    </>
  );
}
