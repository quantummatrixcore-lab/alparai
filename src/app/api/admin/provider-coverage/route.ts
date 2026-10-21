import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/dehost/admin";

export const dynamic = "force-dynamic";

// Admin ölçümü: sağlayıcı bildirim kapsama raporu.
// "Kaç şirkete mail gidebilir?" sorusunun cevabı — e-posta yoksa bildirim sessizce atlanır.
export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const admin = createAdminClient();

    const { count: total } = await admin
      .from("ai_providers")
      .select("id", { count: "exact", head: true });
    const { count: withEmail } = await admin
      .from("ai_providers")
      .select("id", { count: "exact", head: true })
      .not("contact_email", "is", null);
    const { count: verified } = await admin
      .from("ai_providers")
      .select("id", { count: "exact", head: true })
      .eq("is_verified", true);
    const { count: emailVerified } = await admin
      .from("ai_providers")
      .select("id", { count: "exact", head: true })
      .not("contact_email", "is", null)
      .eq("is_verified", true);

    const t = total ?? 0;
    const e = withEmail ?? 0;
    return NextResponse.json(
      {
        data: {
          total_providers: t,
          with_contact_email: e,
          verified: verified ?? 0,
          email_and_verified: emailVerified ?? 0,
          coverage_pct: t > 0 ? Math.round((e / t) * 100) : 0,
          notifiable_pct: t > 0 ? Math.round(((emailVerified ?? 0) / t) * 100) : 0,
        },
        meta: {
          generated_at: new Date().toISOString(),
          note: "Bildirim yalnızca e-postası olan DOĞRULANMIŞ sağlayıcıya gider; gerisi sessizce atlanır.",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "coverage_failed" },
      { status: 500 },
    );
  }
}
export const runtime = "nodejs";
