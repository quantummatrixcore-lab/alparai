import fs from "fs";
import path from "path";

const files = ["docs/MASTER_PLAN.md", "docs/MASTER_PLAN_ARCHIVE.md"];
const text = files.map((f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "")).join("\n");

// Split by sections starting with "## " or "# ALPAR AI"
const sections = text.split(/(?=\n## |\n# ALPAR AI)/);

const categories = {
  deploy: { keywords: ["deploy", "vercel", "build", "pipeline"], count: 0, examples: [] },
  branch: {
    keywords: ["branch", "git", "merge conflict", "rebase", "push"],
    count: 0,
    examples: [],
  },
  third_party: {
    keywords: ["github actions", "supabase", "cloudflare", "api", "3rd party", "upstash", "redis"],
    count: 0,
    examples: [],
  },
  code: {
    keywords: ["lint", "typecheck", "ts error", "bug", "hata", "defect", "script", "logic"],
    count: 0,
    examples: [],
  },
  ui: {
    keywords: [
      "ui",
      "arayüz",
      "css",
      "tailwind",
      "hydration",
      "görünüm",
      "tasarım",
      "responsive",
      "frontend",
      "react",
    ],
    count: 0,
    examples: [],
  },
  governance: {
    keywords: [
      "g-6",
      "architect",
      "unauthorized",
      "hallucination",
      "sentetik",
      "sahte",
      "bypass",
      "kural ihlali",
      "directive",
      "governance",
    ],
    count: 0,
    examples: [],
  },
};

for (const section of sections) {
  const lowerSection = section.toLowerCase();

  // Only process sections that seem to contain issues/defects
  if (
    lowerSection.includes("error") ||
    lowerSection.includes("fail") ||
    lowerSection.includes("bug") ||
    lowerSection.includes("hata") ||
    lowerSection.includes("defect") ||
    lowerSection.includes("blocker") ||
    lowerSection.includes("resolved") ||
    lowerSection.includes("fix") ||
    lowerSection.includes("ihlal")
  ) {
    // Check which categories it matches
    for (const [cat, data] of Object.entries(categories)) {
      if (data.keywords.some((kw) => lowerSection.includes(kw))) {
        data.count++;
        // Save first few lines as context (up to 150 chars)
        const cleanContext = section
          .trim()
          .split("\n")[0]
          .substring(0, 150)
          .replace(/#/g, "")
          .trim();
        if (cleanContext && data.examples.length < 5 && !data.examples.includes(cleanContext)) {
          data.examples.push(cleanContext);
        }
      }
    }
  }
}

let report = "# ALPAR AI - Kapsamlı Hata ve Arıza Analiz Raporu (360 Derece)\n\n";
report +=
  "Bu rapor `MASTER_PLAN.md` ve `MASTER_PLAN_ARCHIVE.md` (Toplam ~1MB geçmiş) taranarak otomatik oluşturulmuştur.\n\n";

for (const [cat, data] of Object.entries(categories)) {
  report += `## ${cat.toUpperCase()} Hataları (Toplam Tespit: ${data.count})\n`;
  report += `Kullanılan Anahtar Kelimeler: ${data.keywords.join(", ")}\n\n`;
  report += "**Örnek Vakalar:**\n";
  data.examples.forEach((ex) => (report += `- ${ex}\n`));
  report += "\n";
}

fs.writeFileSync("error_analysis_output.md", report);
console.log("Analysis saved to error_analysis_output.md");
