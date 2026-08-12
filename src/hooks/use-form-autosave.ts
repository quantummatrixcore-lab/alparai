"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseFormAutosaveOptions<T extends Record<string, unknown>> {
  key: string;
  values: T;
  onRestore: (values: T) => void;
  onRestoreNotify?: () => void;
  enabled?: boolean;
}

function getStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded – silently ignore */
  }
}

export function clearDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function useFormAutosave<T extends Record<string, unknown>>({
  key,
  values,
  onRestore,
  onRestoreNotify,
  enabled = true,
}: UseFormAutosaveOptions<T>): void {
  const restoredRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onRestoreRef = useRef(onRestore);
  const onRestoreNotifyRef = useRef(onRestoreNotify);

  useEffect(() => {
    onRestoreRef.current = onRestore;
    onRestoreNotifyRef.current = onRestoreNotify;
  });

  useEffect(() => {
    if (!enabled || restoredRef.current) return;
    restoredRef.current = true;

    const saved = getStorage<T>(key);
    if (!saved) return;

    const hasContent = Object.values(saved).some((v) => {
      if (typeof v === "string") return v.trim().length > 0;
      if (typeof v === "boolean") return v;
      return false;
    });

    if (!hasContent) return;

    onRestoreRef.current(saved);
    onRestoreNotifyRef.current?.();
  }, [key, enabled]);

  useEffect(() => {
    if (!enabled) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setStorage(key, values);
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, values, enabled]);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    clearDraft(key);
  }, [key]);

  useEffect(() => cleanup, [cleanup]);
}
