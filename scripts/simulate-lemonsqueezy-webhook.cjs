/**
 * simulate-lemonsqueezy-webhook.js
 * Simulates a Lemon Squeezy order_created webhook hitting the endpoint with valid HMAC-SHA256 signature.
 * Usage: node scripts/simulate-lemonsqueezy-webhook.js [endpointUrl]
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Read secret from .env if available
let endpointSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
if (!endpointSecret) {
  try {
    const envFile = path.join(__dirname, "..", ".env");
    if (fs.existsSync(envFile)) {
      const c = fs.readFileSync(envFile, "utf8");
      const m = c.match(/^\s*LEMONSQUEEZY_WEBHOOK_SECRET\s*=\s*([^\r\n#]+)/m);
      if (m) endpointSecret = m[1].trim();
    }
  } catch (e) {}
}

const endpointUrl = process.argv[2] || "http://localhost:3000/api/webhooks/lemonsqueezy";

if (!endpointSecret) {
  console.error("❌ LEMONSQUEEZY_WEBHOOK_SECRET not found in environment or .env");
  process.exit(1);
}

const payload = {
  meta: {
    event_name: "order_created",
    custom_data: {
      userId: "test_user_simulated_id",
      tier: "developer"
    }
  },
  data: {
    id: "ls_sim_" + Date.now(),
    type: "orders",
    attributes: {
      store_id: 469668,
      customer_id: 99999,
      identifier: "sim-uuid-" + Date.now(),
      order_number: 101,
      user_name: "Simulated Customer",
      user_email: "developer@alparai.com",
      currency: "TRY",
      subtotal: 99000,
      discount_total: 0,
      tax: 0,
      total: 99000,
      subtotal_usd: 2850,
      total_usd: 2850,
      status: "paid",
      refunded: false,
      test_mode: true
    }
  }
};

const payloadString = JSON.stringify(payload);
const signature = crypto
  .createHmac("sha256", endpointSecret)
  .update(payloadString)
  .digest("hex");

console.log(`⚡ Sending Lemon Squeezy webhook to: ${endpointUrl}`);
console.log(`🔑 Signature (HMAC-SHA256): ${signature.slice(0, 16)}...`);

fetch(endpointUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-signature": signature
  },
  body: payloadString
})
  .then(async res => {
    console.log(`🟢 HTTP Status: ${res.status}`);
    const text = await res.text();
    console.log(`📥 Response: ${text}`);
  })
  .catch(err => {
    console.error("❌ Error sending webhook:", err.message);
  });
