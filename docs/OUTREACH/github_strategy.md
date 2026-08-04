# ALPAR AI: GitHub Outreach & Slopsquatting Strategy

## 1. Hedef ve Stratejik Vizyon

Yapay zeka modellerinin "halüsinasyon" (hallucination) görerek ürettiği sahte paket isimlerinin (slopsquatting) kötü niyetli kişilerce kaydedilerek (npm, PyPI) geliştiricilere zararlı yazılım yedirilmesi, sektördeki en büyük tedarik zinciri tehditlerinden biridir.

ALPAR AI olarak, kendi `Slopsquatting Feed` API'mizi **GitHub Security Advisory** ağına entegre ederek, geliştiricilerin sahte paket önerilerinden anında korunmasını sağlamalıyız.

## 2. CNA (CVE Numbering Authority) Süreci

- **Başvuru:** GitHub'da CNA statüsü alınması için MITRE veya GitHub tarafında resmi süreç başlatılmalı.
- **Kapsam:** "AI-Generated Slopsquatting Vulnerabilities"
- **API Entegrasyonu:** `https://alparai.com/api/v1/slopsquatting` endpoint'inden gelen JSON log'larının GitHub webhook'una aktarılması.

## 3. "Awesome AI Security" Repolarına Katkı

GitHub üzerinde açık kaynaklı AI güvenlik listelerinde (Awesome lists) ALPAR AI'ın yer alması gerekir:

- `awesome-ai-security`
- `awesome-llm-security`
- `awesome-ai-regulation`

**PR Taslağı (Örnek):**

```markdown
- [ALPAR AI](https://alparai.com) - Open-source, cryptographic trust and accountability infrastructure for AI incidents (EU AI Act compliant).
```

## 4. Açık Kaynak Geliştirici Topluluğu Aksiyonu

ALPAR AI altyapısının geliştiricilere ulaşması için, projede aktif olarak Issue/PR açan katkı sağlayıcılara (Contributors) "Verified AI Auditor" rozeti veya özel dijital sertifika verilebilir.
