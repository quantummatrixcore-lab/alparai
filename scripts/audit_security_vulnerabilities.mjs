import fs from 'fs';
import path from 'path';

const migrationsDir = 'D:/01_SaaS_Products/Alparai/supabase/migrations';
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

const findings = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

  // Check for RLS policies
  const policyRegex = /CREATE\s+POLICY\s+["']?([^"'\n]+)["']?\s+ON\s+([a-zA-Z0-9_\.]+)([\s\S]*?);/gi;
  let match;
  while ((match = policyRegex.exec(content)) !== null) {
    const policyName = match[1];
    const target = match[2];
    const body = match[3];

    // Check FOR command
    let cmd = 'ALL';
    const cmdMatch = body.match(/FOR\s+([A-Z]+)/i);
    if (cmdMatch) cmd = cmdMatch[1].toUpperCase();

    // Check TO roles
    let toRoles = 'public';
    const toMatch = body.match(/TO\s+([a-zA-Z0-9_,\s]+?)(?=\s+USING|\s+WITH\s+CHECK|$)/i);
    if (toMatch) toRoles = toMatch[1].trim();

    // Check USING
    let usingClause = '';
    const usingMatch = body.match(/USING\s*\(([\s\S]*?)\)(?=\s*WITH\s+CHECK|$)/i);
    if (usingMatch) usingClause = usingMatch[1].trim();

    // Check WITH CHECK
    let checkClause = '';
    const checkMatch = body.match(/WITH\s+CHECK\s*\(([\s\S]*?)\)$/i);
    if (checkMatch) checkClause = checkMatch[1].trim();

    // 1. Check for unbounded UPDATE / DELETE
    if (['UPDATE', 'DELETE', 'ALL'].includes(cmd)) {
      if (usingClause === 'true' || usingClause === '1=1') {
        findings.push({
          severity: 'HIGH',
          type: 'UNRESTRICTED_WRITE',
          target,
          policyName,
          cmd,
          toRoles,
          file,
          detail: `USING clause is explicitly '${usingClause}', allowing any user/role to mutate all rows.`
        });
      } else if (target === 'storage.objects' && !usingClause.includes('auth.uid()') && !usingClause.includes('is_moderator') && !usingClause.includes('is_admin')) {
        findings.push({
          severity: 'MEDIUM',
          type: 'STORAGE_UNRESTRICTED_MUTATE',
          target,
          policyName,
          cmd,
          toRoles,
          file,
          detail: `Storage policy allows update/delete across entire bucket without folder/ownership restriction: "${usingClause}"`
        });
      }
    }

    // 2. Check for recursive RLS or inefficient subqueries
    if (usingClause.includes('FROM users') && target.toLowerCase().includes('users')) {
      findings.push({
        severity: 'LOW',
        type: 'POTENTIAL_RLS_RECURSION',
        target,
        policyName,
        cmd,
        toRoles,
        file,
        detail: 'Policy on users table queries users table directly, which can trigger RLS recursion unless SECURITY DEFINER function is used.'
      });
    }

    // 3. Check for public SELECT on sensitive tables
    const sensitiveTables = ['api_keys', 'user_api_keys', 'admin_login_events', 'audit_log', 'audit_logs', 'cease_and_desist_logs', 'dsar_requests', 'whistleblower_submissions', 'outreach_queue', 'email_sent_logs', 'cron_job_logs'];
    const cleanTarget = target.replace('public.', '').toLowerCase();
    if (sensitiveTables.includes(cleanTarget) && ['SELECT', 'ALL'].includes(cmd)) {
      if (usingClause === 'true' || toRoles.includes('public') || toRoles.includes('anon')) {
        // If not restricted to admin
        if (!usingClause.includes('is_admin') && !usingClause.includes('is_moderator') && !usingClause.includes('auth.uid()') && !usingClause.includes('service_role')) {
          findings.push({
            severity: 'CRITICAL',
            type: 'SENSITIVE_DATA_EXPOSURE',
            target,
            policyName,
            cmd,
            toRoles,
            file,
            detail: `Sensitive table '${cleanTarget}' has open or permissive SELECT policy for non-admin roles: "${usingClause}"`
          });
        }
      }
    }
  }
}

console.log(`\n======================================================`);
console.log(`   SECURITY VULNERABILITY AUDIT FINDINGS (${findings.length})`);
console.log(`======================================================`);

for (const f of findings) {
  console.log(`[${f.severity}] ${f.type} on ${f.target}`);
  console.log(`  Policy: "${f.policyName}" (${f.cmd})`);
  console.log(`  File: ${f.file}`);
  console.log(`  Detail: ${f.detail}`);
  console.log(`---`);
}

fs.writeFileSync('D:/01_SaaS_Products/Alparai/scratch/security_findings.json', JSON.stringify(findings, null, 2));
