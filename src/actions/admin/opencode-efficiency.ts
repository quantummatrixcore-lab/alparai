"use server";

import fs from "fs";
import path from "path";
import { z } from "zod";
import {
  buildEfficiencyReport,
  type OpenCodeEfficiencyReport,
  type OpenCodeRunRecord,
} from "@/lib/opencode/efficiency";

const RUN_SCHEMA = z.object({
  model: z.string().min(1),
  exit_code: z.number(),
  duration_ms: z.number(),
  attempt_no: z.number().optional(),
  role: z.enum(["uygulayici", "teshisci", "dogrulayici"]).optional(),
  diagnosis: z.string().optional(),
  gates: z
    .object({
      lint: z.number(),
      typecheck: z.number(),
      test: z.number(),
      build: z.number(),
    })
    .optional(),
});

export async function getOpenCodeEfficiencyAction(): Promise<OpenCodeEfficiencyReport> {
  const dir = path.join(process.cwd(), "ops", "opencode-runs");
  const records: OpenCodeRunRecord[] = [];

  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw: unknown = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
        const parsed = RUN_SCHEMA.safeParse(raw);
        if (parsed.success) {
          records.push({
            model: parsed.data.model,
            exitCode: parsed.data.exit_code,
            durationMs: parsed.data.duration_ms,
            attemptNo: parsed.data.attempt_no,
            role: parsed.data.role,
            diagnosis: parsed.data.diagnosis,
            gates: parsed.data.gates,
          });
        }
      } catch {
        // skip malformed run files
      }
    }
  }

  return buildEfficiencyReport(records);
}
