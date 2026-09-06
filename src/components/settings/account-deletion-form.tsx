"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { requestUserDeletionAction, cancelUserDeletionAction } from "@/actions/user-deletion";
import { useTranslations } from "next-intl";

interface AccountDeletionFormProps {
  deleteRequestedAt: string | null;
  deleteScheduledFor: string | null;
  locale: string;
}

export function AccountDeletionForm({
  deleteRequestedAt,
  deleteScheduledFor,
  locale,
}: AccountDeletionFormProps) {
  const t = useTranslations("settings");

  const [requestState, requestAction, requestPending] = useActionState(requestUserDeletionAction, {
    ok: false,
  });
  const [cancelState, cancelAction, cancelPending] = useActionState(cancelUserDeletionAction, {
    ok: false,
  });

  useEffect(() => {
    if (requestState.ok) {
      toast.success(
        t("delete_requested_success", {
          defaultValue: "Account deletion requested. You have 72 hours to cancel this request.",
        }),
      );
    } else if (requestState.error) {
      toast.error(requestState.error);
    }
  }, [requestState, t]);

  useEffect(() => {
    if (cancelState.ok) {
      toast.success(
        t("delete_cancelled_success", {
          defaultValue: "Account deletion request has been cancelled.",
        }),
      );
    } else if (cancelState.error) {
      toast.error(cancelState.error);
    }
  }, [cancelState, t]);

  if (deleteRequestedAt && deleteScheduledFor) {
    const formattedDate = new Date(deleteScheduledFor).toLocaleString(
      locale === "tr" ? "tr-TR" : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    );

    return (
      <div className="space-y-4">
        <div className="border-warning-500/20 bg-warning-500/10 text-warning-400 rounded-md border p-4 text-sm leading-relaxed">
          <p className="font-semibold">
            {t("delete_scheduled_warning_title", {
              defaultValue: "Account Scheduled for Deletion",
            })}
          </p>
          <p className="mt-1">
            {t("delete_scheduled_warning_desc", {
              defaultValue:
                "Your account is scheduled to be deleted on {date}. Your personal data will be erased and your incidents anonymized.",
              date: formattedDate,
            }).replace("{date}", formattedDate)}
          </p>
        </div>
        <form action={cancelAction}>
          <Button type="submit" variant="secondary" isLoading={cancelPending}>
            {t("cancel_deletion_btn", { defaultValue: "Cancel Deletion Request" })}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-danger-500/20 bg-danger-500/10 text-danger-400 rounded-md border p-4 text-sm leading-relaxed">
        <p className="font-semibold">
          {t("delete_warning_title", { defaultValue: "Danger Zone" })}
        </p>
        <p className="mt-1">
          {t("delete_warning_desc", {
            defaultValue:
              "Requesting account deletion will initiate a 72-hour grace period. After 72 hours, your account will be soft-deleted (email cleared, name set to 'Anonim Kullanıcı', and unsubscribed from all lists). After 30 days, your account will be completely hard-deleted.",
          })}
        </p>
      </div>
      <form
        action={requestAction}
        onSubmit={(e) => {
          if (
            !confirm(
              t("delete_confirm_prompt", {
                defaultValue:
                  "Are you sure you want to delete your account? This action can be cancelled within 72 hours.",
              }),
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <Button type="submit" variant="danger" isLoading={requestPending}>
          {t("delete_account_btn", { defaultValue: "Delete Account" })}
        </Button>
      </form>
    </div>
  );
}
