"use server";

import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";
import { withAutopilot, exportDataPolicy } from "@/lib/autopilot";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { hashIp } from "@/lib/utils/hash";
import { headers } from "next/headers";
import type { AttemptContext, AttemptOutcome } from "@/lib/autopilot";

type IncidentRow = Database["public"]["Tables"]["incidents"]["Row"];
type AuditLogRow = Database["public"]["Tables"]["audit_log"]["Row"];

interface IncidentExportInput {
  adminId: string;
}

const runIncidentsExportWork = async (
  _ctx: AttemptContext,
  data: IncidentExportInput,
): Promise<AttemptOutcome<{ csv: string; rowCount: number }>> => {
  const db = createAdminClient();
  const { data: rawData, error } = await db
    .from("incidents")
    .select("id, title_masked, category, severity, status, created_at, published_at")
    .order("created_at", { ascending: false })
    .limit(10000);
  if (error) {
    return { kind: "retryable", error: error.message };
  }
  const rows =
    (rawData as unknown as
      | Pick<
          IncidentRow,
          "id" | "title_masked" | "category" | "severity" | "status" | "created_at" | "published_at"
        >[]
      | null) ?? [];
  void data;
  const headers = ["id", "title", "category", "severity", "status", "created_at", "published_at"];
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.id,
        `"${(row.title_masked ?? "").replace(/"/g, '""')}"`,
        row.category,
        row.severity,
        row.status,
        row.created_at,
        row.published_at ?? "",
      ].join(","),
    ),
  ].join("\n");
  return { kind: "success", value: { csv, rowCount: rows.length } };
};

export async function exportIncidentsCSV(): Promise<{ ok: boolean; csv?: string; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.export_request}:${admin.id}:${ip ?? "anon"}`);
  if (!rl.ok) {
    return { ok: false, error: `Too many exports. Try again in ${rl.retryAfter}s.` };
  }
  const result = await withAutopilot<{ csv: string; rowCount: number }>(
    exportDataPolicy,
    ["incidents", admin.id],
    (ctx) => runIncidentsExportWork(ctx, { adminId: admin.id }),
    { context: { userId: admin.id, ipHash: hashIp(ip), clientIdempotencyKey: null } },
  );
  if (result.kind === "ok" || result.kind === "replayed") {
    if (result.kind === "ok") return { ok: true, csv: result.value.csv };
    return { ok: true, csv: "" };
  }
  return { ok: false, error: "Export failed" };
}

interface AuditExportInput {
  adminId: string;
}

const runAuditExportWork = async (
  _ctx: AttemptContext,
  data: AuditExportInput,
): Promise<AttemptOutcome<{ csv: string; rowCount: number }>> => {
  const db = createAdminClient();
  const { data: rawData, error } = await db
    .from("audit_log")
    .select("id, actor_id, action, entity_type, entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(10000);
  if (error) {
    return { kind: "retryable", error: error.message };
  }
  const rows =
    (rawData as unknown as
      | Pick<
          AuditLogRow,
          "id" | "actor_id" | "action" | "entity_type" | "entity_id" | "created_at"
        >[]
      | null) ?? [];
  void data;
  const headers = ["id", "actor_id", "action", "entity_type", "entity_id", "created_at"];
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      [row.id, row.actor_id ?? "", row.action, row.entity_type, row.entity_id, row.created_at].join(
        ",",
      ),
    ),
  ].join("\n");
  return { kind: "success", value: { csv, rowCount: rows.length } };
};

export async function exportAuditLogCSV(): Promise<{ ok: boolean; csv?: string; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.export_request}:${admin.id}:${ip ?? "anon"}`);
  if (!rl.ok) {
    return { ok: false, error: `Too many exports. Try again in ${rl.retryAfter}s.` };
  }
  const result = await withAutopilot<{ csv: string; rowCount: number }>(
    exportDataPolicy,
    ["audit_log", admin.id],
    (ctx) => runAuditExportWork(ctx, { adminId: admin.id }),
    { context: { userId: admin.id, ipHash: hashIp(ip), clientIdempotencyKey: null } },
  );
  if (result.kind === "ok" || result.kind === "replayed") {
    if (result.kind === "ok") return { ok: true, csv: result.value.csv };
    return { ok: true, csv: "" };
  }
  return { ok: false, error: "Export failed" };
}
