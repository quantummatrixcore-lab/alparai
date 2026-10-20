/**
 * Backfill: evidence_hash'i boş olan incidents satırlarını aynı formülle mühürler.
 *
 * Çalıştırma (SUNUCUDA, migration 0009 uygulandıktan SONRA):
 *   pnpm backfill:evidence
 *
 * Formül importer ile birebir aynıdır (computeEvidenceHash) — tekrar import
 * edilen kayıtların hash'i değişmez, upsert stabil kalır.
 */
import { createAdminClient } from "../src/lib/dehost/admin";
import { computeEvidenceHash } from "../src/lib/import/incident-importer";

const PAGE = 500;

async function main(): Promise<void> {
  const admin = createAdminClient();
  let updated = 0;
  let scanned = 0;
  for (;;) {
    const { data, error } = await admin
      .from("incidents")
      .select("id,incident_source,import_external_id,title")
      .is("evidence_hash", null)
      .limit(PAGE);
    if (error) throw new Error(`select failed: ${error.message}`);
    const rows = (data ?? []) as Array<{
      id: string;
      incident_source?: string | null;
      import_external_id?: string | null;
      title?: string | null;
    }>;
    if (rows.length === 0) break;
    scanned += rows.length;
    for (const r of rows) {
      const hash = computeEvidenceHash({
        source: r.incident_source ?? "unknown",
        externalId: r.import_external_id,
        title: r.title,
      });
      const { error: uerr } = await admin
        .from("incidents")
        .update({ evidence_hash: hash })
        .eq("id", r.id);
      if (uerr) throw new Error(`update failed for ${r.id}: ${uerr.message}`);
      updated += 1;
    }
    // eslint-disable-next-line no-console
    console.log(`backfill progress: scanned=${scanned} updated=${updated}`);
    if (rows.length < PAGE) break;
  }
  // eslint-disable-next-line no-console
  console.log(`backfill done: scanned=${scanned} updated=${updated}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
