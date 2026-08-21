import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// Load the current model catalog from the file (or we could fetch it if it were dynamically imported, but here we can just parse the file or rely on explicit verification list)
const validModels = new Set([
  'GPT-5.2',
  'GPT-5.2 Instant',
  'GPT-5.1 Codex Max',
  'Sora 2',
  'GPT-4o',
  'GPT-4o mini',
  'o3',
  'o3-mini',
  'o4',
  'o4-mini',
  'o5',
  'GPT-5',
  'GPT-5 mini',
  'GPT-4.5',
  'Claude 3.5 Sonnet',
  'Claude 3.7 Sonnet',
  'Claude 4 Sonnet',
  'Claude Fable 5',
  'Gemini 1.5 Pro',
  'Gemini 1.5 Flash',
  'Gemini 2.0 Flash',
  'Gemini 2.5 Pro',
  'Gemini 2.5 Flash',
  'Gemini 3.0 Pro',
  'Gemini 3.0 Flash',
  'Gemini 3.5 Pro',
  'Gemini 3.5 Flash',
  'Gemma 2 9B',
  'Gemma 2 27B',
  'Gemma 3 8B',
  'Gemma 4 9B',
  'Gemma 4 31B',
  'Veo 3.1',
  'Llama 3 8B',
  'Llama 3 70B',
  'Llama 3.1 8B',
  'Llama 3.1 70B',
  'Llama 3.1 405B',
  'Llama 3.2 3B',
  'Llama 3.3 70B',
  'Llama 4 Maverick',
  'Llama 4 Scout',
  'Llama 4.5 70B',
  'Llama 4.5 405B',
  'Llama 5 Scout',
  'Grok 2',
  'Grok 3',
  'Grok 3 mini',
  'Grok 4',
  'Grok 4.5',
  'DeepSeek-V2.5',
  'DeepSeek-V3',
  'DeepSeek-Coder-V2',
  'DeepSeek-R1',
  'DeepSeek-V3.2',
  'DeepSeek-V4 Flash',
  'Qwen 2 7B',
  'Qwen 2 72B',
  'Qwen 2.5 72B',
  'Qwen 2.5 Coder 32B',
  'Qwen 3.0',
  'Mistral Large 2',
  'Mistral Large 3',
  'Codestral',
  'Codestral 2.0',
  'Pixtral 12B',
  'Mistral NeMo',
  'Apple Foundation Model',
  'Apple Foundation Model 2',
  'AFM-3 Agentic',
  'Phi-3 Mini',
  'Phi-3.5 MoE',
  'Phi-4',
  'Phi-4.5 Mini',
  'Devin 1.0',
  'Devin 2.0',
  'Devin 3.0',
  'Suno v3.5',
  'Suno v4',
  'Suno v5',
  'Midjourney v6',
  'Midjourney v7',
  'Midjourney v8'
]);

const fabricatedModels = [
  'Claude 3.5 Opus',
  'Claude 4.5 Sonnet',
  'Claude 4.5 Opus',
  'Claude 4.6 Sonnet',
  'Claude 4.7 Opus',
  'Claude 4.8 Sonnet',
  'Claude 4.8 Opus'
];

let failed = false;

// We check all SQL files in supabase/migrations and models-catalog.ts if it exists

// Allowlist detection, not blocklist. A blocklist only ever catches yesterday's
// fabrications: the first run of this check passed a freshly invented
// "Claude 4.9 Opus" because nobody had added it to the list yet. Instead, find
// anything shaped like a vendor model name and require it to be a name we have
// verified. A genuinely new model is added to validModels in the same commit
// that introduces it, which is the point — someone states that it is real.
const MODEL_NAME_RE =
  /\b(?:Claude|GPT|Gemini|Llama|Mistral|Grok|Qwen|DeepSeek|Phi|Sora)[ -][\w.]*\d[\w.]*(?:[ -](?:Opus|Sonnet|Haiku|Pro|Flash|Turbo|Instant|mini|Max|Ultra|Codex))?/g;

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');

  for (const fakeModel of fabricatedModels) {
    if (content.includes(`'${fakeModel}'`) || content.includes(`"${fakeModel}"`)) {
      console.error(`ERROR: known fabricated model "${fakeModel}" in ${filePath}`);
      failed = true;
    }
  }

  const quoted = content.match(/'[^'\n]{3,60}'|"[^"\n]{3,60}"/g) || [];
  for (const raw of quoted) {
    const value = raw.slice(1, -1).trim();
    const matches = value.match(MODEL_NAME_RE);
    if (!matches) continue;
    if (matches[0] !== value) continue; // only flag when the whole string is a model name
    if (validModels.has(value)) continue;
    if (fabricatedModels.includes(value)) continue; // already reported above
    console.error(
      `ERROR: unverified model name "${value}" in ${filePath} — add it to validModels once confirmed released, or remove it`,
    );
    failed = true;
  }
}

const BASELINE_PATH = join(process.cwd(), '.model-catalog-baseline');
const baseline = existsSync(BASELINE_PATH)
  ? new Set(
      readFileSync(BASELINE_PATH, 'utf-8')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#')),
    )
  : new Set();

const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
if (existsSync(migrationsDir)) {
  const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  for (const file of files) {
    if (!file.includes('remove_fake_models') && !baseline.has(file)) {
      checkFile(join(migrationsDir, file));
    }
  }
}

const catalogPath = join(process.cwd(), 'src', 'lib', 'constants', 'models-catalog.ts');
if (existsSync(catalogPath) && !baseline.has('models-catalog.ts')) {
  checkFile(catalogPath);
}

if (failed) {
  process.exit(1);
} else {
  console.log("Model catalog check passed. No fabricated models found.");
  process.exit(0);
}
