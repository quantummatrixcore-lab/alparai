#!/usr/bin/env node

/**
 * 🏛️ Engine Registry CLI
 * 
 * Usage:
 *   node src/cli/engine-cli.mjs list          — List all 33 engines
 *   node src/cli/engine-cli.mjs health        — Health summary
 *   node src/cli/engine-cli.mjs get TOM       — Get engine details
 *   node src/cli/engine-cli.mjs caps routing  — Find engines by capability
 */

import { registry } from '../lib/engine-registry.ts';

async function main() {
  const command = process.argv[2] || 'list';
  const arg = process.argv[3];

  await registry.load();

  const source = registry.getSource();

  switch (command) {
    case 'refresh': {
      await registry.refresh();
      console.log(`\n🔄 Registry refreshed from: ${registry.getSource()}\n`);
      const h = registry.healthCheck();
      console.log(`  ${h.healthy}/${h.total} healthy\n`);
      break;
    }

    case 'list': {
      const engines = registry.listEngines();
      console.log(`\n🏛️  SOVEREIGN ENGINE FLEET — ${engines.length} engines (${source})\n`);
      console.log('  ID\t\tKEY\t\tSTATUS\t\tNAME');
      console.log('  ───────────────────────────────────────────────────────────────');
      for (const e of engines) {
        console.log(`  ${e.id}\t\t${e.key}\t\t${e.status === 'healthy' ? '🟢' : '🟡'}\t\t${e.name}`);
      }
      break;
    }

    case 'health': {
      const h = registry.healthCheck();
      console.log(`\n🏛️  ENGINE HEALTH (${source})\n`);
      console.log(`  Total:    ${h.total}`);
      console.log(`  Healthy:  ${h.healthy} 🟢`);
      console.log(`  Degraded: ${h.degraded} 🟡`);
      if (h.degradedList.length) {
        console.log(`\n  Degraded engines:`);
        h.degradedList.forEach(d => console.log(`    - ${d}`));
      }
      break;
    }

    case 'get': {
      if (!arg) { console.log('Usage: engine-cli.mjs get <key|id>'); return; }
      const e = registry.getEngine(arg.toUpperCase());
      if (!e) { console.log(`Engine "${arg}" not found`); return; }
      console.log(`\n${e.id} ${e.name}`);
      console.log(`  Key:         ${e.key}`);
      console.log(`  Status:      ${e.status}`);
      console.log(`  Version:     ${e.version}`);
      console.log(`  Description: ${e.description}`);
      console.log(`  Capabilities:`);
      e.capabilities.forEach(c => console.log(`    - ${c}`));
      break;
    }

    case 'caps': {
      if (!arg) { console.log('Usage: engine-cli.mjs caps <keyword>'); return; }
      const engines = registry.getByCapability(arg);
      console.log(`\n🔍 Engines with capability matching "${arg}":\n`);
      for (const e of engines) {
        console.log(`  ${e.id} ${e.key}: ${e.name}`);
        console.log(`    ${e.capabilities.filter(c => c.toLowerCase().includes(arg.toLowerCase())).join(', ')}`);
      }
      break;
    }

    case 'report': {
      const h = registry.healthCheck();
      const all = registry.listEngines();
      const ts = new Date().toISOString().split('.')[0].replace('T', ' ');
      console.log(`# 🏛️ Sovereign Zenith — Live Status Report`);
      console.log(`**Generated:** ${ts} UTC`);
      console.log(`**Source:** ${source}`);
      console.log(``);
      console.log(`## System Health`);
      console.log(`| Metric | Value |`);
      console.log(`|:---|---:|`);
      console.log(`| Total Engines | ${h.total} |`);
      console.log(`| Healthy | ${h.healthy} 🟢 |`);
      console.log(`| Degraded | ${h.degraded} 🟡 |`);
      if (h.degradedList.length) console.log(`| Issues | ${h.degradedList.join(', ')} |`);
      console.log(``);
      console.log(`## Engine Fleet (${all.length})`);
      console.log(`| # | Key | Status | Name |`);
      console.log(`|:---:|:---|:---:|:---|`);
      all.forEach(e => console.log(`| ${e.id.replace('ENG-', '')} | ${e.key} | ${e.status === 'healthy' ? '🟢' : '🟡'} | ${e.name} |`));
      console.log(``);
      console.log(`## Capability Distribution`);
      ['security','routing','memory','monitoring','optimization'].forEach(cap => {
        const matched = registry.getByCapability(cap);
        if (matched.length) console.log(`- **${cap}:** ${matched.map(e => e.key).join(', ')}`);
      });
      break;
    }

    default:
      console.log('Commands: list, health, get <key>, caps <keyword>, refresh, report');
  }
}

main().catch(console.error);
