"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ExternalLink, Calendar, Users, Mail, DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import { approveInvestor, rejectInvestor } from "@/actions/investor";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import { useLocale } from "next-intl";

export interface InvestorApplicationItem {
  id: string;
  full_name: string;
  title: string;
  company: string;
  linkedin_url: string;
  email: string;
  check_size: string;
  why_interested: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export function InvestorApplicationsList({
  applications,
}: {
  applications: InvestorApplicationItem[];
}) {
  const t = useTranslations("admin");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const filtered = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  return (
    <div className="space-y-4">
      <div className="border-border-subtle flex gap-2 border-b pb-4">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "primary" : "ghost"}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {t(`filter_${f}`, { defaultValue: f })}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="text-fg-muted py-12 text-center text-sm">
            {t("no_investor_applications") || "No investor applications found."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <InvestorApplicationRow key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}

function InvestorApplicationRow({ application }: { application: InvestorApplicationItem }) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [pending, start] = useTransition();

  const handleReview = (decision: "approve" | "reject") => {
    start(async () => {
      const res =
        decision === "approve"
          ? await approveInvestor(application.id)
          : await rejectInvestor(application.id);

      if (res.ok) {
        toast.success(decision === "approve" ? t("approved") + " ✓" : t("rejected") + " ✓");
      } else {
        toast.error(res.error ?? tCommon("loading"));
      }
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-fg-primary flex items-center gap-1.5 text-lg font-bold">
                <Users className="h-5 w-5 text-emerald-500" />
                {application.full_name}
              </h3>
              <Badge
                variant={
                  application.status === "approved"
                    ? "success"
                    : application.status === "rejected"
                      ? "danger"
                      : "warning"
                }
              >
                {t(application.status, { defaultValue: application.status })}
              </Badge>
              <span className="text-fg-muted flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {formatRelativeTime(new Date(application.created_at), locale)}
              </span>
            </div>

            <p className="text-fg-primary flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
              <span>
                {application.title} at {application.company}
              </span>
              {application.email && (
                <span className="text-fg-muted flex items-center gap-1 text-xs font-normal">
                  <Mail className="h-3.5 w-3.5" />
                  {application.email}
                </span>
              )}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-amber-500/30 text-xs text-amber-500"
              >
                <DollarSign className="h-3 w-3" />
                {application.check_size}
              </Badge>

              {application.linkedin_url && (
                <a
                  href={application.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-1 text-xs font-semibold"
                >
                  {t("view_linkedin_profile")}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {application.why_interested && (
              <div className="mt-2 max-w-2xl rounded border border-slate-800 bg-[#0E1F30] p-3 text-xs text-slate-300">
                <p className="mb-1 font-semibold text-slate-400">{t("why_interested")}</p>
                <p className="italic">"{application.why_interested}"</p>
              </div>
            )}
          </div>

          {application.status === "pending" && (
            <div className="flex gap-2 self-end md:self-start">
              <Button
                size="sm"
                variant="success"
                leftIcon={<Check className="h-3.5 w-3.5" />}
                isLoading={pending}
                onClick={() => handleReview("approve")}
              >
                {t("approve")}
              </Button>
              <Button
                size="sm"
                variant="danger"
                leftIcon={<X className="h-3.5 w-3.5" />}
                isLoading={pending}
                onClick={() => handleReview("reject")}
              >
                {t("reject")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
