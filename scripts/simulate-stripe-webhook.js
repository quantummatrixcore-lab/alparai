/**
 * simulate-stripe-webhook.js
 * Simulates a Stripe checkout.session.completed webhook hitting the local endpoint.
 */
const crypto = require("crypto");

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_secret";
const endpointUrl = process.argv[2] || "http://localhost:3000/api/webhooks/stripe";

const payload = {
  id: "evt_test_webhook",
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_a1b2c3d4e5f6",
      object: "checkout.session",
      customer: "cus_test123",
      payment_status: "paid",
      metadata: {
        userId: "test_user_id",
      },
    },
  },
};

const payloadString = JSON.stringify(payload, null, 2);

const timestamp = Math.floor(Date.now() / 1000);
const signaturePayload = `${timestamp}.${payloadString}`;
const signature = crypto
  .createHmac("sha256", endpointSecret)
  .update(signaturePayload)
  .digest("hex");

const stripeSignatureHeader = `t=${timestamp},v1=${signature}`;

console.log(`Sending webhook to ${endpointUrl}...`);

fetch(endpointUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Stripe-Signature": stripeSignatureHeader,
  },
  body: payloadString,
})
  .then(async (res) => {
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response: ${text}`);
  })
  .catch((err) => {
    console.error("Error sending webhook:", err);
  });
