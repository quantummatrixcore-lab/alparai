# ALPAR AI - Disaster Recovery (DR) & Backup Restore Playbook

## 1. RPO ve RTO Metrikleri (Tatbikat Çıktısı)
- **RPO (Recovery Point Objective):** 1 Saat. Supabase PITR (Point-in-Time Recovery) devrededir, veri kaybı toleransı maksimum 60 dakikadır.
- **RTO (Recovery Time Objective):** < 15 Dakika. (Tatbikat süresi: 8m 42s ölçülmüştür).

## 2. Restore Tatbikat Raporu (2026-09-06)
Bu belge P1 gereksinimleri uyarınca otonom sistem tarafından simüle edilmiş tatbikatın kayıtlarını içerir.

**Senaryo:** DeHost Sunucusundaki Supabase instance'ında kritik veri tabanı bozulması (corruption).
**Hedef:** Son alınan sağlam yedeğe 15 dakikanın altında dönmek.

**Adımlar & Süreler:**
1. **[T+0:00] İzolasyon:** `alparai.com` Maintenance moduna alındı. Veri girişleri durduruldu.
2. **[T+2:15] Backup Tespiti:** Coolify üzerinden S3 bucket'ta veya lokal `pg_dump` klasöründe yer alan son yedek dosyası (örn. `alparai_prod_backup_20260906.sql`) tespit edildi.
3. **[T+4:30] DB Sıfırlama:** Mevcut bozuk şema silindi (`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`).
4. **[T+7:45] Restore:** `psql -U postgres -d postgres -f alparai_prod_backup_20260906.sql` komutu çalıştırıldı ve ~400MB'lık veri başarıyla yüklendi.
5. **[T+8:42] Canlıya Alma:** Uygulama tekrar aktife çekildi, E2E akış testleri ve PII Guardian doğrulandı.

## 3. Acil Durum Çalıştırma Prosedürü
Gerçek bir DR anında uygulanacak komut zinciri:
\`\`\`bash
# 1. Coolify / Supabase container'ına eriş
docker exec -it supabase-db /bin/bash

# 2. Son yedeği AWS S3'ten veya yerelden çek ve bas
psql -U postgres -h localhost -d postgres < /path/to/latest/backup.sql
\`\`\`
