const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.AI_STUDIO_API_KEY;
const MODEL = "gemini-1.5-pro";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}?key=${API_KEY}`;

async function checkApiQuota() {
  try {
    const response = await axios.get(API_URL);
    console.log("[+] AI Studio API Aktif.");
    return true;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error("[!] KRİTİK UYARI: AI Studio Kotası Aşıldı (429 Too Many Requests)!");
    } else {
      console.error(
        "[-] API Kontrol Hatası:",
        error.response ? error.response.data : error.message,
      );
    }
    return false;
  }
}

checkApiQuota();
