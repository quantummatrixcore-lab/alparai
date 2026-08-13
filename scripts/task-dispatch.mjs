import fs from 'node:fs';
import path from 'node:path';

const SWARM_ROUTING = {
  // Pipeline -> MCP Agent Bridge mapping
  'code_forge':        { primary: 'agent_f',     fallback: 'agent_b',     swarm_unit: 'İNŞAAT TABURU' },
  'security_audit':    { primary: 'agent_omega', fallback: 'agent_b',     swarm_unit: 'İSTİHBARAT EMNİYETİ' },
  'deep_research':     { primary: 'agent_llm',   fallback: 'mbs',         swarm_unit: 'KEŞİF KOLU' },
  'full_360_audit':    { primary: 'agent_omega', fallback: 'agent_b',     swarm_unit: 'İSTİHBARAT + İNŞAAT' },
  'strategic_analysis':{ primary: 'mbs',         fallback: 'agent_bilge', swarm_unit: 'GENEL KURMAY' },
  'prompt_optimization':{ primary: 'agent_llm',  fallback: 'agent_f',     swarm_unit: 'KEŞİF KOLU' },
  'frontend_fix':      { primary: 'agent_f',     fallback: 'mbp_f1',      swarm_unit: 'YILDIRIM KITALARI' },
  'i18n':              { primary: 'agent_f',     fallback: 'agent_bilge', swarm_unit: 'HARİCİYE DAİRESİ' },
  'cleanup':           { primary: 'agent_tartarus', fallback: 'agent_b',  swarm_unit: 'YILDIRIM KITALARI' },
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
  const swarmUnitStr = route
    ? `${route.swarm_unit} (primary: ${route.primary})`
    : 'UNMAPPED PIPELINE — kullanici manuel atama yapmali';

  console.log(`[DISPATCH] ${task_id} → ${swarmUnitStr} → ${engineChain}`);
  console.log('DISPATCH OK');
}

export function getSwarmRoute(pipeline) {
  return SWARM_ROUTING[pipeline] ?? null;
}

main();
