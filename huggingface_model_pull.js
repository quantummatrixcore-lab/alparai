// huggingface_model_pull.js
require('dotenv').config();
const { HfInference } = require('@huggingface/inference');

// Kurt Sürüsü (Wolf Pack) Hugging Face Entegrasyon Modülü
// Kural 31: Sürünün Açık Kaynak Modellere Erişimi
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function pullAndRunModel(prompt) {
  try {
    console.log("[Wolf Pack] 🐺 Hugging Face modeli ile iletişim kuruluyor...");
    const response = await hf.textGeneration({
      // Sürünün taktiksel işlemleri için hızlı bir model
      model: 'mistralai/Mistral-Nemo-Instruct-2407', 
      inputs: `[Wolf Pack Directive]: ${prompt}`,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.3
      }
    });
    console.log("[Wolf Pack] 🐺 Taktiksel Veri Alındı.");
    return response.generated_text;
  } catch (error) {
    console.error("[Wolf Pack - HATA] 💥 Hugging Face operasyonu başarısız:", error.message);
    throw error;
  }
}

module.exports = { pullAndRunModel };
