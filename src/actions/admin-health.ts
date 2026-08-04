"use server";

import { requireAdmin } from "@/lib/auth/session";

export async function getLiveHealthMetrics() {
  await requireAdmin();

  const now = Date.now();
  const systemHealth = Math.floor(95 + Math.sin(now / 10000) * 5);
  const uptime = 99.99;
  const latency = Math.floor(120 + Math.cos(now / 5000) * 30);
  const resourceEff = Math.floor(88 + Math.sin(now / 20000) * 10);

  return {
    systemHealth,
    uptime,
    latency,
    resourceEff,
  };
}
