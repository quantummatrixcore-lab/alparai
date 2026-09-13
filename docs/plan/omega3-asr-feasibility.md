# [OMEGA-3] Qwen Omni ASR Entegrasyon Fizibilite Raporu

**Tarih:** 2026-08-06  
**Sürüm:** v1.0.0  
**Hedef:** ALPAR AI platformuna 113 dil destekli sesli ihbar / incident bildirimi entegrasyonu.  
**Karar / Verdict:** **Evet, entegrasyon teknik ve ekonomik olarak son derece uygundur.** Alibaba Cloud DashScope ASR API veya self-hosted Qwen2.5-Omni modeli kullanılarak 1000 dk/ay ölçeğinde aylık ~$0.60 - $8.70 bütçeyle uçtan uca güvenli, PII korumalı sesli incident toplama mimarisi kurulabilir.

---

## 1. Qwen API Erişim Yolları ve Model Seçenekleri

| Erişim Yolu                            | Model Seçeneği                        | Protokol / API                              | Gecikme (Latency)           | Avantajlar                                                                       | Dezavantajlar                                            |
| :------------------------------------- | :------------------------------------ | :------------------------------------------ | :-------------------------- | :------------------------------------------------------------------------------- | :------------------------------------------------------- |
| **Alibaba Cloud DashScope (Önerilen)** | `qwen3-asr-flash` / `qwen-omni-turbo` | REST API (POST) & WebSocket (`wss://`)      | ~200ms - 500ms              | 113+ dil desteği, resmi SLA, sunucusuz (serverless) ölçeklenme, en düşük maliyet | Çin/Singapur/US bölge seçimi, API Key bağımlılığı        |
| **Hugging Face Dedicated Endpoints**   | `Qwen/Qwen2.5-Omni-7B`                | OpenAI Uyumlu REST (`/v1/chat/completions`) | ~400ms - 800ms              | Tam veri gizliliği, özel model konfigürasyonu                                    | Sabit GPU kiralama maliyeti (NVIDIA L4/A10G $0.60+/saat) |
| **Replicate API**                      | `qwen-omni-7b` / custom cog           | REST API (Prediction)                       | ~1s - 3s (Cold start dahil) | Kullandıkça öde (Pay-per-second), sıfır altyapı bakımı                           | Yüksek istek başı maliyet, cold-start gecikmesi          |
| **Self-Hosted (RunPod / EC2)**         | `vLLM` veya `SGLang` + `Qwen2.5-Omni` | Internal gRPC / REST                        | <150ms                      | Sıfır dış veri sızıntısı, maksimum performans                                    | GPU yönetimi ve aylık sabit $250+ sunucu gideri          |

### Model Tercih Analizi

- **Qwen3-ASR-Flash / Qwen-Audio-Turbo:** Yalnızca Ses → Metin (ASR) dönüşümü için optimize edilmiştir. Düşük gecikme süresi ve yüksek doğruluk sunar. Pure ASR ihbar akışı için en doğru ve ekonomik tercihtir.
- **Qwen2.5-Omni-7B:** Uçtan uca multimodal (Ses+Görüntü+Metin → Metin+Ses) modeldir. İleride interaktif sesli asistan eklendiğinde `qwen-omni-turbo-realtime` WebSocket API'sine geçiş yapılabilir.

---

## 2. Next.js 15 App Router Audio Streaming & Server Action Mimarisi

### Gerekli Web API'leri (Client-Side)

1. **`navigator.mediaDevices.getUserMedia({ audio: true })`**: Kullanıcı mikrofon erişim izni ve ses akışının alınması.
2. **`MediaRecorder API`**: Ses verisinin tarayıcıda canlı parçalar (chunks) halinde WebM/Opus formatında kaydedilmesi (250ms timeslice).
3. **`Blob` & `FormData`**: Kaydedilen ses parçalarının birleştirilip Server Action'a aktarılması için binary taşıyıcı.
4. **`Web Audio API` (AudioContext / AnalyserNode)**: İsteğe bağlı canlı ses dalga formu ve VAD (Voice Activity Detection) kontrolü.

### Akış Mimarisi

```
Kullanıcı (Browser MediaRecorder)
  → FormData (audio Blob)
    → Server Action submitAudioIncident()
      → Qwen DashScope ASR API (transcript)
        → PII Guardian maskPII()
          → DeHost Storage (incident-audios bucket)
          → DeHost DB (incidents table)
            → revalidatePath("/incidents")
              → { ok: true, incidentId }
```

---

## 3. `src/actions/incident-audio.ts` Mimari Kod Tasarımı

```typescript
"use server";

import { createAdminClient } from "@/lib/dehost/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { maskPII } from "@/lib/pii/guardian";
import { incidentSubmissionSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export async function submitAudioIncident(_prevState: unknown, formData: FormData) {
  try {
    const user = await getCurrentUser();
    const audioFile = formData.get("audio") as File | null;
    const title = (formData.get("title") as string) || "Sesli İhbar";
    if (!audioFile || audioFile.size === 0) return { ok: false, error: "Ses dosyası bulunamadı." };

    // 1. Qwen DashScope ASR API Çağrısı
    const dashscopeBody = new FormData();
    dashscopeBody.append("file", audioFile);
    dashscopeBody.append("model", "qwen3-asr-flash");

    const asrRes = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/audio/asr/transcription",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}` },
        body: dashscopeBody,
      },
    );
    if (!asrRes.ok) throw new Error(`ASR API hatası: ${asrRes.statusText}`);
    const asrData = await asrRes.json();
    const rawTranscript = asrData.output?.text || "";

    // 2. PII Maskeleme & Validasyon
    const cleanTranscript = maskPII(rawTranscript);
    const validated = incidentSubmissionSchema.parse({ title, description: cleanTranscript });

    // 3. DeHost Private Storage Kaydı
    const admin = createAdminClient();
    const filePath = `audios/${user?.id || "anon"}/${Date.now()}_${crypto.randomUUID()}.webm`;
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    const { error: storageError } = await admin.storage
      .from("incident-audios")
      .upload(filePath, buffer, {
        contentType: audioFile.type || "audio/webm",
      });
    if (storageError) throw storageError;

    // 4. DB Insert
    const { data: incident, error: dbError } = await admin
      .from("incidents")
      .insert({
        title: validated.title,
        description: validated.description,
        user_id: user?.id || null,
        audio_path: filePath,
        status: "pending",
      })
      .select("id")
      .single();
    if (dbError) throw dbError;

    revalidatePath("/incidents");
    return { ok: true, incidentId: incident.id, transcript: cleanTranscript };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "İşlem başarısız.";
    logger.error("submitAudioIncident hatası", { error: err });
    return { ok: false, error: message };
  }
}
```

---

## 4. DeHost Storage & RLS Politikası Tasarımı

Migration dosyası: `dehost/migrations/20260806120000_create_incident_audios_bucket.sql`

```sql
-- 1. Private Bucket Oluşturma
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'incident-audios',
  'incident-audios',
  false,
  10485760,
  ARRAY['audio/webm', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/mpeg']
) ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Politikaları
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Incident audios select policy"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'incident-audios' AND (
    (auth.uid() IS NOT NULL AND (storage.foldername(name))[2] = auth.uid()::text)
    OR is_moderator()
  )
);

CREATE POLICY "Incident audios insert policy"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'incident-audios' AND (
    auth.role() = 'service_role' OR
    (auth.uid() IS NOT NULL AND (storage.foldername(name))[2] = auth.uid()::text)
  )
);

CREATE POLICY "Incident audios delete policy"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'incident-audios' AND (
    auth.role() = 'service_role' OR is_moderator()
  )
);

-- ROLLBACK:
-- DROP POLICY IF EXISTS "Incident audios delete policy" ON storage.objects;
-- DROP POLICY IF EXISTS "Incident audios insert policy" ON storage.objects;
-- DROP POLICY IF EXISTS "Incident audios select policy" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'incident-audios';
```

---

## 5. Maliyet Tahmini

| Sağlayıcı                               | Fiyatlandırma    | 1.000 Dk/Ay Maliyeti | Tavsiye        |
| :-------------------------------------- | :--------------- | :------------------- | :------------- |
| **Alibaba Cloud DashScope (Qwen3-ASR)** | ~$0.0006/dk      | **~$0.60/ay**        | ✅ Önerilen    |
| **Replicate API**                       | $0.000725/GPU-sn | **~$8.70/ay**        | Yedek seçenek  |
| **Self-Hosted RunPod**                  | $0.35/saat sabit | **~$252/ay**         | Kurumsal ölçek |

**Sonuç:** DashScope Qwen ASR entegrasyonu, OpenAI Whisper ($6.00/ay) ile kıyaslandığında %90 daha düşük maliyetli ve 113 dil desteğiyle ALPAR AI için optimal çözümdür.
