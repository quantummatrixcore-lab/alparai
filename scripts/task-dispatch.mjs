import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// ──────────────────────────────────────────────────────────────────
// ANTIGRAVITY MODEL CAPABILITY MATRIX (Baş Mimar: Claude Sonnet)
// Kaynak: 6-model karşılaştırma tablosu — 14 Ağustos 2026
// ──────────────────────────────────────────────────────────────────
// tier: flash_lite → nano (≤5K)  | flash → small/medium (≤20K) | pro → large/XL (≤80K)
// ──────────────────────────────────────────────────────────────────
const ANTIGRAVITY_TIER = {
  flash_lite: { max_budget: 5000,  ag_model: 'flash_lite', label: 'Nano/Micro' },
  flash:      { max_budget: 20000, ag_model: 'flash',      label: 'Small/Medium' },
  pro:        { max_budget: 80000, ag_model: 'pro',        label: 'Large/XL — 2M context' },
};

const MODEL_CAPABILITIES = {
  // ── NANO TİER (flash_lite) — sub-agent, yüksek hacim, düşük gecikme ──
  'nemotron_lightning': {
    tier: 'flash_lite', spec: 'speed',
    oc_model: 'Nemotron 3.5 Lightning',
    active_params: '3B', context: '1M',
    strengths: ['sub-agent', 'batch', 'low-latency', 'cost'],
    max_tokens: 3000,
  },

  // ── FLASH TİER — dengeli, 1-3 dosya ──
  'deepseek_flash': {
    tier: 'flash', spec: 'long_context',
    oc_model: 'DeepSeek V4 Flash',
    active_params: '13B', context: '1M',
    strengths: ['long-doc', 'code', 'high-volume', 'i18n'],
    max_tokens: 10000,
  },
  'hy3': {
    tier: 'flash', spec: 'frontend',
    oc_model: 'Hy3',
    active_params: '21B', context: '256K',
    strengths: ['frontend', 'ci-cd', 'office', 'react', 'tailwind'],
    max_tokens: 12000,
  },
  'laguna': {
    tier: 'flash', spec: 'coding',
    oc_model: 'Laguna S 2.1',
    active_params: '8B', context: '1M',
    strengths: ['code', 'tool-calling', 'agentic-coding', 'migration'],
    max_tokens: 15000,
  },
  'mimo': {
    tier: 'flash', spec: 'multimodal',
    oc_model: 'MiMo V2.5',
    active_params: '15B', context: '1M',
    strengths: ['image', 'video', 'audio', 'multimodal', 'reasoning'],
    max_tokens: 15000,
  },

  // ── PRO TİER — en güçlü reasoning, agentic workflow ──
  'nemotron_ultra': {
    tier: 'pro', spec: 'reasoning',
    oc_model: 'Nemotron 3 Ultra',
    active_params: '55B', context: '1M',
    strengths: ['reasoning', 'agentic', 'multilingual', 'architecture'],
    max_tokens: 40000,
  },
};

const SWARM_ROUTING = {
  // Görev → [P1, P2, P3] en yetkin modelden başla
  'code_forge':         { fallback_chain: ['laguna','deepseek_flash','nemotron_ultra'],  swarm_unit: 'İNŞAAT TABURU' },
  'security_audit':     { fallback_chain: ['nemotron_ultra','laguna','deepseek_flash'],  swarm_unit: 'İSTİHBARAT EMNİYET' },
  'deep_research':      { fallback_chain: ['nemotron_ultra','deepseek_flash','mimo'],    swarm_unit: 'KEŞİF KOLU' },
  'strategic_analysis': { fallback_chain: ['nemotron_ultra','mimo','deepseek_flash'],    swarm_unit: 'GENEL KURMAY' },
  'frontend_fix':       { fallback_chain: ['hy3','deepseek_flash','laguna'],             swarm_unit: 'YILDIRIM KITALARI' },
  'i18n':               { fallback_chain: ['deepseek_flash','nemotron_ultra','hy3'],     swarm_unit: 'HARİCİYE DAİRESİ' },
  'ui_design':          { fallback_chain: ['hy3','mimo','deepseek_flash'],               swarm_unit: 'TASARIM KOMANDOLARI' },
  'component_build':    { fallback_chain: ['hy3','laguna','deepseek_flash'],             swarm_unit: 'TASARIM KOMANDOLARI' },
  'a11y_audit':         { fallback_chain: ['mimo','hy3','nemotron_ultra'],               swarm_unit: 'TASARIM KOMANDOLARI' },
  'cleanup':            { fallback_chain: ['nemotron_lightning','deepseek_flash','laguna'], swarm_unit: 'YILDIRIM KITALARI' },
  'batch_task':         { fallback_chain: ['nemotron_lightning','deepseek_flash','hy3'],   swarm_unit: 'YILDIRIM KITALARI' },
  'multimodal':         { fallback_chain: ['mimo','nemotron_ultra','deepseek_flash'],    swarm_unit: 'KEŞİF KOLU' },
  'agentic_workflow':   { fallback_chain: ['nemotron_ultra','laguna','mimo'],            swarm_unit: 'GENEL KURMAY' },
  'long_doc':           { fallback_chain: ['deepseek_flash','nemotron_ultra','laguna'],  swarm_unit: 'KEŞİF KOLU' },
  'full_360_audit':     { fallback_chain: ['nemotron_ultra','laguna','deepseek_flash'],  swarm_unit: 'GENEL KURMAY' },
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
