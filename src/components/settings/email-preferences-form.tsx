"use client";

import { useActionState, useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateEmailPreferencesAction } from "@/actions/email-preferences";
import { useTranslations } from "next-intl";

interface EmailPreferencesFormProps {
  userId: string;
  initialPreferences: {
    weekly_digest: boolean;
    watches: boolean;
    reporter_notifications: boolean;
  };
}

export function EmailPreferencesForm({ userId, initialPreferences }: EmailPreferencesFormProps) {
  const t = useTranslations("settings");
  const [state, formAction, isPending] = useActionState(updateEmailPreferencesAction, {
    ok: false,
  });
  const [weeklyDigest, setWeeklyDigest] = useState(initialPreferences.weekly_digest);
  const [watches, setWatches] = useState(initialPreferences.watches);
  const [reporterNotifications, setReporterNotifications] = useState(
    initialPreferences.reporter_notifications,
  );

  useEffect(() => {
    if (state.ok) {
      toast.success(
        t("preferences_updated", {
          defaultValue: "Notification preferences updated successfully!",
        }),
      );
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, t]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />
      <Checkbox
        name="weeklyDigest"
        label={t("weekly_digest_label", { defaultValue: "Weekly Digest" })}
        description={t("weekly_digest_desc", {
          defaultValue:
            "Receive a summary of AI accountability and platform statistics every Monday.",
        })}
        checked={weeklyDigest}
        onChange={(e) => setWeeklyDigest(e.target.checked)}
      />
      <Checkbox
        name="watches"
        label={t("watches_label", { defaultValue: "Incident Watch Alerts" })}
        description={t("watches_desc", {
          defaultValue: "Receive emails when incidents you watch receive new updates.",
        })}
        checked={watches}
        onChange={(e) => setWatches(e.target.checked)}
      />
      <Checkbox
        name="reporterNotifications"
        label={t("reporter_notifications_label", { defaultValue: "Reporter Status Alerts" })}
        description={t("reporter_notifications_desc", {
          defaultValue:
            "Receive emails when AI providers respond or domain experts verify incidents you reported.",
        })}
        checked={reporterNotifications}
        onChange={(e) => setReporterNotifications(e.target.checked)}
      />
      <div className="pt-2">
        <Button type="submit" isLoading={isPending}>
          {t("save_preferences", { defaultValue: "Save Preferences" })}
        </Button>
      </div>
    </form>
  );
}
