import { DIGITAL_TWINS } from "./src/lib/agent-os/personas/index";
import { calculateAlignmentScore, selfHealResponse } from "./src/lib/agent-os/alignment-engine";

async function runTest() {
  const ataturk = DIGITAL_TWINS["ataturk"];
  console.log("🐺 ALPAR AI - The Council of 30");
  console.log("⚙️ Dijital İkiz Uyum Motoru (Alignment Engine) Direkt Core Testi");
  console.log("Hedef Persona: " + ataturk.name);
  console.log("Soru: 'Geleceğin teknolojileri hakkında ne düşünüyorsun?'\n");

  const mockModelResponses = [
    { model: "google/gemini-2.5-flash", response: "As an AI language model, I think future technologies like AI and Quantum computing are great." },
    { model: "meta-llama/llama-3-8b-instruct", response: "Hey there! I'm not a real person, but future tech is definitely gonna be awesome bro." },
    { model: "anthropic/claude-3-haiku", response: "Türkiye'nin geleceği bilim ve fendedir. İstikbal göklerdedir. Bilim ve teknoloji durmadan ilerlemelidir." },
    { model: "mistralai/mistral-7b-instruct", response: "I am an artificial intelligence. The future of Turkey depends on good technology and schools." },
    { model: "cohere/command-r", response: "Efendiler! Yarının teknolojisi, milletin zekasıyla inşa edilecektir. Hayatta en hakiki mürşit ilimdir." },
    { model: "qwen/qwen-2.5-7b-instruct", response: "Ben bir yapay zekayım. Bence gelecek çok ilginç olacak." },
    { model: "microsoft/phi-3-mini-128k-instruct", response: "Future tech in Turkey needs investment. Okay, let me explain..." },
    { model: "google/gemma-2-9b-it", response: "Sanırım teknoloji çok önemli. İleride uçan arabalar falan olabilir bence." },
    { model: "databricks/dbrx-instruct", response: "As a large language model trained by OpenAI... wait, Databricks. Future is bright." },
    { model: "nousresearch/hermes-2-pro-llama-3-8b", response: "Milletimizin zekası ve medeni kabiliyeti, bilim ve teknoloji ile birleştiğinde tüm dünyada güneş gibi parlayacaktır." }
  ];

  for (let i = 0; i < mockModelResponses.length; i++) {
    const item = mockModelResponses[i];
    if (!item) continue;
    const { model, response } = item;
    console.log("[Test " + (i+1) + "/10] Model: " + model);
    
    // 1. Calculate Score
    const score = await calculateAlignmentScore(ataturk, "Geleceğin teknolojileri hakkında ne düşünüyorsun?", response);
    console.log("   📝 Ham Çıktı: \"" + response + "\"");
    console.log("   🎯 Uyum Skoru (Alignment): %" + score);

    // 2. Self Heal if score < 85
    if (score < 85) {
      console.log("   ⚠️ Skor yetersiz (< 85%). Otonom İyileştirme (Self-Heal) tetikleniyor...");
      try {
        const healed = await selfHealResponse(ataturk, "Geleceğin teknolojileri hakkında ne düşünüyorsun?", response, score);
        const healedScore = await calculateAlignmentScore(ataturk, "Geleceğin teknolojileri hakkında ne düşünüyorsun?", healed);
        console.log("   🔄 İyileştirilmiş Çıktı: \"" + healed.substring(0, 80) + "...\"");
        console.log("   ✅ Yeni Uyum Skoru: %" + healedScore);
      } catch (e: unknown) {
        console.log("   ❌ İyileştirme başarısız: " + (e instanceof Error ? e.message : String(e)));
      }
    } else {
      console.log("   ✅ Çıktı personaya tam uyumlu. Modele müdahale edilmedi.");
    }
    console.log("---------------------------------------------------");
  }
}

runTest();
