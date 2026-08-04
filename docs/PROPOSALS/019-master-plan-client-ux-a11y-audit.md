# PROPOSAL 019: Master Plan Client UX, A11y & Performance Refactor (Qwen Audit Triage)

- **status:** pending
- **author:** `[Antigravity / Qwen Triage]`
- **related-item:** `src/components/admin/master-plan-client.tsx`
- **created:** 2026-07-23

---

## 1. Gözlem / Problem

Qwen3.7 tarafından `src/components/admin/master-plan-client.tsx` bileşeni üzerinde gerçekleştirilen kod analizinde (Skor: 87/100) bazı UX, erişilebilirlik (A11y) ve performans eksiklikleri tespit edilmiştir.

Özellikle kartlarda `cursor-grab` bulunmasına rağmen herhangi bir sürükle-bırak (drag-and-drop) eyleminin çalışmaması kullanıcıda yanılsama yaratmaktadır. Ayrıca görünüm değiştirici butonlarda `aria-pressed` / `aria-label` eksikliği ve boş sütunlarda Empty State uyarısı olmaması UX zafiyeti oluşturmaktadır.

## 2. Öneri

Aşağıdaki 4 maddelik düşük maliyetli, yüksek değerli iyileştirme paketinin uygulanması önerilmektedir:

1. **`cursor-grab` Temizliği (UX Fix):** Read-Only çalışan Master Plan kurulunda kullanıcıyı yanıltmamak için `cursor-grab` CSS sınıflarının silinmesi.
2. **Accessibility & WCAG 2.1 AA Uyum (A11y):** `List` ve `Kanban` view toggle butonlarına `aria-pressed={viewMode === "list"}` ve `aria-label` attribute'larının eklenmesi.
3. **Empty State Görselleştirmesi (UX):** Sütunda hiç görev bulunmadığında (0 items) duyarlı ve esnek bir boş durum mesajının (`No items in this column`) gösterilmesi.
4. **Derived State Memoization (Perf):** `pendingItems`, `completedItems` ve `progress` türetilmiş durumlarının `useMemo` ile sarmalanarak re-render maliyetinin düşürülmesi.

_Not:_ Qwen3.7 tarafından önerilen full `@dnd-kit` drag-and-drop entegrasyonu ve client-side fetch hook'ları, `MASTER_PLAN.md` dosyasının **Architect-Only** (Kural #36) read-only yapısı ve Next.js 15 Server Component mimarisi gereği **aşırı mühendislik (over-engineering)** olarak değerlendirilip reddedilmiştir.

## 3. Acceptance Criterion

- `pnpm typecheck` ve `pnpm lint` sorunsuz geçer.
- `master-plan-client.tsx` kartlarında yanıltıcı `cursor-grab` imleci görünmez.
- Ekran okuyucular (Screen Readers) view toggle butonlarının aktif durumunu doğru algılar.
- Görev olmayan sütunlarda temiz Empty State uyarısı render edilir.

## 4. Risk / Maliyet

- **Süre / Maliyet:** Maksimum 15 dakika (çok düşük maliyet).
- **Risk:** Sıfır breaking change; tamamen UI/A11y cila paketidir.
