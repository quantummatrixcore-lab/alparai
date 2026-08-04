const fs = require("fs");
const path = require("path");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GROQ_API_KEY && !OPENROUTER_API_KEY && !OPENAI_API_KEY && !GEMINI_API_KEY) {
  console.error(
    "At least one API key environment variable is required (GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY).",
  );
  process.exit(1);
}

let useOpenRouterFirst = false;

function getKeyValuePairs(obj, prefix = "") {
  let pairs = [];
  for (const k in obj) {
    if (typeof obj[k] === "object" && obj[k] !== null) {
      pairs = pairs.concat(getKeyValuePairs(obj[k], prefix + k + "."));
    } else {
      pairs.push({ key: prefix + k, val: obj[k] });
    }
  }
  return pairs;
}

function setNestedValue(obj, keyPath, val) {
  const parts = keyPath.split(".");
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!curr[part] || typeof curr[part] !== "object") {
      curr[part] = {};
    }
    curr = curr[part];
  }
  curr[parts[parts.length - 1]] = val;
}

function isTranslatable(str) {
  if (typeof str !== "string") return false;
  if (str.length < 3) return false;
  if (str.startsWith("http://") || str.startsWith("https://")) return false;
  if (str === "ALPAR AI") return false;
  if (!/[a-zA-Z]/.test(str)) return false;
  return true;
}

async function translateBatchWithRetry(batchMap, targetLang, retries = 5) {
  const langSpecs = {
    de: {
      name: "German",
      context:
        "Translate into natural, professional German as used in premium enterprise SaaS products (like Stripe or Datadog). Use standard industry terminology (e.g., 'KI-Haftung', 'Vorfallsbericht', 'Transparenzregister', 'Vertrauensindex', 'Konformität'). Avoid robotic or literal word-for-word translation. Keep UI concise, elegant, and native.",
    },
    fr: {
      name: "French",
      context:
        "Translate into natural, high-end French for enterprise AI governance platforms. Use proper French tech/legal terminology (e.g., 'Responsabilité IA', 'Rapport d'incident', 'Registre de transparence', 'Conformité réglementaire'). Make UI strings flow naturally without literal translation artifacts.",
    },
    ru: {
      name: "Russian",
      context:
        "Translate into natural, professional Russian suitable for AI safety and legal compliance platforms. Use appropriate terminology (e.g., 'Ответственность ИИ', 'Отчет об инциденте', 'Реестр прозрачности', 'Соответствие требованиям'). Ensure proper case agreements and natural UI phrasing.",
    },
  };

  const spec = langSpecs[targetLang];

  const systemPrompt = `You are a Senior Staff Software Localization Engineer & Domain Expert in AI Safety, Legal Tech, and Governance for ALPAR AI.
Your task is to translate UI copy from English to ${spec.name}.

RULES:
1. ${spec.context}
2. Preserve all variable placeholders like {count}, {name}, {locale}, {url}, etc. EXACTLY as written.
3. NEVER translate brand names: 'ALPAR AI', 'Supabase', 'Vercel', 'Next.js', 'OpenAI', 'Anthropic', 'Google Gemini', 'K-Benchmark'.
4. Do NOT translate technical terms that are standard in international tech copy unless there is a clear, standard native equivalent.
5. Return ONLY a valid JSON object matching the input structure. No markdown formatting (\`\`\`json), no commentary.`;

  const userPrompt = `Input JSON to translate into ${spec.name}:\n${JSON.stringify(batchMap, null, 2)}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const providers = [];
    if (GROQ_API_KEY && !useOpenRouterFirst) {
      providers.push({
        name: "groq",
        url: "https://api.groq.com/openai/v1/chat/completions",
        key: GROQ_API_KEY,
        model: "llama-3.3-70b-versatile",
      });
    }
    if (OPENROUTER_API_KEY) {
      providers.push({
        name: "openrouter",
        url: "https://openrouter.ai/api/v1/chat/completions",
        key: OPENROUTER_API_KEY,
        model: "google/gemini-2.5-flash",
      });
    }
    if (OPENAI_API_KEY) {
      providers.push({
        name: "openai",
        url: "https://api.openai.com/v1/chat/completions",
        key: OPENAI_API_KEY,
        model: "gpt-4o-mini",
      });
    }
    if (GEMINI_API_KEY) {
      providers.push({
        name: "gemini",
        url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        key: GEMINI_API_KEY,
        model: "gemini-1.5-flash",
      });
    }
    if (providers.length === 0 && GROQ_API_KEY) {
      providers.push({
        name: "groq",
        url: "https://api.groq.com/openai/v1/chat/completions",
        key: GROQ_API_KEY,
        model: "llama-3.3-70b-versatile",
      });
    }

    for (const provider of providers) {
      try {
        const res = await fetch(provider.url, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + provider.key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.1,
            response_format: { type: "json_object" },
          }),
        });

        if (res.status === 429) {
          console.warn(`[${provider.name.toUpperCase()} Rate Limit 429] encountered.`);
          if (provider.name === "groq") {
            console.warn(`Switching to other providers for subsequent requests.`);
            useOpenRouterFirst = true;
          }
          continue;
        }

        if (!res.ok) {
          const errText = await res.text();
          console.error(`[${provider.name.toUpperCase()}] API Error (${res.status}):`, errText);
          continue;
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) continue;

        return JSON.parse(content);
      } catch (err) {
        console.error(`[${provider.name.toUpperCase()}] Request failed:`, err.message);
      }
    }

    console.warn(
      `All providers failed on attempt ${attempt}/${retries}. Waiting 5 seconds before next attempt...`,
    );
    await new Promise((r) => setTimeout(r, 5000));
  }
  return null;
}

async function processLanguage(lang) {
  console.log(`\n========================================`);
  console.log(`Starting High-Quality Enterprise Translation for: ${lang.toUpperCase()}`);
  console.log(`========================================`);

  const enPath = path.join(__dirname, "../messages/en.json");
  const targetPath = path.join(__dirname, `../messages/${lang}.json`);

  const enObj = JSON.parse(fs.readFileSync(enPath, "utf8"));
  const targetObj = JSON.parse(fs.readFileSync(targetPath, "utf8"));

  const enPairs = getKeyValuePairs(enObj);
  const targetPairsMap = new Map(getKeyValuePairs(targetObj).map((p) => [p.key, p.val]));

  const toTranslate = [];
  for (const { key, val } of enPairs) {
    const targetVal = targetPairsMap.get(key);
    if ((!targetVal || targetVal === val) && isTranslatable(val)) {
      toTranslate.push({ key, val });
    }
  }

  console.log(`Found ${toTranslate.length} untranslated strings for ${lang}.`);

  if (toTranslate.length === 0) {
    console.log(`No missing translations for ${lang}.`);
    return;
  }

  const BATCH_SIZE = 50;
  let translatedCount = 0;

  for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
    const chunk = toTranslate.slice(i, i + BATCH_SIZE);
    const batchMap = {};
    for (const item of chunk) {
      batchMap[item.key] = item.val;
    }

    console.log(
      `[${lang.toUpperCase()}] Translating batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
        toTranslate.length / BATCH_SIZE,
      )} (${chunk.length} items)...`,
    );

    const translatedMap = await translateBatchWithRetry(batchMap, lang);

    if (translatedMap) {
      for (const key in translatedMap) {
        if (translatedMap[key] && typeof translatedMap[key] === "string") {
          setNestedValue(targetObj, key, translatedMap[key]);
          translatedCount++;
        }
      }
      fs.writeFileSync(targetPath, JSON.stringify(targetObj, null, 2), "utf8");
    } else {
      console.warn(`[${lang.toUpperCase()}] Batch failed after retries, skipping...`);
    }

    // 3 second delay to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  console.log(
    `Successfully completed professional translation for ${lang}: ${translatedCount} items.`,
  );
}

async function main() {
  const languages = ["de", "fr", "ru"];
  for (const lang of languages) {
    await processLanguage(lang);
  }
  console.log("\nAll high-quality enterprise translations completed!");
}

main();
