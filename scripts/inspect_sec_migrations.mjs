import fs from 'fs';
import path from 'path';

const migrationsDir = 'D:/01_SaaS_Products/Alparai/supabase/migrations';
const secFiles = [
  '20260605000002_rls_policies.sql',
  '20260623000000_rls_and_column_security.sql',
  '20260704000002_incidents_column_security.sql',
  '20260723000000_rls_emergency_hardening.sql',
  '20260727000002_harden_rls_policies.sql',
  '20260807000000_harden_audit_log_rls.sql',
  '20260816000000_fix_p0_rls_is_admin.sql',
  '20260914000000_harden_decashub_rls.sql',
  '20260914000002_enforce_rls_on_all.sql',
  '20260915000000_storage_and_pii_rls_hardening.sql',
  '20260916000000_enforce_rls_all.sql'
];

for (const sf of secFiles) {
  const p = path.join(migrationsDir, sf);
  if (fs.existsSync(p)) {
    console.log(`\n======================================================`);
    console.log(`FILE: ${sf}`);
    console.log(`======================================================`);
    console.log(fs.readFileSync(p, 'utf8'));
  }
}
