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
  children?: React.ReactNode;
}

export function LemonCheckoutButton({
  variant = "primary",
  className,
  tier = "developer",
  locale = "tr",
  children,
}: LemonCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, locale }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        const errorMsg = data.error || "Ödeme oturumu açılamadı. Lütfen tekrar deneyin.";
        alert(errorMsg);
      }
    } catch (err) {
      logger.error("Lemon Squeezy checkout trigger error", undefined, err instanceof Error ? err : undefined);
      alert("Ödeme kapısına bağlanırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Yönlendiriliyor...</span>
        </span>
      ) : (
        children || "Satın Al (990 ₺)"
      )}
    </Button>
  );
}
