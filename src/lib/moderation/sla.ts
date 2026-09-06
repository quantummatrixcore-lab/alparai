/**
 * SLA & Risk Analysis Constants for Content Moderation and Takedown Requests
 *
 * ============================================================================
 * MİMARİ KARAR VE RİSK ANALİZİ (7 Gün -> 24 Saat SLA Düşürülmesi)
 * ============================================================================
 * Prior SLA: 7 gün (168 saat).
 * New SLA: 24 saat (1 gün).
 *
 * RİSK DEĞERLENDİRMESİ:
 * 1. Yanlış Pozitif (False Positive) Riski Yüksek:
 *    Takedown inceleme süresinin 24 saate düşürülmesi, insan moderatörler üzerindeki
 *    zaman baskısını artırır. Bu durum, delil incelemesi tamamlanmadan veya yetersiz
 *    bilgiyle içeriklerin haksız yere kaldırılması (yanlış pozitif) riskini önemli
 *    ölçüde yükseltir.
 *
 * 2. İtiraz (Appeal) Süreci Zorunluluğu:
 *    Haksız kaldırma ve yanlış pozitif kararlarının telafisi için platform bünyesinde
 *    şeffaf, hızlı ve erişilebilir bir itiraz (Appeal) mekanizmasının varlığı şarttır.
 *    İçerik sahipleri/muhataplar `takedown_appeals` kanalı üzerinden karşı delil sunarak
 *    kararın yeniden incelenmesini talep edebilmelidir.
 *
 * 3. Hukuki Uyum & Güven:
 *    AB E-Ticaret Direktifi Madde 14 ve KVKK Madde 11 kapsamında 24 saatlik SLA,
 *    yasadışı içeriklere hızlı müdahale sağlarken appeal mekanizması da ifade özgürlüğü
 *    ve içerik doğruluğu dengesini korur.
 * ============================================================================
 */

export const TAKEDOWN_SLA_HOURS = 24;
export const TAKEDOWN_SLA_DAYS = 1;

/**
 * Calculates the SLA due timestamp for a new takedown request (default: 24 hours from now).
 */
export function calculateSlaDueDate(fromDate: Date = new Date()): Date {
  return new Date(fromDate.getTime() + TAKEDOWN_SLA_HOURS * 60 * 60 * 1000);
}
