import { NextResponse } from "next/server";
import { getAdminAutopilotSnapshot, triggerAutopilotWorkerTick } from "@/actions/admin-autopilot";

const isAdmin = async (): Promise<boolean> => {
  const { getCurrentUser } = await import("@/lib/auth/session");
  const u = await getCurrentUser();
  return Boolean(u && (u.role === "admin" || u.role === "moderator" || u.role === "ceo"));
};

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(request.url);
  const limitRaw = url.searchParams.get("limit");
  const limit = limitRaw ? Math.max(1, Math.min(500, Number(limitRaw) || 100)) : 100;
  const result = await getAdminAutopilotSnapshot(limit);
  if (!result.ok || !result.snapshot) {
    return NextResponse.json({ ok: false, error: result.error ?? "unknown" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, snapshot: result.snapshot });
}

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const stats = await triggerAutopilotWorkerTick();
  return NextResponse.json(stats);
}
