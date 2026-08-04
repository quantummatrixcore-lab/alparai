"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setUserRole } from "@/actions/admin";
import { useTranslations } from "next-intl";

interface RoleSelectProps {
  userId: string;
  currentRole: string;
  currentUserRole: "user" | "moderator" | "admin" | "ceo";
}

const ROLES = ["user", "moderator", "admin", "ceo"] as const;

const ROLE_BADGE_CLASSES: Record<string, string> = {
  ceo: "bg-danger-500/20 text-danger-400 border-danger-500/30",
  admin: "bg-warning-500/20 text-warning-400 border-warning-500/30",
  moderator: "bg-brand-500/20 text-brand-400 border-brand-500/30",
  user: "bg-bg-tertiary text-fg-muted border-border-subtle",
};

export function RoleSelect({ userId, currentRole, currentUserRole }: RoleSelectProps) {
  const t = useTranslations("admin");
  const [role, setRole] = useState(currentRole);
  const [pending, start] = useTransition();

  const available = ROLES.filter((r) => {
    if (currentUserRole === "ceo") return true;
    if (currentUserRole === "admin") return r !== "ceo";
    return false;
  });

  const handleChange = (newRole: string) => {
    if (newRole === role) return;
    start(async () => {
      const res = await setUserRole({
        userId,
        role: newRole as "user" | "moderator" | "admin" | "ceo",
      });
      if (res.ok) {
        setRole(newRole);
        toast.success(t("role_changed", { role: newRole }));
      } else {
        toast.error(res.error ?? t("role_change_failed"));
      }
    });
  };

  return (
    <select
      value={role}
      onChange={(e) => handleChange(e.target.value)}
      disabled={pending}
      className={`appearance-none rounded-md border px-2 py-1 text-xs font-semibold transition-colors ${ROLE_BADGE_CLASSES[role] ?? ROLE_BADGE_CLASSES.user} cursor-pointer disabled:opacity-50`}
      aria-label={t("change_role")}
    >
      {available.map((r) => (
        <option key={r} value={r} className="bg-bg-primary text-fg-primary">
          {r}
        </option>
      ))}
    </select>
  );
}
