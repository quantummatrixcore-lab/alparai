import fs from "fs";
import path from "path";
import { Resend } from "resend";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTrustBadgeEmails() {
  console.log("Starting ALPAR AI Trust Badge Outreach (SIGMA-1)...");

  const contentPath = path.join(process.cwd(), "docs", "outreach", "trust-badge-outreach.md");
  const content = fs.readFileSync(contentPath, "utf-8");

  const emails: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    if (line.startsWith("|") && line.includes("@")) {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length > 3) {
        const part = parts[3];
        if (part && part.includes("@")) {
          const email = part.replace(/mailto:/g, "").trim();
          if (email.includes("@")) {
            emails.push(email);
          }
        }
      }
    }
  }

  console.log(`Found ${emails.length} vendor emails.`);

  const subject = "ALPAR AI Trust Badge — Madde 73 Uyumu İçin Hazır Embedded Çözüm";
  const textBody = `Sayın Uyum ve AI Yönetim Ekibi,

AB Yapay Zekâ Yasası Madde 73 kapsamında, şeffaflık ve kayıt tutma gereksinimlerini karşılamak isteyen sistem sağlayıcıları için geliştirdiğimiz ALPAR AI Trust Badge çözümünü sunmak isteriz.

ALPAR AI Trust Badge, yapay zekâ modelinizin veya platformunuzun bağımsız ve gerçek zamanlı doğrulama durumunu doğrudan web arayüzünüzde sergilemenizi sağlar. Tüm denetim verileri DeHost AB veri bölgesinde (GDPR uyumlu) saklanır.

Entegrasyon yalnızca tek satırlık bir HTML embed kodu ile 2 dakikada tamamlanmaktadır:
https://alparai.com/badge.js

Ücretsiz uyum rozetinizi aktive etmek ve denetim raporlarını incelemek için bizimle iletişime geçebilirsiniz.

Saygılarımızla,
ALPAR AI Ekibi
hello@alparai.com | https://alparai.com`;

  let successCount = 0;
  let failCount = 0;

  for (const email of emails) {
    try {
      console.log(`Sending to ${email}...`);
      const { data, error } = await resend.emails.send({
        from: "ALPAR AI Ekibi <hello@alparai.com>",
        to: email,
        subject: subject,
        text: textBody,
      });

      if (error) {
        console.error(`Failed to send to ${email}:`, error);
        failCount++;
      } else {
        console.log(`Successfully sent to ${email} (ID: ${data?.id})`);
        successCount++;
      }

      // Rate limiting: wait 1 second between emails
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Exception sending to ${email}:`, err);
      failCount++;
    }
  }

  console.log(`\nOutreach Complete. Success: ${successCount}, Failed: ${failCount}`);
}

sendTrustBadgeEmails().catch(console.error);
