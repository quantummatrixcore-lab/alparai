import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

interface RetentionPolicy {
  table_name: string;
  retention_period_months: number;
}

export async function getRetentionPolicies(): Promise<RetentionPolicy[]> {
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from("data_retention_policies")
    .select("table_name, retention_period_months");

  if (error) {
    throw new Error(`Failed to fetch retention policies: ${error.message}`);
  }
  return (data as RetentionPolicy[]) ?? [];
}

export async function pruneExpiredRecords(
  tableName: string,
  retentionMonths: number,
): Promise<number> {
  const admin = createAdminClient();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - retentionMonths);

  const { data, error } = await admin
    .from(tableName as never)
    .delete()
    .lte("created_at", cutoff.toISOString())
    .select("id");

  if (error) {
    throw new Error(
      `Failed to prune ${tableName} (retention: ${retentionMonths}m): ${error.message}`,
    );
  }
  return data?.length ?? 0;
}
