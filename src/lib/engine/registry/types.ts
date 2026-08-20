import { z } from "zod";

export const ServiceRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["healthy", "degraded", "down", "unknown"]),
  type: z.enum(["api", "cron", "agent", "mcp", "ai", "db"]),
  lastHeartbeat: z.string().nullable(),
  lastError: z.string().nullable(),
  uptime: z.number().nullable(),
  healthEndpoint: z.string().nullable(),
});

export type ServiceRecord = z.infer<typeof ServiceRecordSchema>;

export const BreakerSnapshotSchema = z.object({
  serviceId: z.string(),
  state: z.enum(["closed", "open", "half_open"]),
  failureCount: z.number(),
  threshold: z.number(),
  cooldownMs: z.number(),
  lastFailure: z.string().nullable(),
});

export type BreakerSnapshot = z.infer<typeof BreakerSnapshotSchema>;

export const RegistryReportSchema = z.object({
  services: z.array(ServiceRecordSchema),
  breakers: z.array(BreakerSnapshotSchema),
  lastUpdated: z.string(),
  healthyCount: z.number(),
  totalCount: z.number(),
});

export type RegistryReport = z.infer<typeof RegistryReportSchema>;
