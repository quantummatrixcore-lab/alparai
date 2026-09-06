"use client";

import { useState } from "react";
import Image from "next/image";
import { ProviderVectorIcon, hasProviderIcon } from "./provider-icons";

export interface ProviderLogoProps {
  src?: string | null;
  name: string;
  slug?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showBadge?: boolean;
}

const SIZE_NUMBERS = {
  xs: 20,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80,
} as const;

function hashStringToColor(name: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palettes = [
    { bg: "from-brand-500/30 to-brand-700/30", fg: "text-brand-300" },
    { bg: "from-purple-500/30 to-pink-500/30", fg: "text-purple-300" },
    { bg: "from-cyan-500/30 to-blue-500/30", fg: "text-cyan-300" },
    { bg: "from-emerald-500/30 to-teal-500/30", fg: "text-emerald-300" },
    { bg: "from-amber-500/30 to-orange-500/30", fg: "text-amber-300" },
    { bg: "from-rose-500/30 to-red-500/30", fg: "text-rose-300" },
    { bg: "from-indigo-500/30 to-violet-500/30", fg: "text-indigo-300" },
    { bg: "from-fuchsia-500/30 to-pink-500/30", fg: "text-fuchsia-300" },
  ];
  const idx = Math.abs(hash) % palettes.length;
  const palette = palettes[idx] ?? palettes[0];
  if (!palette)
    return { bg: "bg-gradient-to-br from-brand-500/30 to-brand-700/30", fg: "text-brand-300" };
  return { bg: `bg-gradient-to-br ${palette.bg}`, fg: palette.fg };
}

function getInitials(name: string): string {
  const cleaned = name.replace(/[^\p{L}\p{N}\s]/gu, "").trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

export function ProviderLogo({
  src,
  name,
  slug,
  size = "md",
  className = "",
}: ProviderLogoProps) {
  const [imgError, setImgError] = useState(false);
  const sizePx = SIZE_NUMBERS[size] || 48;
  const hasIcon = hasProviderIcon(slug || name);

  // 1. Prioritize built-in vector component for pixel-perfect instant rendering & zero broken images
  if (hasIcon) {
    return (
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-md p-1 transition-transform duration-300 hover:scale-105 ${className}`}
        title={name}
      >
        <ProviderVectorIcon nameOrSlug={slug || name} size="100%" className="h-full w-full object-contain" />
      </div>
    );
  }

  // 2. If a custom URL is provided and not errored, render Next.js Image
  if (src && !imgError) {
    return (
      <div className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-md p-1 ${className}`}>
        <Image
          src={src}
          alt={`${name} logo`}
          width={sizePx}
          height={sizePx}
          unoptimized
          className="h-full w-full rounded-md object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // 3. Fallback: Refined dynamic initials badge with ambient glow
  const initials = getInitials(name);
  const palette = hashStringToColor(name);
  const fontSize =
    size === "xs"
      ? "text-[9px]"
      : size === "sm"
        ? "text-xs"
        : size === "lg"
          ? "text-xl"
          : size === "xl"
            ? "text-2xl"
            : "text-base";

  return (
    <div
      className={`flex items-center justify-center rounded-md font-black tracking-tight ${palette.bg} ${palette.fg} h-full w-full border border-border-subtle shadow-inner ${className}`}
      aria-label={`${name} logo placeholder`}
      title={name}
    >
      <span className={fontSize}>{initials}</span>
    </div>
  );
}