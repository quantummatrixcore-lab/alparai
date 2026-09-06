# P0 - Supabase Migration Squash Plan

## 1. Mevcut Durum Analizi
- **Toplam Migration Sayısı:** 253
- **Sorun:** `pnpm db:reset` ve `supabase db start` komutları yerel ortamda (AMD Ryzen 7GB RAM limitli) devasa I/O ve RAM tüketimine sebep oluyor. 253 adet dosyanın sırayla execute edilmesi hem zaman kaybı (2+ dakika) hem de veritabanı durumunu karmaşıklaştırıyor.
- **Hedef:** 253 migration dosyasını tek bir init şeması veya mantıksal modüller (auth, incidents, personas) etrafında küçültmek (squash).

## 2. Squash Stratejisi
Supabase platformu, doğrudan git-benzeri otomatik bir "squash" komutuna sahip değildir. Bu işlem cerrahi olarak 3 aşamada yapılmalıdır:

### Aşama 1: Schema Export (Baseline Oluşturma)
Mevcut production veritabanından veya temiz bir local reset sonrası çalışan durumdan tam şema çıktısı alınır:
\`\`\`bash
supabase db dump --local -f supabase/migrations/20260906000000_init_squashed.sql
\`\`\`
Bu çıktı, tüm tabloları, RLS politikalarını ve trigger'ları tek bir dosyada toplayacaktır.

### Aşama 2: Klasör Temizliği ve Arşivleme
Mevcut 253 dosya silinmez, yasal denetimler ve history için `supabase/migrations_archive/` klasörüne taşınır.
\`\`\`bash
mkdir supabase/migrations_archive
mv supabase/migrations/* supabase/migrations_archive/
mv supabase/migrations_archive/20260906000000_init_squashed.sql supabase/migrations/
\`\`\`

### Aşama 3: Diff ve Remote Eşitleme
Yeni squashed migration lokalde test edildikten sonra (yine `supabase db reset` ile) production sunucusuna (DeHost) migration geçmişi olarak yansıtılmalıdır. Production'da zaten bu tablolar var olduğu için `schema_migrations` tablosuna manuel müdahale gerekebilir veya Vercel/Coolify deployunda bu migration es geçilerek "zaten uygulandı" olarak işaretlenebilir:
\`\`\`sql
-- Production DB'ye manuel eklenecek kayıt (örnek)
INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260906000000');
\`\`\`

## 3. Kabul Kriterleri (DoD)
- [ ] `supabase/migrations/` klasöründe sadece `20260906000000_init_squashed.sql` (veya modüler parçaları) bulunacak.
- [ ] `pnpm db:reset` komutu 15 saniyenin altına inecek.
- [ ] RLS kurallarının veya PII maskeleme fonksiyonlarının kaybolmadığı `%100` doğrulanacak.
- [ ] Yeni migration üzerine `-- ROLLBACK:` bloğu zorunluluğu aynen devam edecek.

## 4. Aksiyon (Sıradaki Adım)
Kullanıcı onay verdiğinde, bu plan lokal `supabase db dump` komutu ile icra edilecektir.
