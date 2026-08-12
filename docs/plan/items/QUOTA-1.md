# QUOTA-1 — hâlâ açık (v13.13),

- **Board id:** 314
- **Status:** ✅ completed closed-by:fa2c48a8@master evidence:"ops/opencode-runs/*.json fake evidence files deleted"
- **Priority:** P0
- **Owner:** Antigravity
- **Closed by:** fa2c48a8@master

## Record

**QUOTA-1 — hâlâ açık (v13.13), sahte kanıt dosyaları duruyor.** ✅ `.opencode/config.json` varsayılanı ücretsiz modelde (`opencode/deepseek-v4-flash-free`) kalmış. ✅ `delegate-opencode-parallel.mjs`'teki gerçek `runGate()` duruyor. ✗ **G-16'nın üç dosyası hâlâ takipte** (`git ls-files` ile doğrulandı): `…task-RES-1.json`, `…task-QUOTA-1.json`, `…task-ROLELESS-TEST.json`; her biri `gates:{lint:0,typecheck:0,test:0,build:0}` + `exit_code:0` iddia ediyor. **Kural 10 öz-düzeltmesi:** v13.11'de alan adını `task.ref` yazmıştım; dosyadaki gerçek alan `task_ref` — G-16'nın gerekçesi değişmiyor (`QUOTA-1`/`RES-1` script'in görev kuyruğunda hâlâ geçerli bir ref değil, `git_sha` eski bir commit'e çözülüyor), yalnızca alan adı düzeltiliyor. **Kabul (değişmedi):** üç dosya silinir veya gerçek koşuyla değiştirilir + yeni kayıtlarda ≥2 model kimliği + rolsüz görev `exit 1`
