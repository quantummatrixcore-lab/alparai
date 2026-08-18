import { setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/layout";
import { KanbanBoard, type KanbanIncident } from "@/components/b2b/kanban-board";
import { redirect } from "@/i18n/routing";
import { ShieldAlert } from "lucide-react";

export default async function B2BDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect({ href: "/auth/login?returnTo=/b2b/dashboard", locale });
  }

  const supabase = await createServerClient();
  
  // For MVP: Fetching recent incidents to show in Kanban board.
  // In production, this would be scoped to the AI Provider's claimed profile.
  const { data } = await supabase
    .from("incidents")
    .select("id, title_masked, title_tr, severity, status, created_at")
    .in("status", ["published", "investigating", "resolved"] as any[])
    .order("created_at", { ascending: false })
    .limit(50);

  const incidents: KanbanIncident[] = (data || []).map((inc) => ({
    id: inc.id,
    title: (locale === "tr" && inc.title_tr ? inc.title_tr : inc.title_masked) || "Unknown",
    severity: inc.severity,
    status: inc.status as KanbanIncident["status"],
    date: inc.created_at,
  }));

  return (
    <Container className="py-10 min-h-screen flex flex-col">
      <header className="mb-10 rounded-2xl border border-white/5 bg-[#050914] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_30%,transparent_100%)]" />
        <div className="relative z-10 flex flex-col items-start text-left">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-brand-400 uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <ShieldAlert className="w-3 h-3" />
            Defendant Portal - Beta
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-2xl">
            {locale === "tr" ? "Muhatap Yönetim Paneli" : "Defendant Management Hub"}
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium text-gray-400">
            {locale === "tr" ? "Platforma yansıyan ihlalleri yönetin, resmi savunmalarınızı gönderin ve risk metriklerinizi takip edin." : "Manage reported incidents, submit official defenses, and track your risk metrics."}
          </p>
        </div>
      </header>

      <div className="flex-1">
        <KanbanBoard 
          incidents={incidents} 
          onStatusChange={async (id, status) => {
            "use server";
            const sb = await createServerClient();
            await sb.from("incidents").update({ status: status as any }).eq("id", id);
          }} 
        />
      </div>
    </Container>
  );
}
