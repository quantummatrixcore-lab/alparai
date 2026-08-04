# Form Validation & Performans Analizi Raporu

## 1. Mevcut Durum (Performans Analizi)

Şu anki `incident-form.tsx` bileşeni, React'ın `useState` kancasını kullanarak tüm form alanlarını (title, description, selectedProvider vb.) kontrollü bileşen (controlled component) olarak yönetmektedir. Bu yaklaşımın temel sorunları şunlardır:

- **Her Tuş Vuruşunda Dev Re-render:** Kullanıcı `title` veya `description` alanına her harf girdiğinde, 900 satırlık devasa `IncidentForm` bileşeni (ve içindeki `<ProviderCombobox>`, `<ModelAutocomplete>` gibi ağır bileşenler) baştan aşağı yeniden render (re-render) edilmektedir.
- **Asenkron PII Taraması Yükü:** `title` ve `description` değiştikçe `useEffect` tetiklenmekte ve her harf vuruşunda `import("@/lib/pii/guardian")` çalışarak `hasPII` kontrolü yapılmaktadır. Bu, tarayıcıda takılmalara (lag) neden olan önemli bir performans dar boğazıdır.
- **Client-Side Zod Eksikliği:** Backend tarafında `incidentSubmissionSchema` Zod şeması bulunmasına rağmen, istemci tarafında bu şema kullanılmamaktadır. Bu nedenle eksik alanlar veya hatalı formlar sunucuya gönderilmekte, gereksiz ağ istekleri (network roundtrip) oluşturmaktadır.

## 2. Çözüm Mimarisi (Zod Şemalarının Paylaşımı & Optimizasyon)

Form doğrulama süreçlerini optimize etmek için aşağıdaki strateji izlenecektir:

### A. İstemci-Sunucu Zod Şeması Paylaşımı

- Zaten var olan `src/lib/validation/schemas.ts` içindeki `incidentSubmissionSchema`, `incident-form.tsx` içine import edilecektir.
- Formun native `<form action={...}>` (Server Action) mekanizması korunurken, `formAction` çağrılmadan önce bir istemci-tarafı interceptor yazılacaktır:
  - Form verileri (`FormData`) nesneye çevrilecek.
  - `incidentSubmissionSchema.safeParse()` çalıştırılacak.
  - Eğer hata varsa, sunucuya istek atılmadan yerel (client) hatalar gösterilecek.
  - Bu sayede sunucu yükü azalacak ve kullanıcı anında geri bildirim alacaktır.

### B. Re-render Optimizasyonu (Performans İyileştirmesi)

- **`useDeferredValue` veya Debounce Kullanımı:** PII kontrolünün her harf vuruşunda çalışmasını engellemek için, `title` ve `description` değerleri debounce edilmeli veya `useDeferredValue` ile arka plana alınmalıdır.
- **Zod Error State:** Sunucudan dönen `state.fieldErrors` ile istemcide oluşan `clientErrors` birleştirilerek, kullanıcıya anında (gerçek zamanlı veya submit anında) hızlı doğrulama sonuçları gösterilecektir.

Bu mimariyle #P4 numaralı form validation optimizasyonu görevi başarıyla tamamlanmış olacaktır.
