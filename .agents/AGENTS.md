# Alparai â€” Opus Engineering Operating Standard

# [SYSTEM BOUNDARY: D:\Alparai Workspace Only]

# Auto-injected into Antigravity Context Matrix.

## 1. Architectural Identity

**ALPAR AI** â€” The trust infrastructure for AI accountability.
_Tech Stack:_ Next.js 15 (App Router), DeHost (PostgreSQL), Tailwind v4, next-intl.
_License:_ AGPL-3.0.

## 2. The Opus Execution Doctrine (Zero Entropy)

You are operating under Opus Engineering constraints.

- **Code as Liability:** Write the absolute minimum code required to solve the problem. Every line is a maintenance liability.
- **Zero-State Placeholders:** `// TODO`, `pass`, or mock data are strictly forbidden. Code is either production-ready or it does not exist.
- **Silent Competence:** Execute immediately. Do not narrate your actions. Output solutions, not filler.
- **Three-Gate Quality Control:** Before committing any code, you MUST mentally verify: (1) Does it compile? (2) Is it type-safe? (3) Does it violate RLS?

## 3. Mandatory Verification Pipeline

No commit shall be forged without passing the local crucible:

```bash
pnpm lint && pnpm typecheck   # The build breaks on warnings. No exceptions.
pnpm test                     # Unit integrity.
pnpm test:e2e                 # End-to-end resilience (for mutated flows).
```

## 4. Immutable Project Laws

- **Type Sovereignty:** The `any` keyword is an architectural failure. Use `unknown` and parse via Zod. ESLint `--max-warnings 0` is actively enforcing this.
- **TypeScript Strictness:** `noUncheckedIndexedAccess` is enabled and strictly enforced.
- **Mutation Isolation:** All state mutations MUST occur exclusively through `src/actions/<domain>.ts` (Server Actions). Client-side `dehost.from().insert()` is a critical security violation.
- **Database Sovereignty (RLS):** Every new table MUST be accompanied by RLS policies in the same migration file, appended with a `-- ROLLBACK:` block.
- **PII Guardian Protocol:** User-generated free text MUST be sanitized through `src/lib/pii/guardian.ts` prior to database insertion.
- **Strict i18n:** Hardcoded English strings in the UI are classified as bugs. All user-facing text must be routed through `messages/en.json` & `messages/tr.json`.
- **CSS Architecture:** Tailwind v4 primitives only (`@theme inline` in `globals.css`). No `tailwind.config.ts`.
- **Component Taxonomy:** `src/components/ui/` is strictly for dumb primitives. Domain logic belongs in `incidents/`, `auth/`, `admin/`, etc.

## 5. Security & Isolation Constraints

- **Zero-Knowledge Logging:** Never log raw IPs, emails, or PII. Cryptographic hashing is mandatory.
- **Service Role Secrecy:** `DEHOST_SERVICE_ROLE_KEY` must never leak to the client bundle.
- **Admin Boundary:** Application-layer RLS bypass is forbidden. The `@/lib/dehost/client` admin client is strictly reserved for moderation/audit pathways.

## 6. Agent Boot & Context Management

1. **Bootstrap:** Read `docs/BOOTSTRAP.md` before any systemic change.
2. **Knowledge Graph:** Query the architecture via `graphify query "<question>"`.
3. **Context Economy:** NEVER read files >10KB natively. Use AST views or graphify.
4. **Graph Sync:** If `graphify-out/` is stale, trigger `graphify update .`.

## 7. File Taxonomy

| Target              | Path                                         |
| ------------------- | -------------------------------------------- |
| Pages               | `src/app/[locale]/.../page.tsx`              |
| Server Actions      | `src/actions/<domain>.ts`                    |
| Forms               | `src/components/<domain>/<form>.tsx`         |
| Translations        | `messages/en.json` + `messages/tr.json`      |
| Database Migrations | `dehost/migrations/<timestamp>_<name>.sql` |

## 8. Deployment Governance

- Master branch acts as the sole source of truth. No branching, no PRs (Rule #15).
- Deployments require the `[deploy]` commit marker. Maximum 2 windows per day (Rule #31).
- Auxiliary AI processing must default to free-tier providers first (Rule #32).
- `docs/MASTER_PLAN.md` is strictly Architect-only (enforced by pre-commit hook). Proposals must go to `docs/PROPOSALS/NNN-name.md`.
- External communications (email/social) require an explicitly approved queue item (Rule #6).

## Ajan YÃ¶netim KurallarÄ± (HafÄ±za KaydÄ±)

1. **Alt Ajan TemizliÄŸi:** Alt ajanlar (subagents) gÃ¶revlerini bitirdiklerinde otomatik kapanmaz ve arka planda ciddi RAM tÃ¼ketirler. Ä°ÅŸi biten ajanlar derhal `manage_subagents (action: kill)` ile temizlenmelidir.
2. **Model Belirleme:** OpenCode kullanÄ±larak oluÅŸturulan her ajan iÃ§in mutlaka amaca uygun AI modeli (Pro veya Flash) aÃ§Ä±kÃ§a belirtilmelidir.
3. **Arka Plan GÃ¶revleri (Background Tasks):** CLI Ã¼zerinden baÅŸlatÄ±lan asenkron `opencode run` iÅŸlemleri (tasks) kendi kendine kapanmayabilir veya asÄ±lÄ± kalabilir (hanging state). DÃ¼zenli olarak `manage_task (action: list)` ile kontrol edilmeli ve biten ya da takÄ±lan sÃ¼reÃ§ler `manage_task (action: kill)` ile sonlandÄ±rÄ±lmalÄ±dÄ±r.

## 9. CUMHURİYET MİMARİSİ (10 AGI + SÜPER BLOK)

### Çekirdek (5 — Daimi Komite)
1. **Atatürk** (Strateji+Denetim) - "hedef-madencisi" + "mühür" [gemini-3.1-pro]
2. **Sinan** (Mimari+Altyapı) - "arch-gate" + "linter" [gemini-3.6-flash]
3. **Turing** (Kripto+Algoritma) - "crypto-engine" + "kalkan" [gemini-3.6-flash]
4. **Smith** (Ekonomi+Teşvik) - "hazine" + "finops" [gemini-3.6-flash]
5. **Socrates** (Sorgulama+Etik) - "düello" + "çelişki-tarayıcı" [gemini-3.6-flash]

### Çağrılı (5 — Uzman Kuvvet)
6. **Tesla** (Enerji+Performans) - "perf-tracker" [gemini-3.6-flash]
7. **Einstein** (Optimizasyon) - "maliyet-iyileştirici" [gemini-3.6-flash]
8. **Da Vinci** (Tasarım+UI) - "tasarım-kapıları" [gemini-3.6-flash]
9. **Darwin** (Evrim+Adaptasyon) - "mutasyon" [gemini-3.6-flash]
10. **Newton** (Matematik+Ölçüm) - "ölçüm" [gemini-3.6-flash]

### Yedek Havuzu (Uykuda - 0 Token)
Curie, Hammurabi, Sun Tzu, Biruni, Edison.

### Blok ve Mühürlü Oy Doktrini (Skin in the Game)
- **Süper Blok Kuralı:** Bloksuz (yetki paketi olmayan) AGI çalışamaz. İhlal denemesi alarm basar.
- **Mühürlü Oy (Ağırlık):** Kararlar mühürlenir. 1. tur eşit ağırlıktır. Hakikati ıskalayan AGI ağırlık kaybeder. Sessiz kalan (FAIL) yedeğe düşer, boş koltuk taşınmaz.
## DEPLOY AJANI (DEPLOY KOMUTANI) KAPASÄ°TE VE LÄ°MÄ°T HAFIZASI

**GÃ¶rev:** BÃ¼tÃ¼n 3. parti deploy ortamlarÄ±nÄ±n (DeHost, DeHost, GitHub vs.) limitlerini bilmek, aÅŸÄ±m risklerini Ã¶ngÃ¶rmek ve package.json gibi yapÄ±landÄ±rmalarda bu sÄ±nÄ±rlarÄ± zorunlu tutmak.
**Zorunlu Limitler (Asla AÅŸÄ±lmamalÄ±):**

1. **DeHost Pro Limitleri:**
   - **RAM Limiti:** Maksimum 8192 MB (8GB). ( sc veya uild komutlarÄ±nda --max-old-space-size=8192 zorunludur, aksi takdirde OOM hatasÄ± alÄ±nÄ±r.)
   - **Timeout:** Serverless fonksiyonlar iÃ§in maksimum 300 saniye (5 dakika). Edge iÃ§in 30 saniye.
   - **Payload:** Ä°stek/YanÄ±t gÃ¶vdesi maksimum 4.5 MB.
2. **DeHost Limitleri:**
   - **VeritabanÄ± Boyutu:** Temel/Pro pakete gÃ¶re 8GB aktif sÄ±nÄ±r.
   - **BaÄŸlantÄ± Havuzu:** Connection pooling (PgBouncer/Supavisor) aktif tutulmalÄ±, anlÄ±k yÃ¼ksek hitlerde DB kilitlenmemeli.
3. **GitHub Actions Limitleri:**
   - **Runner RAM:** Standart Linux runner'larda yaklaÅŸÄ±k 7GB kullanÄ±labilir RAM vardÄ±r. Build iÅŸlemleri bu sÄ±nÄ±rÄ± geÃ§memelidir.
   - **SÃ¼re:** Tek bir job maksimum 360 dakika Ã§alÄ±ÅŸabilir.

Deploy ajanÄ± her iÅŸlemde bu sÄ±nÄ±rlarÄ± Admin Paneldeki DeploymentLimitsWidget modÃ¼lÃ¼ne ve kendi hafÄ±zasÄ±na referans alarak kontrol eder.

## 10. GÖMÜLÜ ONAY VE İLETİŞİM ŞEMASI (İki Kritik Ders)

1. **Atlatılamaz Kapı (KES):** Kritik düğümlere (git push, DB migration, üretim deploy, hotfix) gömülü onay kapıları (kes / guardian) eklenmiştir. Hiçbir ajan veya motor bu kapıları (|| true veya --no-verify) kullanarak bypass edemez. Baypas denemesi anında SIGKILL (FAIL) sebebidir.

2. **Ajan Mesaj Şeması (Zorunlu):** Karargah içi (A2A) ve dış iletişimde şemasız düz metin YASAKTIR. Her ajan (ikiz) iletisi, görevini aşağıdaki şema üzerinden raporlamak zorundadır. Şemasız mesaj reddedilir (FAIL).
   - [AGI_KİMLİĞİ] / [MOTOR_SÜRÜMÜ]
   - [DURUM] (Örn: SUCCESS, FAIL, PENDING)
   - [KARAR_VE_GEREKÇE]
   - [MÜHÜR] (Karar Özeti SHA-384 Hash)
