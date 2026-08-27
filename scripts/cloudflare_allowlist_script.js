const axios = require("axios");
require("dotenv").config();

const ZONE_ID = process.env.CF_ZONE_ID;
const API_TOKEN = process.env.CF_API_TOKEN;
const API_URL = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/firewall/access_rules/rules`;

async function addIpToAllowlist(ip, notes = "Automated allowlist via DevSecOps") {
  try {
    const response = await axios.post(
      API_URL,
      { mode: "whitelist", configuration: { target: "ip", value: ip }, notes: notes },
      { headers: { Authorization: `Bearer ${API_TOKEN}`, "Content-Type": "application/json" } },
    );
    console.log(`[+] Başarılı: ${ip} allowlist'e eklendi.`);
    return response.data;
  } catch (error) {
    console.error("[-] Hata:", error.response ? error.response.data : error.message);
  }
}
