import fs from 'node:fs';
import path from 'node:path';

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

  for (const eng of chain) {
    const engineName = eng.toLowerCase().startsWith('engine_')
      ? eng.toLowerCase()
      : `engine_${eng.toLowerCase()}`;
    console.log(`[DISPATCH] ${engineName} → ${task_id}`);
  }

  console.log('DISPATCH OK');
}

main();
