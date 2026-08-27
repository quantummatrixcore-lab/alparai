import fs from "fs";
import path from "path";

async function fetchHNStories(query: string, count: number = 5) {
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${count}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HN API Hatası: ${res.statusText}`);
    const data = await res.json();
    return data.hits.map((hit: any) => ({
      title: hit.title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      points: hit.points,
      author: hit.author,
    }));
  } catch (error) {
    console.error(`HackerNews Çekilirken Hata (${query}):`, error);
    return [];
  }
}

async function fetchGitHubRepos(date: string, count: number = 5) {
  const query = `topic:artificial-intelligence topic:llm topic:agent created:>${date}`;
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${count}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Alpar-AI-Agent-OS",
      },
    });
    if (!res.ok) throw new Error(`GitHub API Hatası: ${res.statusText}`);
    const data = await res.json();
    return data.items.map((repo: any) => ({
      name: repo.full_name,
      url: repo.html_url,
      stars: repo.stargazers_count,
      description: repo.description,
      language: repo.language,
    }));
  } catch (error) {
    console.error(`GitHub Repoları Çekilirken Hata:`, error);
    return [];
  }
}

async function main() {
  console.log("Teşkilat-ı Mahsusa: Sabah Brifingi Başlatılıyor...");

  const today = new Date();
  const dateStr = today.toISOString().split("T")[0] ?? "2026-08-15";

  // 7 gün öncesini hesapla (yeni çıkan repo bulmak için)
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);
  const lastWeekStr = lastWeek.toISOString().split("T")[0] ?? "2026-08-08";

  console.log("HackerNews taranıyor...");
  const hnLLM = await fetchHNStories("LLM", 5);
  const hnAgent = await fetchHNStories("AI Agent", 5);

  console.log("GitHub taranıyor...");
  const githubRepos = await fetchGitHubRepos(lastWeekStr, 10);

  // Markdown Oluştur
  let md = `# Otonom Sabah Brifingi - ${dateStr}\n\n`;
  md += `> Bu rapor **Agent-OS (Kurt Sürüsü)** tarafından küresel yapay zeka ekosistemindeki son gelişmeleri Kurucu İrade'ye sunmak üzere otomatik olarak hazırlanmıştır.\n\n`;

  md += `## 🐙 GitHub'da Yükselen Yeni Projeler (Son 7 Gün)\n`;
  if (githubRepos.length > 0) {
    githubRepos.forEach((r: any) => {
      md += `- **[${r.name}](${r.url})** (⭐ ${r.stars} | 🛠️ ${r.language || "N/A"})\n`;
      md += `  - ${r.description || "Açıklama yok"}\n`;
    });
  } else {
    md += `- _Yeni dikkat çeken proje bulunamadı._\n`;
  }

  md += `\n## 📰 HackerNews: LLM Gündemi\n`;
  if (hnLLM.length > 0) {
    hnLLM.forEach((h: any) => {
      md += `- [${h.title}](${h.url}) (🔼 ${h.points} points)\n`;
    });
  } else {
    md += `- _Önemli bir başlık bulunamadı._\n`;
  }

  md += `\n## 📰 HackerNews: AI Agent Gündemi\n`;
  if (hnAgent.length > 0) {
    hnAgent.forEach((h: any) => {
      md += `- [${h.title}](${h.url}) (🔼 ${h.points} points)\n`;
    });
  } else {
    md += `- _Önemli bir başlık bulunamadı._\n`;
  }

  md += `\n---\n*Rapor Sonu. Kopyala-Yapıştır dönemi bitmiştir. Sadece vizyonu yönet.*`;

  // Dosyayı kaydet
  const dirPath = path.join(process.cwd(), "docs", "reports", "briefings");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, `${dateStr}-brifing.md`);
  fs.writeFileSync(filePath, md, "utf-8");

  console.log(`Brifing başarıyla oluşturuldu: ${filePath}`);
}

main().catch((err) => {
  console.error("Brifing oluşturulurken ölümcül hata:", err);
  process.exit(1);
});
