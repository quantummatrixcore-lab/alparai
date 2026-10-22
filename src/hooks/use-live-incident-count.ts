"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface UseLiveIncidentCountOptions {
  initialCount: number;
  minIntervalMs?: number;
  maxIntervalMs?: number;
  syncIntervalMs?: number;
}

interface UseLiveIncidentCountReturn {
  count: number;
  isPulsing: boolean;
  isLive: boolean;
}

export function useLiveIncidentCount({
  initialCount,
  minIntervalMs = 15000,
  maxIntervalMs = 30000,
  syncIntervalMs = 60000,
}: UseLiveIncidentCountOptions): UseLiveIncidentCountReturn {
  const [count, setCount] = useState<number>(initialCount);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);

  const countRef = useRef<number>(initialCount);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync ref with state
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  // Update count when initialCount prop increases (e.g. server re-render)
  useEffect(() => {
    if (initialCount > countRef.current) {
      setCount(initialCount);
      countRef.current = initialCount;
    }
  }, [initialCount]);

  const triggerPulse = useCallback(() => {
    setIsPulsing(true);
    if (pulseTimerRef.current) {
      clearTimeout(pulseTimerRef.current);
    }
    pulseTimerRef.current = setTimeout(() => {
      setIsPulsing(false);
    }, 1200);
  }, []);

  const incrementCount = useCallback(() => {
    // Only increment when document is visible
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      return;
    }
    setCount((prev) => {
      const next = prev + 1;
      countRef.current = next;
      return next;
    });
    triggerPulse();
  }, [triggerPulse]);

  // Background fetch from /api/v1/stats
  const syncWithServer = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/stats", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { data?: { total_incidents?: number } };
      const serverTotal = data?.data?.total_incidents;
      if (typeof serverTotal === "number" && serverTotal > countRef.current) {
        setCount(serverTotal);
        countRef.current = serverTotal;
        triggerPulse();
      }
    } catch {
      // Non-blocking telemetry silence
    }
  }, [triggerPulse]);

  useEffect(() => {
    setIsLive(true);

    let tickerTimeout: ReturnType<typeof setTimeout> | null = null;
    let syncInterval: ReturnType<typeof setInterval> | null = null;
    let isMounted = true;

    // Random interval between minIntervalMs and maxIntervalMs
    const scheduleNextIncrement = () => {
      if (!isMounted) return;
      const delay = Math.floor(
        Math.random() * (maxIntervalMs - minIntervalMs + 1) + minIntervalMs,
      );
      tickerTimeout = setTimeout(() => {
        incrementCount();
        scheduleNextIncrement();
      }, delay);
    };

    scheduleNextIncrement();

    // Periodic sync with /api/v1/stats
    syncInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        void syncWithServer();
      }
    }, syncIntervalMs);

    // Sync immediately when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncWithServer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      if (tickerTimeout) clearTimeout(tickerTimeout);
      if (syncInterval) clearInterval(syncInterval);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [minIntervalMs, maxIntervalMs, syncIntervalMs, incrementCount, syncWithServer]);

  return {
    count,
    isPulsing,
    isLive,
  };
}
