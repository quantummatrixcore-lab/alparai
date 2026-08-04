"use client";

import { useState } from "react";
import Image from "next/image";

interface ProviderLogoProps {
  src: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_NUMBERS = {
  sm: 32,
  md: 48,
  lg: 64,
} as const;

function hashStringToColor(name: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palettes = [
    { bg: "from-brand-500/30 to-brand-700/30", fg: "text-brand-300" },
    { bg: "from-purple-500/30 to-pink-500/30", fg: "text-purple-300" },
    { bg: "from-blue-500/30 to-cyan-500/30", fg: "text-blue-300" },
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
  size = "md",
  className,
}: ProviderLogoProps & { className?: string }) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);
  const palette = hashStringToColor(name);
  const sizePx = SIZE_NUMBERS[size];

  if (!src || imgError) {
    return (
      <div
        className={`flex items-center justify-center rounded-md font-black tracking-tight ${palette.bg} ${palette.fg} h-full w-full ${className || ""}`}
        aria-label={`${name} logo placeholder`}
      >
        <span className={size === "sm" ? "text-xs" : size === "lg" ? "text-xl" : "text-base"}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`${name} logo`}
      width={sizePx}
      height={sizePx}
      unoptimized
      className={`h-full w-full rounded-md object-contain p-1.5 ${className || ""}`}
      onError={() => setImgError(true)}
    />
  );
}
