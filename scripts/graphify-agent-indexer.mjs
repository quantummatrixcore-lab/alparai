import fs from 'node:fs';
import path from 'node:path';

function getRoutingPolicy() {
  const candidates = [
    path.join(process.cwd(), 'routing-policy.json'),
    path.join(process.cwd(), '.agents', 'routing-policy.json'),
    path.join(process.cwd(), '.agents', 'engines', 'routing-policy.json'),
    'D:\\Antigravity\\engines\\routing-policy.json'
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (data.pipeline_templates) {
          return { data, path: p };
        }
      } catch (err) {
        console.warn(`[Agent Indexer] Failed to parse routing policy at ${p}:`, err.message);
      }
    }
  }
  return null;
}

function parseTitleFromMd(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return trimmed.replace(/^#\s+/, '').trim();
      }
    }
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 0 && !trimmed.startsWith('---')) {
        return trimmed.slice(0, 80);
      }
    }
  } catch (_) {}
  return path.basename(filePath, '.md');
}

function parseDirectiveFromMd(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/>\s*\*\*\[CORE DIRECTIVE\]\*\*\s*([^\n]+)/i) || 
                  content.match(/>\s*([^\n]+)/) ||
                  content.match(/##\s+1\.\s+([^\n]+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
    if (lines.length > 0) return lines[0].slice(0, 100);
  } catch (_) {}
  return 'No summary available';
}

function main() {
  const rootDir = process.cwd();
  const enginesDir = path.join(rootDir, '.agents', 'engines');
  const personasDir = path.join(rootDir, '.agents', 'personas');
  const nexusDir = path.join(rootDir, '.agents', 'nexus');
  const swarmDir = path.join(rootDir, '.agents', 'swarm');
  const outDir = path.join(rootDir, 'graphify-out');

  // 1. Read Engines
  const engines = [];
  if (fs.existsSync(enginesDir)) {
    const files = fs.readdirSync(enginesDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(enginesDir, file);
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (content.id && content.key) {
            engines.push({
              id: content.id,
              key: content.key,
              name: content.name || content.key,
              status: content.status || 'unknown',
              version: content.version || '1.0.0',
              capabilities: Array.isArray(content.capabilities) ? content.capabilities : [],
              description: content.description || ''
            });
          }
        } catch (err) {
          console.warn(`[Agent Indexer] Failed to parse engine file ${file}:`, err.message);
        }
      }
    }
  }

  // Sort engines by numeric ID
  engines.sort((a, b) => {
    const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

  // 2. Read Routing Policy & Pipelines
  const routingRes = getRoutingPolicy();
  const pipelines = [];
  const engineConnections = new Map();

  if (routingRes && routingRes.data.pipeline_templates) {
    const templates = routingRes.data.pipeline_templates;
    for (const [name, info] of Object.entries(templates)) {
      const chain = Array.isArray(info.chain) ? info.chain : [];
      pipelines.push({
        name,
        chain,
        description: info.description || ''
      });

      for (let i = 0; i < chain.length - 1; i++) {
        const source = chain[i];
        const target = chain[i + 1];
        if (!engineConnections.has(source)) engineConnections.set(source, new Set());
        engineConnections.get(source).add(target);
      }
    }
  }

  // 3. Read Personas
  const personas = [];
  if (fs.existsSync(personasDir)) {
    const files = fs.readdirSync(personasDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(personasDir, file);
        const title = parseTitleFromMd(filePath);
        personas.push({
          file,
          key: path.basename(file, '.md').toUpperCase(),
          title
        });
      }
    }
  }

  // 4. Read Nexus Rules
  const nexusRules = [];
  if (fs.existsSync(nexusDir)) {
    const files = fs.readdirSync(nexusDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(nexusDir, file);
        const title = parseTitleFromMd(filePath);
        const summary = parseDirectiveFromMd(filePath);
        nexusRules.push({
          file,
          title,
          summary
        });
      }
    }
  }

  // 5. Read Swarm Docs
  const swarmDocs = [];
  if (fs.existsSync(swarmDir)) {
    const files = fs.readdirSync(swarmDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(swarmDir, file);
        const title = parseTitleFromMd(filePath);
        swarmDocs.push({
          file,
          title
        });
      }
    }
  }

  // Build Report Content
  const timestamp = new Date().toISOString();
  let report = `# 🤖 Agent-OS Graphify Index Report\n\n`;
  report += `> **Generated At:** \`${timestamp}\`  \n`;
  report += `> **Stats:** ${engines.length} Engines | ${pipelines.length} Pipelines | ${personas.length} Personas | ${nexusRules.length} Nexus Rules | ${swarmDocs.length} Swarm Squads\n\n`;

  report += `---\n\n`;
  report += `## ⚙️ Registered Engines Pantheon\n\n`;
  report += `| ID | Key | Name | Status | Capabilities |\n`;
  report += `| --- | --- | --- | --- | --- |\n`;
  for (const eng of engines) {
    const caps = eng.capabilities.map(c => `\`${c}\``).join(', ') || '_None_';
    const statusBadge = eng.status === 'healthy' ? '🟢 healthy' : `🟡 ${eng.status}`;
    report += `| **${eng.id}** | \`${eng.key}\` | ${eng.name} | ${statusBadge} | ${caps} |\n`;
  }

  report += `\n---\n\n`;
  report += `## 🔗 Pipeline Chains & Routing Graph\n\n`;
  if (pipelines.length > 0) {
    report += `| Pipeline Name | Chain Sequence | Description |\n`;
    report += `| --- | --- | --- |\n`;
    for (const pipe of pipelines) {
      const chainFormatted = pipe.chain.map(c => `\`${c}\``).join(' ➔ ');
      report += `| **${pipe.name}** | ${chainFormatted} | ${pipe.description} |\n`;
    }

    report += `\n### 🧬 Engine Inter-Connections (Derived Edges)\n\n`;
    if (engineConnections.size > 0) {
      report += `| Source Engine | Forward Pipeline Targets |\n`;
      report += `| --- | --- |\n`;
      for (const [source, targets] of engineConnections.entries()) {
        const targetList = Array.from(targets).map(t => `\`${t}\``).join(', ');
        report += `| \`${source}\` | ${targetList} |\n`;
      }
    } else {
      report += `_No inter-engine connections found._\n`;
    }
  } else {
    report += `_No pipeline templates found in routing policy._\n`;
  }

  report += `\n---\n\n`;
  report += `## 👤 Agent Personas\n\n`;
  report += `| Persona File | Title / Identity |\n`;
  report += `| --- | --- |\n`;
  for (const p of personas) {
    report += `| \`${p.file}\` | ${p.title} |\n`;
  }

  report += `\n---\n\n`;
  report += `## 📜 Nexus Architecture Rules\n\n`;
  report += `| Nexus Document | Summary Directive |\n`;
  report += `| --- | --- |\n`;
  for (const n of nexusRules) {
    report += `| **${n.title}** (\`${n.file}\`) | ${n.summary} |\n`;
  }

  if (swarmDocs.length > 0) {
    report += `\n---\n\n`;
    report += `## 🐝 Swarm Squad Units\n\n`;
    report += `| Unit File | Title |\n`;
    report += `| --- | --- |\n`;
    for (const s of swarmDocs) {
      report += `| \`${s.file}\` | ${s.title} |\n`;
    }
  }

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFilePath = path.join(outDir, 'AGENT_REPORT.md');
  fs.writeFileSync(outFilePath, report, 'utf8');

  console.log(`[Agent Indexer] ✅ Successfully indexed:`);
  console.log(`  - ${engines.length} Engines`);
  console.log(`  - ${pipelines.length} Pipelines`);
  console.log(`  - ${personas.length} Personas`);
  console.log(`  - ${nexusRules.length} Nexus Rules`);
  console.log(`  - ${swarmDocs.length} Swarm Squads`);
  console.log(`[Agent Indexer] 📄 Report generated at: ${outFilePath}`);
}

main();
