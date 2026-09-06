import "server-only";
import { z } from "zod";
import { logger } from "@/lib/utils/logger";

const RuleViolationSchema = z.object({
  ruleId: z.string().min(1),
  agentId: z.string().min(1),
  severity: z.enum(["warn", "error", "critical"]),
  message: z.string().min(1),
  context: z.record(z.string(), z.unknown()).optional(),
});

export type RuleViolation = z.infer<typeof RuleViolationSchema>;

export function logRuleViolation(input: RuleViolation): void {
  const parsed = RuleViolationSchema.safeParse(input);
  if (!parsed.success) {
    logger.error("[RuleLogger] Invalid rule violation payload", {
      validationErrors: parsed.error.flatten(),
    });
    return;
  }
  const { ruleId, agentId, severity, message, context } = parsed.data;
  const payload = { ruleId, agentId, message, context };
  if (severity === "critical") {
    logger.error(`[RuleViolation] CRITICAL: ${ruleId} — ${agentId}`, payload);
  } else if (severity === "error") {
    logger.error(`[RuleViolation] ERROR: ${ruleId} — ${agentId}`, payload);
  } else {
    logger.warn(`[RuleViolation] WARN: ${ruleId} — ${agentId}`, payload);
  }
}
