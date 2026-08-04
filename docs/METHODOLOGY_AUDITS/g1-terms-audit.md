# G1 Terms of Service Gap Audit & Mitigation — 2026-07-12

======================================================

## 1. i18n Compliance Audit

- **Target File:** [Terms of Service Page](file:///d:/Alparai/src/app/[locale]/legal/terms/page.tsx)
- **Audit Status:** **PASS**
- **Verification:** The page utilizes next-intl (`getTranslations({ locale, namespace: "legal" })`) for metadata and page content rendering. No hardcoded English texts are present in the layout itself.

---

## 2. Gap Identification & Analysis

Under the Moody's-for-AI accountability model, the terms must protect the platform from liability regarding:

1. **Incident Severity Scores:** Disclaiming liability for calculated incident risks and public safety scores.
2. **K-BENCHMARK Scores:** Establishing that benchmarks do not constitute formal regulatory clearance or compliance certification under the EU AI Act.
3. **"Ready Aligned" / "Aligned" wording:** Explicitly clarifying that "ready-aligned" status evaluations do not signify legally binding compliance certifications.

---

## 3. Disclaimers Addition (Gap Fill Plan)

We will modify `messages/en.json` and `messages/tr.json` to zenginleştirmek (enrich) the following keys under the `legal` namespace:

- `tNoWarrantyText`
- `tLiabilityText`

### English Modifications:

- **tNoWarrantyText:** "The Platform is provided 'as is' without warranties of any kind. We do not guarantee the accuracy, completeness, or usefulness of any user-submitted content, incident severity scores, ratings, or K-BENCHMARK metrics. Always verify before acting on information posted here."
- **tLiabilityText:** "To the maximum extent permitted by law, we are not liable for user-submitted content, third-party links, or indirect, incidental, or consequential damages arising from use of the Platform. Calculated incident severity ratings, 'Ready Aligned' compliance status assessments, or K-BENCHMARK scores do not constitute legal advice, official regulatory determination, or certification under the EU AI Act."

### Turkish Modifications:

- **tNoWarrantyText:** "Platform olduğu gibi sunulmaktadır. Kullanıcılar tarafından gönderilen içeriklerin, olay ciddiyet derecelerinin, derecelendirmelerin veya K-BENCHMARK metriklerinin doğruluğunu, eksiksizliğini veya kullanışlılığını garanti etmiyoruz. Burada paylaşılan bilgilere göre hareket etmeden önce her zaman doğrulama yapınız."
- **tLiabilityText:** "Yasaların izin verdiği azami ölçüde, kullanıcılar tarafından gönderilen içeriklerden, üçüncü taraf bağlantılarından veya Platformun kullanımından doğan dolaylı, arızi veya netice kabilinden doğan zararlardan sorumlu değiliz. Hesaplanan olay ciddiyet derecelendirmeleri, 'Ready Aligned' uyumluluk değerlendirmeleri veya K-BENCHMARK puanları yasal tavsiye, resmi düzenleyici kurum kararı veya AB Yapay Zeka Yasası kapsamında resmi bir sertifika niteliği taşımaz."
