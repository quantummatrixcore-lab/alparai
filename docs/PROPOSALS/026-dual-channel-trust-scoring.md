# PROPOSAL 026: Dual-Channel Model Trust Scoring Architecture

## 1. Concept

ALPAR AI's model trust score is derived from two completely independent, isolated pipelines. These pipelines never share inputs — only their final outputs are combined via weighted percentage to produce the canonical **Model Trust Score (K-Benchmark)**.

## 2. Architecture

```
┌─────────────────────────┐    ┌──────────────────────────┐
│   ÇAPRAZ SORGU ARENASI  │    │   KULLANICI ŞİKAYETLERİ  │
│   (Admin-Only, Gizli)   │    │   (Public Platform)      │
│                         │    │                          │
│  Model A → Model B → C  │    │  Halüsinasyon raporları  │
│  Hakem modeli sentezler │    │  Etik ihlal bildirimleri │
│  Sonuç: Internal Score  │    │  Önyargı vakaları        │
│                         │    │  Sonuç: Incident Score   │
└──────────┬──────────────┘    └────────────┬─────────────┘
           │  %X ağırlık                    │  %Y ağırlık
           └──────────────┬─────────────────┘
                          ▼
               ┌─────────────────┐
               │  MODEL GÜVEN    │
               │  SKORU (K-BM)   │
               │  0 — 100        │
               └─────────────────┘
```

**Kritik kural:** İki kanal birbirinin **girdisine** hiçbir zaman dokunmaz. Sadece nihai **çıktıları** ağırlıklı olarak birleşir. Bu, prompt injection ve çapraz kontaminasyon riskini sıfırlar.

## 3. Kanal Detayları

### Kanal A: Çapraz Sorgu Arenası (Internal Cross-Audit Score)

- **Erişim:** Yalnızca Admin Panel (`/admin/cross-audit`).
- **Girdi:** Admin tarafından belirlenen analiz görevleri, benchmark soruları.
- **Mekanizma:** 3 farklı free-tier model aynı soruyu bağımsız yanıtlar. Hakem model sentezi değerlendirir.
- **Çıktı:** Her model için `internal_audit_score` (0–100).
- **Güvenlik:** Her karar SHA-256 hash ile `ai_trust_ledger` tablosuna yazılır (Proposal 024 §5).

### Kanal B: Kullanıcı Şikayetleri (Incident Score)

- **Erişim:** Herkese açık platform (`/report`, `/incidents`).
- **Girdi:** Kullanıcıların raporladığı halüsinasyon, etik ihlal, önyargı vakaları.
- **Mekanizma:** PII Guardian filtresi → RLS korumalı `incidents` tablosu → moderasyon.
- **Çıktı:** Her model için `incident_score` (0–100, ters skala: şikayet arttıkça düşer).

## 4. Ağırlık Formülü

```
model_trust_score = (internal_audit_score × W_audit) + (incident_score × W_incident)
```

### Karar Protokolü: Veri Önce, Ağırlık Sonra

Ağırlıklar (`W_audit`, `W_incident`) **başlangıçta belirlenmez.**

Süreç şu şekilde işleyecek:

1. **Veri Toplama Aşaması:** İki kanal da bağımsız olarak çalışmaya başlar ve `ai_trust_scores` tablosunda ham skorları biriktirir.
2. **Analiz Eşiği:** Yeterli veri birikmesi (örn. en az 30 Cross-Audit oturumu + 100 kullanıcı vakası) sonrasında iki kanalın korelasyonu ve tutarlılığı ölçülür.
3. **Founder Kararı:** Gerçek veriye dayalı olarak Founder, Admin Panel'deki `ai_scoring_config` tablosundan ağırlıkları belirler.

> [!IMPORTANT]
> **Veri olmadan ağırlık vermek tahmindir, bilim değildir.** Ağırlık kararı ölçüme dayalı olarak verilecektir. Başlangıçta her iki kanalın çıktısı ayrı ayrı izlenir; birleştirilmez.

## 5. Güvenlik & Bütünlük

- **Prompt Injection:** Kanal A ve B birbirinin girdisine asla dokunmaz → risk sıfır.
- **Kriptografik Kanıt:** Her iki kanalın birleşme anındaki ham değerleri ve formül parametreleri `ai_trust_ledger`'a SHA-256 hash ile yazılır.
- **Manipülasyon Koruması:** Kullanıcılar aynı modeli tekrar tekrar şikayet ederek skoru yapay düşüremez — IP/user bazlı rate limit + moderasyon katmanı zorunlu.

## 6. Veritabanı Gereksinimleri

| Tablo               | Amaç                                                                       |
| ------------------- | -------------------------------------------------------------------------- |
| `ai_trust_scores`   | Her model için her kanaldan gelen ham skorlar                              |
| `ai_scoring_config` | Ağırlık parametreleri (W_audit, W_incident) — Founder tarafından yönetilir |
| `ai_trust_ledger`   | SHA-256 hash'li değiştirilemez karar logu                                  |

## 7. İlgili Proposal'lar

- Bkz. `PROPOSALS/024` — Cross-Audit Arena mimarisi
- Bkz. `PROPOSALS/025` — Expert Board Simulation (bu sistemi besleyen analiz modülü)
