const fs = require('fs');
const path = require('path');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error("CRITICAL ERROR: OPENROUTER_API_KEY is missing from .env");
  process.exit(1);
}

// Yüksek hacimli API istekleri için Rate Limit (Saniye/Dakika) koruyucusu
const CONCURRENCY_LIMIT = 15; 

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllModels() {
  console.log("🌐 [OMNI SWARM] OpenRouter üzerinden havuzdaki tüm modeller çekiliyor...");
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      }
    });
    const data = await response.json();
    if (!data.data) throw new Error("Model listesi alınamadı.");
    
    // Yalnızca text-to-text ve aktif olan modelleri filtrele
    const textModels = data.data.filter(m => 
      !m.id.includes("vision") && 
      !m.id.includes("image") && 
      !m.id.includes("tts") &&
      !m.id.includes("embedding") &&
      !m.id.includes("dall-e") &&
      !m.id.includes("flux") &&
      !m.id.includes("midjourney") &&
      !m.id.includes("sdxl")
    ).map(m => m.id);
    
    console.log(`✅ [OMNI SWARM] Havuzdan başarıyla ${textModels.length} model tespit edildi!`);
    return textModels;
  } catch (err) {
    console.error("❌ [OMNI SWARM] Model listesi çekilirken hata:", err.message);
    // Hata durumunda dev bir yedek liste dön (111 model simülasyonu için fallback)
    return ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-pro-1.5", "meta-llama/llama-3.1-405b-instruct"];
  }
}

async function askModel(modelId, payload) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/antigravity",
        "X-Title": "Antigravity OS"
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: "You are an AI trend analyzer and master architect. Read the Alparai SaaS context. What is the single most valuable, future-proof AI feature we should code into this SaaS right now? Output exactly ONE feature. Max 50 words. No intro/outro." },
          { role: "user", content: payload }
        ],
        temperature: 0.8,
        max_tokens: 150
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content.trim();
  } catch (err) {
    return `[API ERROR / 429] Self-healing logic override required.`;
  }
}

async function processInChunks(models, payload) {
  const results = [];
  let chunkIndex = 0;
  
  for (let i = 0; i < models.length; i += CONCURRENCY_LIMIT) {
    const chunk = models.slice(i, i + CONCURRENCY_LIMIT);
    console.log(`🚀 [OMNI SWARM] Chunk ${++chunkIndex} işleniyor... (${chunk.length} model)`);
    
    const promises = chunk.map(async (model) => {
      const idea = await askModel(model, payload);
      console.log(`✅ Yanıt alındı: ${model}`);
      return { model, idea };
    });
    
    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
    
    // OpenRouter Rate Limit korunması için 2 saniye bekle
    if (i + CONCURRENCY_LIMIT < models.length) {
      await delay(2000);
    }
  }
  
  return results;
}

async function runOmniSwarm() {
  const allModels = await fetchAllModels();
  // Güvenlik ve UI kotasını zorlamamak adına, sistemde en az 111 model varsa test ediyoruz.
  // Kullanıcı "havuzdaki bütün modeller" dediği için tamamını kullanacağız.
  const targetModels = allModels; 
  
  console.log(`🌌 [V7 GENESIS] BAŞLATILIYOR... Toplam ${targetModels.length} dış modele tek seferde mühendislik isteği atılacak!`);
  
  let payload = "Antigravity OS V6 Omniscience aşamasında (Worker Threads, Quantum-Temporal Scheduler, Event Bus). İnsanlığın 50 yıl ilerisine gitmek için V7 GENESIS mimarisi ne olmalıdır?";

  const results = await processInChunks(targetModels, payload);
  
  // Başarılı (Error almayan) yanıtları filtrele
  const validResults = results.filter(r => !r.idea.includes("[API ERROR"));
  
  let report = `# 🌐 V7 GENESIS: ${validResults.length} MODEL CONSENSUS REPORT\n\n`;
  for (const res of validResults) {
    report += `### Model: ${res.model}\n${res.idea}\n\n---\n`;
  }

  const reportPath = path.join(__dirname, "../scratch/alparai_all_models_innovation.md");
  fs.writeFileSync(reportPath, report);
  
  console.log(`🎉 [V7 GENESIS] Sentez Raporu Oluşturuldu (${validResults.length} başarılı yanıt): ${reportPath}`);
  
  // Sentezleme işlemi - 100+ modelin fikrini dev bir prompt ile harmanlayacağız.
  console.log("🧠 [V7 GENESIS] Yüzlerce Modelin Fikri GPT-4o Tarafından Sentezleniyor...");
  
  // Eğer report çok uzunsa (Token limiti), sadece GPT-4o veya Claude 3.5 Sonnet'e atacağız.
  const synthesisPrompt = `
İşte dünyanın en iyi AI modellerinin (toplam ${validResults.length} adet) "V7 GENESIS" işletim sistemi mimarisi için sunduğu saf mühendislik fikirleri:

${report}

GÖREV: Bu muazzam veri havuzundaki yüzlerce fikri analiz et. Birbirini tamamlayanları birleştir, zayıf olanları ele. Sonuç olarak Antigravity OS'i İNSANLIĞIN 50 YIL İLERİSİNE taşıyacak "V7 GENESIS MASTER BLUEPRINT"i oluştur. Sadece 5 devasa, ultra-kompleks ve uygulanabilir madde yaz. Kod yazma.
`;

  // Sentez için en güçlü modeli kullanıyoruz.
  const finalSynthesis = await askModel("openai/gpt-4o", synthesisPrompt);
  
  const finalPath = path.join(__dirname, "../scratch/alparai_innovation_master_blueprint.md");
  fs.writeFileSync(finalPath, `# V7 GENESIS MASTER BLUEPRINT (${validResults.length}-MODEL SYNTHESIS)\n\n${finalSynthesis}`);
  console.log(`🚀 [V7 GENESIS] Master Blueprint Hazır: ${finalPath}`);
}

runOmniSwarm();
