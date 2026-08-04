import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import { recordHeartbeat } from "@/lib/engine-registry";

export function withCronLogger<REQ extends Request, RES extends Response>(
  cronName: string,
  handler: (request: REQ) => Promise<RES>,
) {
  return async (request: REQ): Promise<RES> => {
    // Skip database logging in tests to avoid breaking sequential mock expectations,
    // except when running the cron-logger's own unit tests.
    const isCronTest =
      typeof request?.headers?.get === "function"
        ? request.headers.get("x-cron-test") === "true"
        : false;

    if (process.env.VITEST === "true" && !isCronTest) {
      try {
        const response = await handler(request);
        const serviceId = `cron-${cronName.replace(/_/g, "-")}`;
        await recordHeartbeat(
          serviceId,
          response.status >= 400 ? `Status ${response.status}` : undefined,
        );
        return response;
      } catch (err) {
        const serviceId = `cron-${cronName.replace(/_/g, "-")}`;
        await recordHeartbeat(serviceId, err instanceof Error ? err.message : String(err));
        throw err;
      }
    }

    const supabase = createAdminClient();
    let logId: string | null = null;
    const startedAt = new Date().toISOString();

    try {
      const { data, error } = await supabase
        .from("cron_job_logs" as never)
        .insert({
          cron_name: cronName,
          started_at: startedAt,
          status: "running",
          execution_metadata: {
            method: request.method || "GET",
            url: request.url || "",
          },
        } as never)
        .select("id")
        .single();

      if (error) {
        logger.error(`[CronLogger] Failed to insert initial log for ${cronName}`, { error });
      } else if (data) {
        logId = String((data as Record<string, unknown>).id);
      }
    } catch (_e) {
      logger.error(
        `[CronLogger] Error starting log for ${cronName}`,
        undefined,
        _e instanceof Error ? _e : undefined,
      );
    }

    try {
      const response = await handler(request);

      const completedAt = new Date().toISOString();
      const status = response.status >= 400 ? "failed" : "success";

      const serviceId = `cron-${cronName.replace(/_/g, "-")}`;
      await recordHeartbeat(
        serviceId,
        response.status >= 400 ? `Status ${response.status}` : undefined,
      );

      if (logId) {
        await supabase
          .from("cron_job_logs" as never)
          .update({
            completed_at: completedAt,
            status,
            execution_metadata: {
              status_code: response.status,
            },
          } as never)
          .eq("id", logId);
      }

      return response;
    } catch (err) {
      const completedAt = new Date().toISOString();
      const errorMessage = err instanceof Error ? err.message : String(err);

      const serviceId = `cron-${cronName.replace(/_/g, "-")}`;
      await recordHeartbeat(serviceId, errorMessage);

      logger.error(
        `[CronLogger] Cron ${cronName} failed`,
        undefined,
        err instanceof Error ? err : undefined,
      );

      if (logId) {
        await supabase
          .from("cron_job_logs" as never)
          .update({
            completed_at: completedAt,
            status: "failed",
            error_message: errorMessage,
          } as never)
          .eq("id", logId);
      }

      throw err;
    }
  };
}
