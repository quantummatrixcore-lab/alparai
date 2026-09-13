import { readFile } from "fs/promises";
import { join } from "path";
import { logger } from "@/lib/utils/logger";
import { HEARTBEATS } from "./state";

const dehostCronRoutes: { path: string; schedule: string }[] = [];

export async function loadCronRoutes(): Promise<{ path: string; schedule: string }[]> {
  if (dehostCronRoutes.length > 0) return dehostCronRoutes;
  try {
    const raw = await readFile(join(process.cwd(), "dehost.json"), "utf-8");
    const config = JSON.parse(raw);
    if (config.crons) {
      dehostCronRoutes.push(...config.crons);
    }
  } catch (err) {
    logger.error(
      "[EngineRegistry] Failed to load dehost.json crons",
      undefined,
      err instanceof Error ? err : undefined,
    );
  }
  return dehostCronRoutes;
}

export async function getCronStatus(): Promise<
  { path: string; schedule: string; lastRun: string | null; ok: boolean; id: string }[]
> {
  const routes = await loadCronRoutes();
  return routes.map((r) => {
    const id = r.path.replace("/api/cron/", "cron-").replace(/[?&]/g, "-");
    const hb = HEARTBEATS.get(id);
    return {
      ...r,
      lastRun: hb?.lastSeen ? new Date(hb.lastSeen).toISOString() : null,
      ok: !hb?.lastError,
      id,
    };
  });
}
