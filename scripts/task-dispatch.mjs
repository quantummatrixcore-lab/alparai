import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// ──────────────────────────────────────────────────────────────────
// ANTIGRAVITY TIER MAP  (Baş Mimar: Claude Sonnet)
// flash_lite → nano/micro görevler  (≤5K token)   — en hızlı & ucuz
// flash      → small/medium görevler (≤20K token)  — dengeli
// pro        → large/XL görevler    (≤80K token)   — 2M bağlam
// ──────────────────────────────────────────────────────────────────
const ANTIGRAVITY_TIER = {
  flash_lite: { max_budget: 5000,  ag_model: 'flash_lite', label: 'Nano/Micro' },
  flash:      { max_budget: 20000, ag_model: 'flash',      label: 'Small/Medium' },
  pro:        { max_budget: 80000, ag_model: 'pro',        label: 'Large/XL — 2M context' },
};

const MODEL_CAPABILITIES = {
  // flash_lite tier — tek satır / mekanik düzeltmeler
  'agent_tartarus':{ spec: 'cleanup',  tier: 'flash_lite', models: ['archive','dead-code','hygiene','single-line-fix'], oc_model: 'Laguna-S-2.1-Free',     max_tokens: 5000 },
  'agent_bilge':   { spec: 'knowledge',tier: 'flash_lite', models: ['docs','history','governance','lookup'],           oc_model: 'MiMo-V2.5-Free',         max_tokens: 5000 },
  // flash tier — 1-3 dosya, lint dahil
  'agent_f':       { spec: 'frontend', tier: 'flash',      models: ['next.js','tailwind','react','i18n','a11y'],       oc_model: 'DeepSeek-V4-Flash-Free',  max_tokens: 10000 },
  'agent_omega':   { spec: 'security', tier: 'flash',      models: ['rls','pii','audit','cve','ssrf'],                 oc_model: 'DeepSeek-V4-Flash-Free',  max_tokens: 10000 },
  'agent_llm':     { spec: 'research', tier: 'flash',      models: ['prompt','routing','llm','docs','eval'],           oc_model: 'GLM-5.2-Free',            max_tokens: 15000 },
  'agent_b':       { spec: 'backend',  tier: 'flash',      models: ['postgresql','api','migration','rpc'],             oc_model: 'Nemotron-3-Ultra-Free',   max_tokens: 15000 },
  'mbp_f1':        { spec: 'ui_prime', tier: 'flash',      models: ['next.js','ui','ux','glassmorphism','animation'],  oc_model: 'Gemma-4-31B-IT',          max_tokens: 20000 },
  // pro tier — mimari, 2M bağlam, tam repo analizi
  'mbs':           { spec: 'strategy', tier: 'pro',        models: ['verdict','memory','advisory','architecture'],     oc_model: 'GPT-OSS-120B',            max_tokens: 40000 },
  'mbp':           { spec: 'command',  tier: 'pro',        models: ['orchestrate','fullrepo','planning','2m-context'], oc_model: 'DeepSeek-V4-Pro',         max_tokens: 80000 },
};

const SWARM_ROUTING = {
  'code_forge':         { fallback_chain: ['agent_b','agent_f','mbp_f1'],        swarm_unit: 'INSAAT TABURU' },
  'security_audit':     { fallback_chain: ['agent_omega','agent_b','mbs'],       swarm_unit: 'ISTIHBARAT EMNIYETI' },
  'deep_research':      { fallback_chain: ['agent_llm','agent_bilge','mbs'],     swarm_unit: 'KESIF KOLU' },
  'full_360_audit':     { fallback_chain: ['agent_omega','agent_b','agent_llm'], swarm_unit: 'ISTIHBARAT + INSAAT' },
  'strategic_analysis': { fallback_chain: ['mbs','mbp','agent_bilge'],           swarm_unit: 'GENEL KURMAY' },
  'prompt_optimization':{ fallback_chain: ['agent_llm','agent_f','mbs'],         swarm_unit: 'KESIF KOLU' },
  'frontend_fix':       { fallback_chain: ['agent_f','mbp_f1','agent_b'],        swarm_unit: 'YILDIRIM KITALARI' },
  'i18n':               { fallback_chain: ['agent_f','agent_bilge','agent_llm'], swarm_unit: 'HARICIYE DAIRESI' },
  'cleanup':            { fallback_chain: ['agent_tartarus','agent_b','agent_f'], swarm_unit: 'YILDIRIM KITALARI' },
  'ui_design':          { fallback_chain: ['agent_f','mbp_f1','agent_b'],        swarm_unit: 'TASARIM KOMANDOLARI' },
  'component_build':    { fallback_chain: ['mbp_f1','agent_f','agent_b'],        swarm_unit: 'TASARIM KOMANDOLARI' },
  'a11y_audit':         { fallback_chain: ['agent_omega','agent_f','agent_llm'], swarm_unit: 'TASARIM KOMANDOLARI' },
};

function fetchGraphifyContext(query) {
  try {
    const output = execSync(`python -m graphify query "${query}" --format json`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const data = JSON.parse(output);
    return data.nodes ? data.nodes.slice(0, 3).map(n => n.name).join(', ') : "Context not found";
  } catch (e) {
    return "Graphify query failed (ensure python -m graphify is available)";
  }
}

function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error(JSON.stringify({ error: 'Manifest dosya yolu belirtilmedi.' }));
    process.exit(1);
  }

  const absoluteManifestPath = path.resolve(process.cwd(), manifestPath);
  if (!fs.existsSync(absoluteManifestPath)) {
    console.error(JSON.stringify({ error: `Manifest dosyasi bulunamadi: ${absoluteManifestPath}` }));
    process.exit(1);
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(absoluteManifestPath, 'utf8'));
  } catch (err) {
    console.error(JSON.stringify({ error: `Gecersiz JSON: ${err.message}` }));
    process.exit(1);
  }

  const { task_id, pipeline, token_budget = 5000 } = manifest;
  if (!task_id || !pipeline) {
    console.error(JSON.stringify({ error: 'task_id ve pipeline zorunludur.' }));
    process.exit(1);
  }

  const route = SWARM_ROUTING[pipeline];
  if (!route) {
    console.error(JSON.stringify({ error: `Bilinmeyen pipeline: ${pipeline}` }));
    process.exit(1);
  }

  let selectedModel = route.fallback_chain[0];
  let selectedModelSpec = MODEL_CAPABILITIES[selectedModel];
  
  // Claude Intelligence: Token Budget Optimization (Auto-Upgrade if budget is too high for Flash)
  if (token_budget > selectedModelSpec.max_tokens) {
    console.warn(`[WARN] Token budget (${token_budget}) exceeds ${selectedModel} max (${selectedModelSpec.max_tokens}). Upgrading...`);
    const upgradeModel = route.fallback_chain.find(m => MODEL_CAPABILITIES[m].max_tokens >= token_budget);
    if (upgradeModel) {
      selectedModel = upgradeModel;
      selectedModelSpec = MODEL_CAPABILITIES[selectedModel];
    }
  }

  // Claude Intelligence: Auto-fetch Graphify Context based on pipeline
  const autoContext = fetchGraphifyContext(pipeline.replace('_', ' '));

  const result = {
    task_id,
    swarm_unit: route.swarm_unit,
    assigned_agent: selectedModel,
    llm: selectedModelSpec.oc_model,
    budget_allocated: selectedModelSpec.max_tokens,
    graphify_context: autoContext,
    status: 'READY'
  };

  console.log(JSON.stringify(result, null, 2));
}

main();
