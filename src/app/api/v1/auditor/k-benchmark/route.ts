import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedAuditor } from "@/lib/auth/auditor-gate";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAuthorizedAuditor(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("k_model_scores")
      .select("category_id, model_id, score, status, sample_size, created_at");

    if (error) {
      throw error;
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
