"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_SEC = 60;

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "341717447635-75ramo1e88p34b9dkmhfp5ocecqv0ff1.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { type?: string; theme?: string; size?: string; width?: number | string },
          ) => void;
          prompt: (
            notification?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
            }) => void,
          ) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({
  next = "/profile",
  className,
  disabled = false,
}: {
  next?: string;
  className?: string;
  disabled?: boolean;
}) {
  const t = useTranslations("auth");
  const [pending, start] = useTransition();
  const [gisLoaded, setGisLoaded] = useState(false);
  const gisContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing. GIS might not work correctly.");
    }

    const initGis = () => {
      if (!window.google?.accounts?.id) return;
      setGisLoaded(true);

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: { credential?: string }) => {
            const tokenStr = response.credential;
            if (tokenStr) {
              start(async () => {
                const { createBrowserClient } = await import("@supabase/ssr");
                const supabase = createBrowserClient(
                  process.env.NEXT_PUBLIC_SUPABASE_URL!,
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                );
                const { error } = await supabase.auth.signInWithIdToken({
                  provider: "google",
                  token: tokenStr,
                });
                if (error) {
                  toast.error(error.message);
                } else {
                  window.location.href = next;
                }
              });
            }
          },
        });

        if (gisContainerRef.current) {
          gisContainerRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(gisContainerRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            width: 400,
          });
        }
      } catch (_err) {
        // Ignore initialization error
      }
    };

    if (window.google?.accounts?.id) {
      initGis();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGis;
    document.head.appendChild(script);
  }, [next]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {gisLoaded && (
        <div
          ref={gisContainerRef}
          aria-hidden="true"
          className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-[0.001] [&_iframe]:h-full! [&_iframe]:w-full! [&_iframe]:cursor-pointer!"
        />
      )}
      <Button
        type="button"
        variant="ghost"
        size="lg"
        isLoading={pending}
        disabled={disabled}
        className={cn(
          "w-full border border-white/[0.08] bg-white/[0.03] hover:border-white/[0.16] hover:bg-white/[0.07] active:bg-white/[0.1]",
          "rounded-xl text-sm font-semibold tracking-wide text-white shadow-lg transition-all duration-300",
          "hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(168,85,247,0.18)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none",
          className,
        )}
        onClick={() => {
          toast.info(t("use_email_signin_fallback") || "Please use email sign-in below");
        }}
      >
        <svg
          className="mr-1 h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {t("signin_with_google")}
      </Button>
    </div>
  );
}

type MagicLinkState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent"; email: string; sentAt: number }
  | { status: "error"; message: string };

export function EmailMagicLinkForm({
  className,
  disabled = false,
}: {
  className?: string;
  disabled?: boolean;
}) {
  const t = useTranslations("auth");
  const [, start] = useTransition();
  const [state, setState] = useState<MagicLinkState>({ status: "idle" });
  const [emailValue, setEmailValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const handleSend = (email: string, isResend = false) => {
    if (!EMAIL_REGEX.test(email)) {
      setValidationError(t("invalid_email"));
      return;
    }
    setValidationError(null);
    setState({ status: "sending" });

    start(async () => {
      const { signInWithMagicLink } = await import("@/actions/auth");
      const res = await signInWithMagicLink(email);
      if (res.ok) {
        setState({ status: "sent", email, sentAt: Date.now() });
        setCooldown(RESEND_COOLDOWN_SEC);
        if (isResend) {
          toast.success(t("magic_link_sent_toast", { email }));
        }
      } else {
        const message = res.error ?? t("server_error");
        setState({ status: "error", message });
        toast.error(message);
      }
    });
  };

  const handleResend = () => {
    if (cooldown > 0 || !state || state.status !== "sent") return;
    handleSend(state.email, true);
  };

  const handleTryAnother = () => {
    setState({ status: "idle" });
    setEmailValue("");
    setValidationError(null);
  };

  if (state?.status === "sent") {
    const parts = t.rich("magic_link_subtitle", {
      email: () => (
        <span className="text-fg-primary font-semibold break-all" dir="ltr">
          {state.email}
        </span>
      ),
    });
    return (
      <div
        className={`border-success-500/30 bg-success-500/5 space-y-4 rounded-lg border p-5 ${className ?? ""}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="bg-success-500/15 shrink-0 rounded-full p-1.5">
            <CheckCircle2 className="text-success-500 h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-fg-primary text-sm font-semibold">{t("magic_link_heading")}</h3>
            <p className="text-fg-secondary text-xs leading-relaxed">{parts}</p>
          </div>
        </div>

        <div className="text-fg-muted flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <span>
            {t("magic_link_check_spam")}{" "}
            <button
              type="button"
              onClick={handleTryAnother}
              className="text-brand-400 font-medium underline-offset-2 hover:underline"
            >
              {t("magic_link_try_another")}
            </button>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="h-7 px-2 text-xs"
          >
            {cooldown > 0 ? `${t("magic_link_resend")} (${cooldown}s)` : t("magic_link_resend")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        handleSend(emailValue.trim(), false);
      }}
      noValidate
    >
      <label htmlFor="magic-email" className="text-fg-secondary mb-1.5 block text-xs font-medium">
        {t("email_label")}
      </label>
      <div className="space-y-3">
        <div className="relative">
          <input
            id="magic-email"
            name="email"
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={emailValue}
            onChange={(e) => {
              setEmailValue(e.target.value);
              if (validationError) setValidationError(null);
            }}
            disabled={disabled || state?.status === "sending"}
            aria-invalid={validationError ? true : undefined}
            aria-describedby={validationError ? "magic-email-error" : undefined}
            className="focus:border-brand-500/80 focus:ring-brand-500/20 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white placeholder-white/30 transition-all hover:bg-white/[0.04] focus:bg-white/[0.05] focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <Button
          type="submit"
          className="from-brand-600 hover:from-brand-500 active:from-brand-700 h-11 w-full rounded-xl bg-gradient-to-r to-indigo-600 font-bold tracking-wide text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:to-indigo-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] active:to-indigo-700 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          isLoading={state?.status === "sending"}
          disabled={disabled || !emailValue.trim()}
          leftIcon={
            state?.status !== "sending" ? (
              <Mail className="h-4 w-4" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin" />
            )
          }
        >
          {state?.status === "sending" ? t("magic_link_sending") : t("send")}
        </Button>
      </div>
      {validationError && (
        <p id="magic-email-error" className="text-danger-400 mt-1.5 text-xs" role="alert">
          {validationError}
        </p>
      )}
    </form>
  );
}
