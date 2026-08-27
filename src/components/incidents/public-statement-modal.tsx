"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { recordPublicStatement } from "@/actions/admin/public-statement";

export function PublicStatementModal({
  incidentId,
  providerId,
}: {
  incidentId: string;
  providerId: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const t = useTranslations("common");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("incidentId", incidentId);
    formData.append("providerId", providerId);

    const result = await recordPublicStatement(formData);
    setLoading(false);

    if (result.ok) {
      setOpen(false);
    } else {
      setError(result.error ?? "Failed to save statement");
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <FileText className="h-4 w-4" />
        Record Public Statement
      </Button>

      <Modal open={open} onOpenChange={setOpen} title="Record Public Statement">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-500">{error}</div>}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Source URL</label>
            <input
              type="url"
              name="sourceUrl"
              required
              className="focus:ring-brand-500 border-border-strong bg-bg-secondary flex h-10 w-full rounded-md border px-3 py-2 text-sm text-white focus:ring-2 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Statement Date</label>
            <input
              type="date"
              name="statementDate"
              required
              className="focus:ring-brand-500 border-border-strong bg-bg-secondary flex h-10 w-full rounded-md border px-3 py-2 text-sm text-white focus:ring-2 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Quote (min 10 chars)</label>
            <textarea
              name="quote"
              required
              minLength={10}
              rows={5}
              className="focus:ring-brand-500 border-border-strong bg-bg-secondary flex w-full rounded-md border px-3 py-2 text-sm text-white focus:ring-2 focus:outline-none"
            ></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Statement"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
