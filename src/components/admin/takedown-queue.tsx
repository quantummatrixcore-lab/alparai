"use client";

import { useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { reviewTakedown } from "@/actions/admin";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import { useLocale } from "next-intl";

export interface TakedownItem {
  id: string;
  reason: string;
  details: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  requester_name?: string | null;
  requester_email?: string | null;
  organization?: string | null;
  country?: string | null;
  target_url?: string | null;
}

export function TakedownQueue({ items }: { items: TakedownItem[] }) {
  const t = useTranslations("admin");
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="text-fg-muted py-12 text-center text-sm">
          {t("no_pending_takedowns")}
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <TakedownRow key={it.id} item={it} />
      ))}
    </div>
  );
}

function TakedownRow({ item }: { item: TakedownItem }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [pending, start] = useTransition();
  const decide = (decision: "approve" | "reject") => {
    start(async () => {
      const res = await reviewTakedown({ id: item.id, decision });
      if (res.ok) toast.success(t("updated"));
      else toast.error(res.error ?? t("failed"));
    });
  };
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted">{item.reason}</Badge>
          <Badge
            variant={
              item.status === "approved"
                ? "success"
                : item.status === "rejected"
                  ? "danger"
                  : "warning"
            }
          >
            {item.status}
          </Badge>
          <span className="text-fg-muted text-xs">
            {formatRelativeTime(new Date(item.created_at), locale)}
          </span>
        </div>
        <p className="text-fg-primary text-sm whitespace-pre-wrap">{item.details}</p>
        <div className="text-fg-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          {item.requester_name && <span>{item.requester_name}</span>}
          {item.organization && <span>{item.organization}</span>}
          {item.country && <span>{item.country}</span>}
          {item.target_url && (
            <a
              href={item.target_url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-brand-400 max-w-md truncate hover:underline"
            >
              {item.target_url}
            </a>
          )}
        </div>
        {item.status === "pending" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="success"
              leftIcon={<Check className="h-3.5 w-3.5" />}
              isLoading={pending}
              onClick={() => decide("approve")}
            >
              {t("approve")}
            </Button>
            <Button
              size="sm"
              variant="danger"
              leftIcon={<X className="h-3.5 w-3.5" />}
              isLoading={pending}
              onClick={() => decide("reject")}
            >
              {t("reject")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
