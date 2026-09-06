# ALPAR AI - Module Surface & Dormancy Inventory

## 1. Aktif Ürün Modülleri (Core Surface)
| Modül | Dizin | Durum | Bakım Seviyesi |
|---|---|---|---|
| Incidents & Reporting | `src/components/incidents/` | Aktif | Yüksek |
| Auth & Security | `src/components/auth/` | Aktif | Yüksek |
| Admin Command Center | `src/components/admin/` | Aktif | Orta |
| Digital Twins & Leaderboard | `src/app/[locale]/twins-leaderboard/` | Aktif | Yüksek |
| Legal & Transparency | `src/app/[locale]/legal/` | Aktif | Orta |

## 2. İkincil / Bakım Modundaki Modüller (Dormant / Maintenance)
| Modül | Dizin | Durum | Açıklama |
|---|---|---|---|
| Academy Program | `src/lib/academy/` | Bakım | 90 günlük trafiksiz gözlem altında |
| Bounties & Challenges | `src/lib/bounties/` | Bakım | Düşük trafik, stabil API |
| Agora-T Jury System | `src/app/api/v1/agora-t/` | Bakım | Tamamlanmış altyapı, seyrek kullanım |

## 3. Bakım Yükü Azaltma Stratejisi
Yüzey alanını ve bakım maliyetini düşürmek amacıyla ikincil modüller üzerindeki mimari değişiklikler dondurulmuş, tüm kaynaklar Core Incident Trust altyapısına aktarılmıştır.
