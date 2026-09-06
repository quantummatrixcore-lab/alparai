import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function PIIBanner({ className }: { className?: string }) {
  const t = useTranslations("incident");
  return (
    <div
      className={cn(
        "border-success-500/30 bg-success-500/5 flex items-start gap-3 rounded-md border p-3",
        className,
      )}
      role="status"
    >
      <ShieldCheck className="text-success-500 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-fg-primary text-sm font-medium">
          {t("piiProtectedTitle", { defaultValue: "PII protected" })}
        </p>
        <p className="text-fg-muted text-xs">
          {t("piiProtectedDesc", {
            defaultValue:
              "Personal information such as emails, phone numbers, IDs and access tokens are automatically masked before publication.",
          })}
        </p>
      </div>
    </div>
  );
}
