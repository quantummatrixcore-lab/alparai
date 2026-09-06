"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/utils/logger";

interface StripeCheckoutButtonProps {
  variant?: "primary" | "outline";
  className?: string;
  tier?: "pro" | "enterprise";
  children: React.ReactNode;
}

export function StripeCheckoutButton({
  variant = "primary",
  className,
  tier = "pro",
  children,
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout failed. Please try again.");
      }
    } catch (err) {
      logger.error("Stripe checkout error", undefined, err instanceof Error ? err : undefined);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={variant} className={className} onClick={handleCheckout} disabled={loading}>
      {loading ? "Redirecting..." : children}
    </Button>
  );
}
