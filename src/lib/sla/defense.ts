import "server-only";

// FAZ1: B2B Due Process — 30 günlük savunma penceresi.
// Vaka yayınlanmadan önce şirketin savunma hakkı; süre dolmadan ifşa yok.

export const DEFENSE_WINDOW_DAYS = 30;

export interface DefenseWindow {
  openedAt: string;
  dueAt: string;
  remainingMs: number;
  expired: boolean;
  canPublish: boolean;
}

export function defenseWindow(openedAt: string, now: Date = new Date()): DefenseWindow {
  const base = new Date(openedAt).getTime();
  const start = Number.isFinite(base) ? base : now.getTime();
  const due = start + DEFENSE_WINDOW_DAYS * 86_400_000;
  const remaining = due - now.getTime();
  return {
    openedAt: new Date(start).toISOString(),
    dueAt: new Date(due).toISOString(),
    remainingMs: remaining,
    expired: remaining <= 0,
    canPublish: remaining <= 0,
  };
}
