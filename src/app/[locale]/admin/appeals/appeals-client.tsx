"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { reviewTakedownAppeal } from "@/actions/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/types/database";

type Appeal = Database["public"]["Tables"]["takedown_appeals"]["Row"];

export function AppealsClient({ appeals }: { appeals: Appeal[] }) {
  const t = useTranslations("admin.appeals");
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});

  const handleReview = async (id: string, decision: "approve" | "reject") => {
    const confirmMessage = decision === "approve" ? t("confirm_approve") : t("confirm_reject");
    if (!confirm(confirmMessage)) return;

    setProcessingId(id);
    startTransition(async () => {
      const result = await reviewTakedownAppeal({
        id,
        decision,
        resolutionNotes: resolutionNotes[id] || "",
      });

      if (!result.ok) {
        alert("Failed to process review: " + result.error);
      }
      setProcessingId(null);
    });
  };

  const updateNotes = (id: string, val: string) => {
    setResolutionNotes((prev) => ({ ...prev, [id]: val }));
  };

  if (appeals.length === 0) {
    return (
      <Card variant="outline" padding="lg">
        <p className="text-text-secondary text-center">{t("no_appeals")}</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {appeals.map((appeal) => (
        <Card key={appeal.id} variant="default" padding="md">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">
                  {appeal.appellant_name}
                </span>
                <span className="text-text-secondary text-sm">
                  ({appeal.appellant_email})
                </span>
                <Badge
                  variant={
                    appeal.status === "approved"
                      ? "success"
                      : appeal.status === "rejected"
                      ? "danger"
                      : "warning"
                  }
                >
                  {t(`status_${appeal.status}`)}
                </Badge>
              </div>
              
              <div className="text-sm text-text-secondary">
                <strong>{t("reason")}:</strong>
                <p className="mt-1 p-3 bg-bg-tertiary rounded-md whitespace-pre-wrap">
                  {appeal.reason}
                </p>
              </div>

              {appeal.evidence_url && (
                <div className="text-sm text-text-secondary">
                  <strong>{t("evidence")}:</strong>{" "}
                  <a
                    href={appeal.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 hover:underline"
                  >
                    {appeal.evidence_url}
                  </a>
                </div>
              )}
            </div>

            {appeal.status === "pending" && (
              <div className="w-full md:w-1/3 space-y-3 bg-bg-secondary p-4 rounded-lg border border-border-subtle">
                <Textarea
                  placeholder={t("resolution_notes")}
                  value={resolutionNotes[appeal.id] || ""}
                  onChange={(e) => updateNotes(appeal.id, e.target.value)}
                  className="w-full text-sm"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => handleReview(appeal.id, "approve")}
                    disabled={isPending && processingId === appeal.id}
                  >
                    {isPending && processingId === appeal.id ? "..." : t("approve")}
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => handleReview(appeal.id, "reject")}
                    disabled={isPending && processingId === appeal.id}
                  >
                    {isPending && processingId === appeal.id ? "..." : t("reject")}
                  </Button>
                </div>
              </div>
            )}
            
            {appeal.status !== "pending" && appeal.resolution_notes && (
              <div className="w-full md:w-1/3 text-sm">
                <strong>{t("resolution_notes")}:</strong>
                <p className="mt-1 text-text-secondary p-3 bg-bg-tertiary rounded-md">
                  {appeal.resolution_notes}
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
