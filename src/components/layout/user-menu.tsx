"use client";

import * as React from "react";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { User as UserIcon, LogOut, Settings, ShieldCheck, BarChart3 } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { getMe } from "@/actions/auth";
import Image from "next/image";

interface SessionUserShape {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: "user" | "moderator" | "admin" | "ceo" | "advisor" | "instructor";
}

export function UserMenu({ initialUser }: { initialUser: SessionUserShape | null }) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SessionUserShape | null>(initialUser);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (initialUser) return;
    getMe()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null));
  }, [initialUser]);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/auth/signin"
        className="from-brand-500/20 hover:from-brand-500/30 border-brand-500/40 hover:border-brand-400 text-brand-200 inline-flex h-9 items-center justify-center rounded-full border to-purple-500/20 px-4 text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all hover:scale-105 hover:to-purple-500/30 hover:text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
      >
        {t("signIn")}
      </Link>
    );
  }

  const isMod = user.role === "moderator" || user.role === "admin" || user.role === "ceo";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-bg-tertiary border-border-strong text-fg-primary hover:border-brand-500 inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border"
        aria-label={tCommon("account")}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold">
            {getInitials(
              user.email === "quantum.matrix.core@gmail.com" ||
                user.email === "ercument.erden@alparai.com"
                ? "Ercüment Erden"
                : (user.fullName ?? user.email),
            )}
          </span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="border-border-subtle bg-bg-elevated absolute top-12 right-0 z-50 w-64 overflow-hidden rounded-lg border shadow-2xl"
        >
          <div className="border-border-subtle border-b p-3">
            <p className="text-fg-primary truncate text-sm font-semibold">
              {user.email === "quantum.matrix.core@gmail.com" ||
              user.email === "ercument.erden@alparai.com"
                ? "Ercüment ERDEN"
                : (user.fullName ?? user.email)}
            </p>
            <p className="text-fg-muted truncate text-xs">{user.email}</p>
            {isMod && (
              <span className="bg-brand-500/15 text-brand-300 mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase">
                <ShieldCheck className="h-3 w-3" />
                {user.role}
              </span>
            )}
          </div>
          <div className="py-1">
            <Link
              href="/profile"
              role="menuitem"
              className="text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary flex items-center gap-2 px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              <UserIcon className="h-4 w-4" /> {t("profile")}
            </Link>
            <Link
              href="/my-incidents"
              role="menuitem"
              className="text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary flex items-center gap-2 px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              <BarChart3 className="h-4 w-4" /> {t("myIncidents")}
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              className="text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary flex items-center gap-2 px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" /> {t("settings")}
            </Link>
            {isMod && (
              <Link
                href="/admin"
                role="menuitem"
                className="text-brand-300 hover:bg-bg-tertiary flex items-center gap-2 px-3 py-2 text-sm"
                onClick={() => setOpen(false)}
              >
                <ShieldCheck className="h-4 w-4" /> {t("adminPanel")}
              </Link>
            )}
          </div>
          <div className="border-border-subtle border-t py-1">
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                role="menuitem"
                className="text-danger-400 hover:bg-danger-500/10 flex w-full items-center gap-2 px-3 py-2 text-sm"
              >
                <LogOut className="h-4 w-4" /> {t("signOut")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
