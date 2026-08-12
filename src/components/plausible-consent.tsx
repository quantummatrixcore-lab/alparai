"use client";

import { useEffect } from "react";

const COOKIE_KEY = "alpar_cookie_consent";

export function PlausibleWithConsent() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(COOKIE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.consent?.analytics) return;
      const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "alparai.com";
      const script = document.createElement("script");
      script.defer = true;
      script.setAttribute("data-domain", domain);
      script.src = "https://plausible.io/js/script.js";
      document.head.appendChild(script);
    } catch (e) {
      console.error("Ignored error:", e);
    }
  }, []);

  return null;
}
