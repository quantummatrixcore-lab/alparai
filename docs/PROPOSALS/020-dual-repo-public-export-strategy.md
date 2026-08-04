# PROPOSAL: Public Repository Creation and Secret-Filtered Export Strategy

- **status:** pending
- **author:** `[Antigravity]`
- **related-item:** Proposal 008 / MASTER_PLAN v11.05 / Item 95
- **created:** 2026-07-25

---

## 1. Gözlem / Problem

1. **Gizli Git Geçmişi (Commit History Leaks):** `d:\Alparai` (`Alparai.com`) ana veritabanı deposu geçmişinde `.env.local` rotasyonları, iç stratejiler, `MASTER_PLAN.md`, `ANTIGRAVITY_EXECUTION_PLAN.md` ve `docs/PROPOSALS/` gibi hassas kurumsal sırları barındırmaktadır. Bu deponun doğrudan görünürlüğünü "Public" yapmak güvenlik ve rekabet zafiyeti oluşturmaktadır.
2. **Açık Kaynak Şeffaflık İhtiyacı:** EU AI Act, HackerOne Bug Bounty, GitHub ve Reddit outreach stratejileri uyarınca platformun AGPL-3.0 lisanslı bağımsız denetim altyapısının açık kaynak bir depoda görünür olması gerekmektedir.
3. **Yetki ve Repo Engelleri:** Daha önce otomatik sistemlerin karşılaştığı `403 Resource not accessible` engeli aşılmış ve `quantummatrixcore-lab/alparai` isimli yeni halka açık (public) repo `gh CLI` ile başarıyla oluşturulmuştur.

---

## 2. Öneri

İkili Depo (Dual-Repo) modelini işletmek üzere `quantummatrixcore-lab/alparai` reposuna aşağıdaki kısıtlama ve filtreleme kurallarıyla **temiz, geçmişsiz (fresh commit history)** kod transferi yapılması önerilmektedir:

### A. Filtreleme ve Hariç Tutma Matrisi (Secret Boundary)

| Kategori             | Kamusal Depo (`quantummatrixcore-lab/alparai`)                                | Özel Çekirdek Depo (`Alparai.com`)                                                     |
| :------------------- | :---------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| **Uygulama Kodları** | Tüm UI primitives, Next.js 15 bileşenleri, Server Actions, PII Guardian       | Özel admin analitikleri ve dahili gateway yönlendirmeleri                              |
| **Veritabanı**       | `supabase/migrations/` (RLS politikaları ile birlikte)                        | Üretim yedekleme konfigürasyonları ve iç denetim kayıtları                             |
| **Dokümantasyon**    | `README.md`, `LICENSE` (AGPL-3.0), `ARCHITECTURE.md`, `SECURITY.md`, `API.md` | `MASTER_PLAN.md`, `ANTIGRAVITY_EXECUTION_PLAN.md`, `docs/PROPOSALS/`, `docs/outreach/` |
| **Konfigürasyon**    | `.env.example`, `tsconfig.json`, `package.json`, `tailwind.config.ts`         | `.env.local`, Vercel production deployment secret'ları                                 |

### B. Kod Transfer İcra Adımları

1. Projede temiz bir export klasörü oluşturularak sadece halka açık dosyaların kopyalanması.
2. `gitleaks detect` ve regex taraması (`sk-`, `sbp_`, `vcp_`, `postgres://`) ile son güvenlik kontrolünün yapılması.
3. `quantummatrixcore-lab/alparai` reposuna `Initial open-source release (AGPL-3.0)` mesajıyla sıfır geçmişli push yapılması.

---

## 3. Acceptance Criterion

1. `https://github.com/quantummatrixcore-lab/alparai` adresine halka açık kodların başarıyla pushlanması ve sayfanın yeşil AGPL-3.0 lisansı ile yayına girmesi.
2. Public repoda hiçbir `MASTER_PLAN`, `.env` veya özel API key tarama uyarısının bulunmaması (`gitleaks` clean).
3. Özel ana reponun (`Alparai.com`) gizli (private) kalarak tüm stratejik verileri koruması.

---

## 4. Risk / Maliyet

- **Risk:** Yanlışlıkla private bir dosyanın public repoya kopyalanması. _(Önlendi: Gitleaks ve katı regex filtresi çalıştırılacak)._
- **Maliyet:** $0 (GitHub Public repo ücretsizdir).
