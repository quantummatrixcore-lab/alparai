import fs from 'node:fs';
import path from 'node:path';

const MODEL_CAPABILITIES = {
  'agent_f':       { spec: 'frontend', models: ['next.js','tailwind','react','i18n'], oc_model: 'DeepSeek-V4-Flash-Free' },
  'agent_b':       { spec: 'backend',  models: ['rust','axum','postgresql','api'],  oc_model: 'Nemotron-3-Ultra-Free' },
  'agent_omega':   { spec: 'security', models: ['rls','pii','audit','cve'],         oc_model: 'DeepSeek-V4-Flash-Free' },
  'agent_llm':     { spec: 'research', models: ['prompt','routing','llm','docs'],   oc_model: 'GLM-5.2-Free' },
  'agent_bilge':   { spec: 'knowledge',models: ['docs','history','governance'],     oc_model: 'MiMo-V2.5-Free' },
  'agent_tartarus':{ spec: 'cleanup',  models: ['archive','dead-code','hygiene'],   oc_model: 'Laguna-S-2.1-Free' },
  'mbs':           { spec: 'strategy', models: ['verdict','memory','advisory'],     oc_model: 'GPT-OSS-120B' },
  'mbp':           { spec: 'command',  models: ['ceo','dispatch','orchestrate'],    oc_model: 'DeepSeek-V4-Pro' },
  'mbp_f1':        { spec: 'frontend_prime', models: ['next.js','ui','ux'],        oc_model: 'Gemma-4-31B-IT' },
};

const SWARM_ROUTING = {
  // fallback_chain: [primary, secondary, tertiary] -- yetkinlik bazli, dusu basa dogru
  'code_forge':         { fallback_chain: ['agent_b','agent_f','mbp_f1'],        swarm_unit: 'INSAAT TABURU' },
  'security_audit':     { fallback_chain: ['agent_omega','agent_b','mbs'],       swarm_unit: 'ISTIHBARAT EMNIYETI' },
  'deep_research':      { fallback_chain: ['agent_llm','agent_bilge','mbs'],     swarm_unit: 'KESIF KOLU' },
  'full_360_audit':     { fallback_chain: ['agent_omega','agent_b','agent_llm'], swarm_unit: 'ISTIHBARAT + INSAAT' },
  'strategic_analysis': { fallback_chain: ['mbs','mbp','agent_bilge'],           swarm_unit: 'GENEL KURMAY' },
  'prompt_optimization':{ fallback_chain: ['agent_llm','agent_f','mbs'],         swarm_unit: 'KESIF KOLU' },
  'frontend_fix':       { fallback_chain: ['agent_f','mbp_f1','agent_b'],        swarm_unit: 'YILDIRIM KITALARI' },
  'i18n':               { fallback_chain: ['agent_f','agent_bilge','agent_llm'], swarm_unit: 'HARICIYE DAIRESI' },
  'cleanup':            { fallback_chain: ['agent_tartarus','agent_b','agent_f'], swarm_unit: 'YILDIRIM KITALARI' },
};

function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error('Hata: Manifest dosya yolu belirtilmedi. Kullanim: node scripts/task-dispatch.mjs <manifest.json>');
    process.exit(1);
  }

  const absoluteManifestPath = path.resolve(process.cwd(), manifestPath);
  if (!fs.existsSync(absoluteManifestPath)) {
    console.error(`Hata: Manifest dosyasi bulunamadi: ${absoluteManifestPath}`);
    process.exit(1);
  }

  let manifest;
  try {
    const rawContent = fs.readFileSync(absoluteManifestPath, 'utf8');
    manifest = JSON.parse(rawContent);
  } catch (err) {
    console.error(`Hata: Manifest dosyasi okunamadi veya gecersiz JSON: ${err.message}`);
    process.exit(1);
  }

  const { task_id, pipeline } = manifest;
  if (!task_id || !pipeline) {
    console.error('Hata: Manifest icinde task_id ve pipeline alanlari zorunludur.');
    process.exit(1);
  }

  // Routing Policy Bulucu
  const localPolicyPath = path.resolve(process.cwd(), 'routing-policy.json');
  const fallbackPolicyPath = 'D:\\Antigravity\\engines\\routing-policy.json';

  let routingPolicy = null;
  if (fs.existsSync(localPolicyPath)) {
    try {
      routingPolicy = JSON.parse(fs.readFileSync(localPolicyPath, 'utf8'));
    } catch (_) {}
  }

  if (!routingPolicy && fs.existsSync(fallbackPolicyPath)) {
    try {
      routingPolicy = JSON.parse(fs.readFileSync(fallbackPolicyPath, 'utf8'));
    } catch (_) {}
  }

  let chain = [];
  if (routingPolicy?.pipeline_templates?.[pipeline]) {
    chain = routingPolicy.pipeline_templates[pipeline].chain || [];
  } else if (routingPolicy?.pipelines?.[pipeline]) {
    chain = routingPolicy.pipelines[pipeline];
  } else {
    // Varsayılan pipeline zinciri fallback
    chain = ['TARTARUS', 'HEPHAESTUS', 'SENTINEL', 'OMEGA'];
  }

  const engineChain = chain
    .map((eng) => (eng.toLowerCase().startsWith('engine_') ? eng.toLowerCase() : `engine_${eng.toLowerCase()}`))
    .join(' → ');

  const route = getSwarmRoute(pipeline);
  if (route && route.fallback_chain) {
    const [primary, secondary, tertiary] = route.fallback_chain;
    const ocModel = MODEL_CAPABILITIES[primary]?.oc_model || 'unknown';
    console.log(`[DISPATCH] ${task_id} -> ${route.swarm_unit} | P1: ${primary} (${ocModel}) | P2: ${secondary} | P3: ${tertiary} | ${engineChain}`);
  } else {
    console.log(`[DISPATCH] ${task_id} -> UNMAPPED PIPELINE | ${engineChain}`);
  }

  console.log('DISPATCH OK');
}

export function getSwarmRoute(pipeline) {
  return SWARM_ROUTING[pipeline] ?? null;
}

main();
