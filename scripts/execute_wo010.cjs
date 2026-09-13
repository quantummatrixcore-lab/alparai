const fs = require('fs');
const m01 = 'dehost/migrations/0001_full_schema.sql';
const m02 = 'dehost/migrations/0002_rls_policies.sql';
let sql1 = fs.readFileSync(m01, 'utf8');
let sql2 = fs.readFileSync(m02, 'utf8');

const lines1 = sql1.split('\n');
let newLines1 = [];
for (let i = 0; i < lines1.length; i++) {
  const m = lines1[i].match(/^(\s*)for\s+(select|insert|update|delete|all|to)\b/i);
  if (m && !lines1[i-1].match(/CREATE POLICY/i)) {
    const body = lines1[i].trim();
    const regexStr = 'CREATE POLICY [^;]+' + body.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\^\$\|]/g, '\\$&');
    const match = sql2.match(new RegExp(regexStr, 'i'));
    if (match) {
      const header = match[0].split('\n')[0];
      newLines1.push(m[1] + 'DROP POLICY IF EXISTS "' + header.match(/"([^"]+)"/)[1] + '" ON ' + header.match(/ON\s+([^\s]+)/i)[1] + ';');
      newLines1.push(m[1] + header);
    }
  }
  newLines1.push(lines1[i]);
}
sql1 = newLines1.join('\n');

if (!sql1.includes('CREATE TABLE IF NOT EXISTS public.linkedin_contacts')) {
  const t = CREATE TABLE IF NOT EXISTS public.linkedin_contacts (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  full_name text NOT NULL,\n  title text,\n  company text,\n  profile_url text,\n  category text,\n  status text NOT NULL DEFAULT 'to_add' CHECK (status IN ('to_add','added','messaged','responded')),\n  priority integer NOT NULL DEFAULT 3,\n  notes text,\n  created_at timestamptz NOT NULL DEFAULT now(),\n  updated_at timestamptz NOT NULL DEFAULT now()\n);;
  sql1 = sql1.replace('INSERT INTO public.linkedin_contacts', t + '\n\nINSERT INTO public.linkedin_contacts');
}

if (!sql1.includes('is_seed boolean')) sql1 = sql1.replace('CREATE TABLE IF NOT EXISTS public.incidents (', 'CREATE TABLE IF NOT EXISTS public.incidents (\n  is_seed boolean NOT NULL DEFAULT false,');
if (!sql1.includes('nullifier_hash text')) sql1 = sql1.replace('CREATE TABLE IF NOT EXISTS public.whistleblower_submissions (', 'CREATE TABLE IF NOT EXISTS public.whistleblower_submissions (\n  zkp_commitment text,\n  nullifier_hash text,\n  proof_metadata jsonb default \'{}\'::jsonb,\n  zero_day_risk text check (zero_day_risk in (\'CRITICAL\', \'HIGH\', \'MEDIUM\', \'LOW\', \'NONE\')) default \'NONE\',');
if (!sql1.includes('is_verified_respondent boolean')) sql1 = sql1.replace('create table public.ai_providers (', 'create table public.ai_providers (\n  is_verified_respondent boolean NOT NULL DEFAULT false,');

sql1 = sql1.replace(/pii_categories\n\) VALUES/g, 'pii_categories, model_custom_name\n) VALUES');
sql1 = sql1.replace(/false, '{}'\n  \)/g, "false, '{}', 'Unknown Model'\n  )");

sql1 = sql1.replace(/CREATE TABLE public\.vendor_quotas/g, 'CREATE TABLE IF NOT EXISTS public.vendor_quotas');
sql1 = sql1.replace(/case_id UUID REFERENCES public\.jury_cases\(id\)/g, 'case_id UUID REFERENCES public.jury_cases(case_id)');
sql1 = sql1.replace(/provider_id UUID REFERENCES public\.providers\(id\)/g, 'provider_id UUID REFERENCES public.ai_providers(id)');
sql1 = sql1.replace(/UNIQUE \(title_en, ai_provider_id\)/g, 'UNIQUE (title, ai_provider_id)');

if (!sql1.includes("'verified'")) sql1 = sql1.replace("'takedown'         -- removed after legal takedown", "'takedown',        -- removed after legal takedown\n  'verified'         -- verified status");

const lines2 = sql2.split('\n');
let newLines2 = [];
for (let i = 0; i < lines2.length; i++) {
  if (lines2[i].trim().match(/^CREATE POLICY/i)) {
    const match = lines2[i].match(/CREATE POLICY\s+"([^"]+)"\s+ON\s+([^\s]+)/i);
    if (match) newLines2.push('DROP POLICY IF EXISTS "' + match[1] + '" ON ' + match[2] + ';');
  }
  if (!lines2[i].includes('alter table public.%i enable row level security;')) newLines2.push(lines2[i]);
}
sql2 = newLines2.join('\n');

if (!sql1.includes('storage.foldername')) sql1 = sql1.replace('CREATE SCHEMA IF NOT EXISTS auth;', 'CREATE SCHEMA IF NOT EXISTS auth;\nCREATE SCHEMA IF NOT EXISTS storage;\nCREATE OR REPLACE FUNCTION storage.foldername(name text) RETURNS text[] AS  SELECT string_to_array(name, \'/\');  LANGUAGE sql STABLE;');
if (!sql1.includes("rolname = 'auditor_role'")) sql1 = sql1.replace("CREATE ROLE service_role NOLOGIN;\n  END IF;", "CREATE ROLE service_role NOLOGIN;\n  END IF;\n  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'auditor_role') THEN\n    CREATE ROLE auditor_role NOLOGIN;\n  END IF;");
if (!sql1.includes("FUNCTION public.is_moderator() RETURNS")) sql1 = sql1.replace('create or replace function public.is_moderator(uid uuid)', '-- Delegation stub for 0-arg public.is_moderator()\nCREATE OR REPLACE FUNCTION public.is_moderator() RETURNS boolean AS \nBEGIN\n  RETURN public.is_moderator(auth.uid());\nEND;\n LANGUAGE plpgsql SECURITY DEFINER;\n\ncreate or replace function public.is_moderator(uid uuid)');

fs.writeFileSync(m01, sql1, 'utf8'); fs.writeFileSync(m02, sql2, 'utf8'); console.log('Done.');