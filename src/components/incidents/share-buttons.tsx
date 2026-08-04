"use client";

import * as React from "react";
import { useState } from "react";
import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import { logger } from "@/lib/utils/logger";

// High-fidelity brand SVG icons
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export function ShareButtons({
  url,
  title,
  className,
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const t = useTranslations("incident");
  const [copied, setCopied] = useState(false);
  const [instaCopied, setInstaCopied] = useState(false);

  const fullUrl = React.useMemo(() => {
    if (typeof window === "undefined") return url;
    return `${window.location.origin}${url}`;
  }, [url]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      trackEvent("Incident Shared", { platform: "copy" });
      toast.success(t("share_copy") + " ✓");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error("Clipboard copy failed", undefined, err instanceof Error ? err : undefined);
      toast.error("Copy failed");
    }
  };

  const onCopyInstagram = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setInstaCopied(true);
      trackEvent("Incident Shared", { platform: "instagram" });
      toast.success(t("share_instagram") + " ✓");
      setTimeout(() => setInstaCopied(false), 2000);
    } catch (err) {
      logger.error("Instagram copy failed", undefined, err instanceof Error ? err : undefined);
      toast.error("Copy failed");
    }
  };

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`;
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + fullUrl)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 15 } },
  };

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <p className="text-fg-muted flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
        <Share2 className="text-brand-400 h-3.5 w-3.5" />
        {t("share")}
      </p>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap items-center gap-2"
      >
        {/* X (formerly Twitter) */}
        <motion.a
          variants={itemVariants}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          href={xUrl}
          target="_blank"
          rel="noreferrer noopener"
          onClick={() => trackEvent("Incident Shared", { platform: "x" })}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black text-white shadow-sm transition-all duration-200 hover:border-white/40 hover:bg-neutral-900 hover:shadow-white/10"
          aria-label={t("share_x")}
        >
          <XIcon className="h-4 w-4" />
        </motion.a>

        {/* LinkedIn */}
        <motion.a
          variants={itemVariants}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          href={liUrl}
          target="_blank"
          rel="noreferrer noopener"
          onClick={() => trackEvent("Incident Shared", { platform: "linkedin" })}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#0077b5]/30 bg-[#0077b5]/10 text-[#0077b5] shadow-sm backdrop-blur-md transition-all duration-200 hover:border-[#0077b5]/50 hover:bg-[#0077b5]/20 hover:shadow-[#0077b5]/20"
          aria-label={t("share_linkedin")}
        >
          <LinkedInIcon className="h-4 w-4" />
        </motion.a>

        {/* Instagram (Copy & Notify) */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCopyInstagram}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e1306c]/30 bg-gradient-to-tr from-[#f9ce34]/15 via-[#ee2a7b]/15 to-[#6228d7]/15 text-[#e1306c] shadow-sm backdrop-blur-md transition-all duration-200 hover:border-[#e1306c]/50 hover:from-[#f9ce34]/25 hover:via-[#ee2a7b]/25 hover:to-[#6228d7]/25 hover:shadow-[#e1306c]/20",
            instaCopied && "border-[#e1306c]/60 bg-[#e1306c]/30",
          )}
          aria-label={t("share_instagram")}
        >
          {instaCopied ? <Check className="h-4 w-4" /> : <InstagramIcon className="h-4 w-4" />}
        </motion.button>

        {/* Facebook */}
        <motion.a
          variants={itemVariants}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          href={fbUrl}
          target="_blank"
          rel="noreferrer noopener"
          onClick={() => trackEvent("Incident Shared", { platform: "facebook" })}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#1877f2]/30 bg-[#1877f2]/10 text-[#1877f2] shadow-sm backdrop-blur-md transition-all duration-200 hover:border-[#1877f2]/50 hover:bg-[#1877f2]/20 hover:shadow-[#1877f2]/20"
          aria-label={t("share_facebook")}
        >
          <FacebookIcon className="h-4 w-4" />
        </motion.a>

        {/* WhatsApp */}
        <motion.a
          variants={itemVariants}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          href={waUrl}
          target="_blank"
          rel="noreferrer noopener"
          onClick={() => trackEvent("Incident Shared", { platform: "whatsapp" })}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#25d366]/30 bg-[#25d366]/10 text-[#25d366] shadow-sm backdrop-blur-md transition-all duration-200 hover:border-[#25d366]/50 hover:bg-[#25d366]/20 hover:shadow-[#25d366]/20"
          aria-label={t("share_whatsapp")}
        >
          <WhatsAppIcon className="h-4 w-4" />
        </motion.a>

        {/* Copy Link */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCopy}
          className={cn(
            "text-fg-secondary inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-neutral-900/60 backdrop-blur-md transition-colors duration-200",
            copied
              ? "border-cyan-500/40 bg-cyan-500/20 text-cyan-400"
              : "hover:border-cyan-500/20 hover:bg-cyan-500/10 hover:text-cyan-400",
          )}
          aria-label={t("share_copy")}
        >
          {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
        </motion.button>
      </motion.div>
    </div>
  );
}
