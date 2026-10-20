import { createServerClient } from "@/lib/dehost/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface VerifyPageProps {
  params: Promise<{ locale: string; hash: string }>;
}

// W3C Incident Passport kamu doğrulayıcısı (FAZ1 iskelet).
// evidence_hash değişirse TAMPERED, eşleşirse VERIFIED basar.
export default async function VerifyHashPage({ params }: VerifyPageProps) {
  const { hash } = await params;
  let state: "VERIFIED" | "NOT_FOUND" | "ERROR" = "ERROR";
  let title: string | null = null;

  try {
    const dehost = await createServerClient();
    const { data, error } = await dehost
      .from("incidents")
      .select("id,title_masked,status,evidence_hash")
      .eq("evidence_hash", hash)
      .limit(1);
    if (!error && data && data.length > 0) {
      state = "VERIFIED";
      title = (data[0] as { title_masked?: string }).title_masked ?? null;
    } else if (!error) {
      state = "NOT_FOUND";
    }
  } catch {
    state = "ERROR";
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold">Delil Doğrulama</h1>
      <p className="mt-2 font-mono text-sm break-all">{hash}</p>
      <div data-testid="verify-state" className="mt-6 rounded border p-4 font-bold">
        {state === "VERIFIED" && "✓ VERIFIED — delil bütünlüğü sağlam"}
        {state === "NOT_FOUND" && "✕ TAMPERED / GEÇERSİZ DELİL — kayıt bulunamadı"}
        {state === "ERROR" && "! DOĞRULANAMADI — daha sonra tekrar deneyin"}
      </div>
      {title ? <p className="mt-4">{title}</p> : null}
    </main>
  );
}
