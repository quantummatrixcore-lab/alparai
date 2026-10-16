# ADR 0014: Context-as-Code ve Kalıcı Kurumsal Hafıza Mimarisi

**Tarih:** 2026-10-07  
**Durum:** Yürürlükte (Kilitlendi)  

## Bağlam (Context)
Yapay zeka araçlarının (Cursor, Copilot, Antigravity) her yeni oturumda (session) veya bağlam penceresi (context window) dolduğunda projenin stratejik vizyonunu (Küresel Hakemlik, Sivil Anayasa) unuttuğu tespit edilmiştir. Projenin vizyonu PDF dosyalarında hapis kaldıkça ajanlar "Agent Drift" yaşamakta ve projeyi basit bir B2B mikro-SaaS olarak ele almaktadır. Kurucunun aynı vizyonu her oturumda tekrar anlatması büyük bir token ve zaman israfı yaratmaktadır.

## Karar (Decision)
Tüm yapay zeka ajanlarının davranışını ve vizyon idrakını sabitlemek için **4 Katmanlı Context-as-Code (Kod Olarak Bağlam)** mimarisine geçilmiştir:
1. **`VIZYON.md`:** Yatırımcı/Jeopolitik tez ve kırmızı çizgilerin tek hakikat kaynağı.
2. **`AGENTS.md`:** Tüm ajanlar için evrensel teknik davranış sınırları.
3. **`MEMORY.md`:** Dinamik bellek dosyası. Ajanların oturum kapatmadan önce (Oturum Kapanış Protokolü) mevcut durumu ve devredilen işi (handoff) buraya yazması **mutlak zorunluluk** haline getirilmiştir.
4. **`.cursor/rules/alparai-core.mdc`:** IDE-spesifik prompt enjeksiyon kuralı (VIZYON.md ve MEMORY.md'yi okumaya zorlar).

## Sonuçlar (Consequences)
- **Pozitif:** Sıfır Hafıza Kaybı (Zero Memory Loss) sağlandı. Kurucu vizyonu tekrarlama yükünden kurtuldu. Gelecek olan tüm ajanlar (veya yeni mühendisler) repoyu açtığı saniye "Kategori Yaratıcısı" zihniyetiyle çalışmaya başlar.
- **Kısıtlar:** Ajanlar kod yazdıktan sonra mutlaka `MEMORY.md` dosyasını güncellemek zorunda oldukları için her oturum sonuna +1 dosya yazma maliyeti/token yükü binmiştir, ancak sağladığı bağlam güvenliği bu maliyeti fazlasıyla amorti etmektedir.
