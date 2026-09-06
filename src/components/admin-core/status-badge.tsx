"use client";

import React, { memo } from "react";
import { type SeverityLevel, type IncidentStatus, type EUAIActCategory } from "@/types/admin";

export interface StatusBadgeProps {
  type: "severity" | "status" | "compliance" | "tier" | "source";
  value: string;
  className?: string;
  showPing?: boolean;
}

export const StatusBadge = memo(function StatusBadge({
  type,
  value,
  className = "",
  showPing,
}: StatusBadgeProps) {
  let bg =
    "bg-[#f6f8fa] dark:bg-[#21262d] text-[#656d76] dark:text-[#8b949e] border-[#d0d7de] dark:border-[#30363d]";
  let dotColor = "bg-[#656d76] dark:text-[#8b949e]";
  let isPinging = showPing;

  if (type === "severity") {
    switch (value as SeverityLevel) {
      case "CRITICAL":
        bg =
          "bg-[#ffebe9] dark:bg-[#da3633]/20 text-[#cf222e] dark:text-[#ff7b72] border-[#ff8182]/40 dark:border-[#da3633]/40 shadow-sm dark:shadow-none";
        dotColor = "bg-[#cf222e] dark:bg-[#ff7b72]";
        if (isPinging === undefined) isPinging = true;
        break;
      case "HIGH":
        bg =
          "bg-[#fff8c5] dark:bg-[#9e6a03]/20 text-[#9a6700] dark:text-[#f0b72f] border-[#d4a72c]/40 dark:border-[#9e6a03]/40 shadow-sm dark:shadow-none";
        dotColor = "bg-[#9a6700] dark:bg-[#f0b72f]";
        break;
      case "MEDIUM":
        bg =
          "bg-[#ddf4ff] dark:bg-[#388bfd]/20 text-[#0969da] dark:text-[#58a6ff] border-[#54aeff]/40 dark:border-[#388bfd]/40";
        dotColor = "bg-[#0969da] dark:bg-[#58a6ff]";
        break;
      case "LOW":
        bg =
          "bg-[#f6f8fa] dark:bg-[#21262d] text-[#656d76] dark:text-[#8b949e] border-[#d0d7de] dark:border-[#30363d]";
        dotColor = "bg-[#656d76] dark:bg-[#8b949e]";
        break;
      case "INFORMATIONAL":
        bg =
          "bg-[#ddf4ff] dark:bg-[#388bfd]/20 text-[#0969da] dark:text-[#58a6ff] border-[#54aeff]/40 dark:border-[#388bfd]/40";
        dotColor = "bg-[#0969da] dark:bg-[#58a6ff]";
        break;
    }
  } else if (type === "status") {
    switch (value as IncidentStatus) {
      case "UNDER_TRIAGE":
        bg =
          "bg-[#fff8c5] dark:bg-[#9e6a03]/20 text-[#9a6700] dark:text-[#f0b72f] border-[#d4a72c]/40 dark:border-[#9e6a03]/40";
        dotColor = "bg-[#9a6700] dark:bg-[#f0b72f]";
        if (isPinging === undefined) isPinging = true;
        break;
      case "VERIFIED":
        bg =
          "bg-[#dafbe1] dark:bg-[#238636]/20 text-[#1a7f37] dark:text-[#3fb950] border-[#4ac26b]/40 dark:border-[#238636]/40";
        dotColor = "bg-[#1a7f37] dark:bg-[#3fb950]";
        break;
      case "DISPUTED":
        bg =
          "bg-[#fbefff] dark:bg-[#8957e5]/20 text-[#8250df] dark:text-[#d2a8ff] border-[#d8b9ff]/40 dark:border-[#8957e5]/40";
        dotColor = "bg-[#8250df] dark:bg-[#d2a8ff]";
        break;
      case "RESOLVED":
        bg =
          "bg-[#f6f8fa] dark:bg-[#21262d] text-[#656d76] dark:text-[#8b949e] border-[#d0d7de] dark:border-[#30363d]";
        dotColor = "bg-[#656d76] dark:bg-[#8b949e]";
        break;
    }
  } else if (type === "compliance") {
    switch (value as EUAIActCategory) {
      case "PROHIBITED_ART5":
        bg =
          "bg-[#ffebe9] dark:bg-[#da3633]/20 text-[#cf222e] dark:text-[#ff7b72] border-[#ff8182]/40 dark:border-[#da3633]/40 font-bold";
        dotColor = "bg-[#cf222e] dark:bg-[#ff7b72]";
        if (isPinging === undefined) isPinging = true;
        break;
      case "HIGH_RISK_ART6":
        bg =
          "bg-[#fff8c5] dark:bg-[#9e6a03]/20 text-[#9a6700] dark:text-[#f0b72f] border-[#d4a72c]/40 dark:border-[#9e6a03]/40 font-semibold";
        dotColor = "bg-[#9a6700] dark:bg-[#f0b72f]";
        break;
      case "GPAI_SYSTEMIC_ART51":
        bg =
          "bg-[#fbefff] dark:bg-[#8957e5]/20 text-[#8250df] dark:text-[#d2a8ff] border-[#d8b9ff]/40 dark:border-[#8957e5]/40 font-semibold";
        dotColor = "bg-[#8250df] dark:bg-[#d2a8ff]";
        break;
      case "TRANSPARENCY_ART50":
        bg =
          "bg-[#ddf4ff] dark:bg-[#388bfd]/20 text-[#0969da] dark:text-[#58a6ff] border-[#54aeff]/40 dark:border-[#388bfd]/40";
        dotColor = "bg-[#0969da] dark:bg-[#58a6ff]";
        break;
      case "COMPLIANT":
        bg =
          "bg-[#dafbe1] dark:bg-[#238636]/20 text-[#1a7f37] dark:text-[#3fb950] border-[#4ac26b]/40 dark:border-[#238636]/40 font-semibold";
        dotColor = "bg-[#1a7f37] dark:bg-[#3fb950]";
        break;
    }
  } else if (type === "source") {
    if (value === "HUMAN_WHISTLEBLOWER") {
      bg =
        "bg-[#dafbe1] dark:bg-[#238636]/20 text-[#1a7f37] dark:text-[#3fb950] border-[#4ac26b]/40 dark:border-[#238636]/40 font-semibold";
      dotColor = "bg-[#1a7f37] dark:bg-[#3fb950]";
    } else {
      bg =
        "bg-[#f6f8fa] dark:bg-[#21262d] text-[#656d76] dark:text-[#8b949e] border-[#d0d7de] dark:border-[#30363d]";
      dotColor = "bg-[#656d76] dark:bg-[#8b949e]";
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10.5px] font-medium tracking-wide uppercase backdrop-blur-md select-none ${bg} ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {isPinging && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotColor}`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotColor}`} />
      </span>
      <span className="truncate">{value.replace(/_/g, " ")}</span>
    </span>
  );
});
