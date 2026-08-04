import { Resend } from "resend";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

const resend = new Resend(process.env.RESEND_API_KEY);
const OUTREACH_DIR = path.join(process.cwd(), "docs", "OUTREACH");
const FOUNDER_EMAIL = "quantum.matrix.core@gmail.com";
const FROM = "Ercüment Erden <ercument.erden@alparai.com>";

// Araştırılmış gerçek iletişim adresleri — güven seviyesiyle etiketlenmiş
const RECIPIENTS: Record<string, { to: string; confidence: "high" | "medium" | "low" }> = {
  "01_rumman_chowdhury.md": {
    to: "info@humane-intelligence.org",
    confidence: "high",
  },
  "02_sven_cattell.md": { to: "sarah@aivillage.org", confidence: "medium" },
  "03_irene_solaiman.md": {
    to: "irene@huggingface.co",
    confidence: "low",
  },
  "04_aviv_ovadya.md": { to: "av@aviv.me", confidence: "high" },
  "05_daniel_miessler.md": {
    to: "daniel@danielmiessler.com",
    confidence: "medium",
  },
  "06_yacine_jernite.md": {
    to: "yacine@huggingface.co",
    confidence: "high",
  },
  "07_sean_mcgregor.md": { to: "info@raicollab.org", confidence: "high" },
};

function fixSignature(content: string): string {
  // Replace gmail with professional alparai.com address in signature
  return content.replace(
    "quantum.matrix.core@gmail.com | https://alparai.com",
    "ercument.erden@alparai.com | https://alparai.com",
  );
}

function extractBodyText(content: string): string {
  // Strip markdown headers/metadata lines, keep the letter body
  const lines = content.split("\n");
  const bodyStart = lines.findIndex((l) => l.startsWith("Dear "));
  return bodyStart >= 0 ? lines.slice(bodyStart).join("\n") : content;
}

async function sendOutreachEmails() {
  const results: {
    file: string;
    to: string;
    confidence: string;
    resendId?: string;
    error?: string;
  }[] = [];

  const files = fs
    .readdirSync(OUTREACH_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  for (const file of files) {
    const recipientConfig = RECIPIENTS[file];
    if (!recipientConfig) {
      console.warn(`⚠️  No recipient configured for ${file} — skipping.`);
      continue;
    }

    const rawContent = fs.readFileSync(path.join(OUTREACH_DIR, file), "utf-8");
    const fixedContent = fixSignature(rawContent);

    // Extract subject from metadata line
    const subjectMatch = fixedContent.match(/\*\*Subject:\*\*\s*(.+)/);
    const subject =
      subjectMatch && subjectMatch[1]
        ? subjectMatch[1].trim()
        : `ALPAR AI Advisory Board Invitation`;

    // Letter body only (no markdown metadata)
    const bodyText = extractBodyText(fixedContent);

    // Medium/Low confidence: CC founder for manual verification
    const ccList = recipientConfig.confidence !== "high" ? [FOUNDER_EMAIL] : [];

    console.log(
      `\n📧 Sending to ${recipientConfig.to} [${recipientConfig.confidence.toUpperCase()}]...`,
    );
    console.log(`   Subject: ${subject}`);

    try {
      const payload: Parameters<typeof resend.emails.send>[0] = {
        from: FROM,
        to: recipientConfig.to,
        subject,
        text: bodyText,
      };
      if (ccList.length > 0) payload.cc = ccList;

      const data = await resend.emails.send(payload);

      if (data.error) {
        console.error(`   ❌ Error: ${JSON.stringify(data.error)}`);
        results.push({
          file,
          to: recipientConfig.to,
          confidence: recipientConfig.confidence,
          error: JSON.stringify(data.error),
        });
      } else {
        console.log(`   ✅ Sent. Resend ID: ${data.data?.id}`);
        results.push({
          file,
          to: recipientConfig.to,
          confidence: recipientConfig.confidence,
          resendId: data.data?.id,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ Exception: ${msg}`);
      results.push({
        file,
        to: recipientConfig.to,
        confidence: recipientConfig.confidence,
        error: msg,
      });
    }

    // Resend free tier: 10 req/s — 500ms delay is sufficient
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n\n=== GÖNDERIM RAPORU ===");
  console.log(`Toplam: ${results.length} / ${files.length} dosya işlendi`);
  const success = results.filter((r) => r.resendId);
  const failed = results.filter((r) => r.error);
  console.log(`✅ Başarılı: ${success.length}`);
  console.log(`❌ Başarısız: ${failed.length}`);
  if (failed.length > 0) {
    console.log("\nBaşarısız gönderimler:");
    for (const f of failed) {
      console.log(`  - ${f.file} → ${f.to}: ${f.error}`);
    }
  }
  console.log("\nResend ID Kaydı (MASTER_PLAN için):");
  for (const r of success) {
    console.log(`  ${r.file.replace(".md", "")} → ${r.resendId}`);
  }
}

sendOutreachEmails().catch(console.error);
