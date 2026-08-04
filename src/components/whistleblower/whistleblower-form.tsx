"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { submitWhistleblowerAction } from "@/actions/whistleblower";
import { encryptZeroKnowledge } from "@/lib/crypto/client-crypto";

export function WhistleblowerForm() {
  const t = useTranslations("whistleblower");
  const tCat = useTranslations("categories");

  const [category, setCategory] = React.useState("safety");
  const [providerHint, setProviderHint] = React.useState("");
  const [content, setContent] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "encrypting" | "submitting" | "success" | "error"
  >("idle");
  const [displayContent, setDisplayContent] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [keyFragment, setKeyFragment] = React.useState<string>("");
  const CATEGORIES = [
    { id: "safety", label: tCat("safety") },
    { id: "privacy", label: tCat("privacy") },
    { id: "bias", label: tCat("bias") },
    { id: "security", label: tCat("security") },
    { id: "other", label: tCat("other") },
  ];

  React.useEffect(() => {
    if (status === "idle" || status === "error") setDisplayContent(content);
  }, [content, status]);

  /**
   * Visual scramble micro-animation runs in parallel with the REAL AES-GCM
   * encryption in `encryptZeroKnowledge()`. The animation is purely cosmetic
   * (no security claim). The actual security comes from Web Crypto AES-GCM,
   * never from this display string.
   *
   * Replaces the previous `btoa()` placeholder which was NOT encryption.
   */
  const runVisualEncryption = (realEncryptedPromise: Promise<string>) => {
    let ticks = 0;
    const original = content;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    const interval = setInterval(() => {
      ticks++;
      const scrambled = original
        .split("")
        .map((ch, idx) => {
          if (ch === "\n") return "\n";
          if (idx < (ticks / 15) * original.length) {
            return chars.charAt((idx * 7 + ticks) % chars.length);
          }
          return ch;
        })
        .join("");
      setDisplayContent(scrambled);
      if (ticks >= 20) clearInterval(interval);
    }, 50);
    return realEncryptedPromise.finally(() => clearInterval(interval));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setStatus("encrypting");
    setErrorMessage("");
    setKeyFragment("");

    try {
      const encryptionPromise = encryptZeroKnowledge(content);
      const encrypted = await runVisualEncryption(encryptionPromise.then((r) => r.ciphertext));
      const result = await encryptionPromise;
      setKeyFragment(result.keyFragment);

      setStatus("submitting");
      try {
        const res = await submitWhistleblowerAction({
          encryptedContent: encrypted,
          category,
          providerHint: providerHint.trim() || null,
        });

        if (res.ok) {
          setStatus("success");
          setContent("");
          setProviderHint("");
        } else {
          setStatus("error");
          setErrorMessage(res.error || "Submission failed");
          setDisplayContent(content);
        }
      } catch (_err) {
        setStatus("error");
        setErrorMessage(t("networkError"));
        setDisplayContent(content);
      }
    } catch (_err) {
      setStatus("error");
      setErrorMessage(t("encryptionError"));
      setDisplayContent(content);
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
        <div className="bg-success-500/10 text-success-500 rounded-full p-4">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h3 className="text-fg-primary text-xl font-bold">{t("successTitle")}</h3>
        <p className="text-fg-muted max-w-md text-sm">{t("success")}</p>

        {keyFragment && (
          <div className="border-warning-500/30 bg-warning-500/5 w-full max-w-xl space-y-3 rounded-lg border p-4 text-left">
            <div className="flex items-center gap-2">
              <KeyRound className="text-warning-500 h-5 w-5" />
              <p className="text-fg-primary text-sm font-bold">{t("yourRecoveryKey")}</p>
            </div>
            <p className="text-fg-muted text-xs leading-relaxed">{t("recoveryKeyNotice")}</p>
            <code className="bg-bg-secondary border-border-subtle text-fg-primary block overflow-x-auto rounded-md border p-3 font-mono text-xs">
              {keyFragment}
            </code>
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(keyFragment).catch(() => {});
                }
              }}
              className="text-fg-secondary hover:text-fg-primary text-xs font-semibold underline-offset-2 hover:underline"
            >
              {t("copyRecoveryKey")}
            </button>
          </div>
        )}

        <Button onClick={() => setStatus("idle")} variant="outline" className="mt-4">
          {t("submitAnother")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Encryption Banner */}
      <div className="border-brand-500/20 bg-brand-500/5 flex items-start gap-3 rounded-lg border p-4">
        <Lock className="text-brand-400 mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <p className="text-fg-primary text-xs font-bold tracking-wider uppercase">
            {t("zeroKnowledge")}
          </p>
          <p className="text-fg-muted text-xs leading-relaxed">{t("notice")}</p>
        </div>
      </div>

      {/* Category selector */}
      <div className="space-y-2">
        <label className="text-fg-primary block text-sm font-semibold">{t("category")}</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              disabled={status !== "idle" && status !== "error"}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                category === cat.id
                  ? "bg-brand-500/10 text-brand-400 border-brand-500/30"
                  : "bg-bg-secondary border-border-subtle hover:border-border-strong text-fg-secondary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Provider Hint */}
      <div className="space-y-2">
        <label htmlFor="providerHint" className="text-fg-primary block text-sm font-semibold">
          {t("provider")}
        </label>
        <Input
          id="providerHint"
          value={providerHint}
          onChange={(e) => setProviderHint(e.target.value)}
          placeholder={t("providerHint")}
          disabled={status !== "idle" && status !== "error"}
          className="max-w-md"
        />
      </div>

      {/* Secret Message / Payload */}
      <div className="space-y-2">
        <label htmlFor="content" className="text-fg-primary block text-sm font-semibold">
          {t("content")}
        </label>
        <div className="relative">
          <textarea
            id="content"
            value={displayContent}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("placeholder_content")}
            disabled={status !== "idle" && status !== "error"}
            rows={8}
            className="bg-bg-secondary border-border-subtle focus:border-brand-500 text-fg-primary placeholder:text-fg-muted focus:ring-brand-500 w-full rounded-md border p-3 font-mono text-sm transition duration-150 ease-in-out outline-none focus:ring-1 disabled:opacity-80"
          />
          {status === "encrypting" && (
            <div className="bg-bg-primary/40 absolute inset-0 flex items-center justify-center rounded-md backdrop-blur-[1px]">
              <div className="bg-bg-tertiary border-border-strong flex items-center gap-2 rounded-md border px-4 py-2 shadow-lg">
                <div className="border-brand-500 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                <span className="text-brand-400 font-mono text-xs font-bold tracking-wider uppercase">
                  {t("encryptingPayload")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="bg-danger-500/10 border-danger-500/20 text-danger-400 flex items-start gap-2 rounded-md border p-3 text-xs leading-relaxed">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Button */}
      <Button
        type="submit"
        disabled={!content.trim() || status === "encrypting" || status === "submitting"}
        className="w-full min-w-[150px] sm:w-auto"
      >
        {status === "encrypting" ? (
          t("encrypting")
        ) : status === "submitting" ? (
          t("transmitting")
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            {t("encrypt")}
          </>
        )}
      </Button>
    </form>
  );
}
