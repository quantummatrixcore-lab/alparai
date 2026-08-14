import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Users, ChevronRight } from "lucide-react";

interface Advisor {
  id: string;
  name: string;
  purposeKey: string;
  routePath?: string;
}

const ADVISORS: Advisor[] = [
  {
    id: "gazi_komutan",
    name: "GAZİ KOMUTAN",
    purposeKey: "advisor_gazi_purpose",
    routePath: "/admin/gazi",
  },
  {
    id: "genel_kurmay",
    name: "GENEL KURMAY",
    purposeKey: "advisor_genel_kurmay_purpose",
  },
  {
    id: "yildirim_kitalari",
    name: "YILDIRIM KITALARI",
    purposeKey: "advisor_yildirim_purpose",
  },
  {
    id: "insaat_taburu",
    name: "INSAAT TABURU",
    purposeKey: "advisor_insaat_purpose",
  },
  {
    id: "kesif_kolu",
    name: "KESIF KOLU",
    purposeKey: "advisor_kesif_purpose",
  },
  {
    id: "tasarim_komandolari",
    name: "TASARIM KOMANDOLARI",
    purposeKey: "advisor_tasarim_purpose",
  },
  {
    id: "hariciye_dairesi",
    name: "HARICIYE DAIRESI",
    purposeKey: "advisor_hariciye_purpose",
  },
  {
    id: "istihbarat_emniyeti",
    name: "ISTIHBARAT EMNIYETI",
    purposeKey: "advisor_istihbarat_purpose",
  },
];

export function AdvisorRoster() {
  const t = useTranslations("admin");

  return (
    <div className="border-border-subtle rounded-2xl border bg-zinc-900/40 p-6 ring-1 ring-white/10 backdrop-blur-md backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-2 text-emerald-400">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">
            {t("ai_advisor_roster") || "AI Strategic Advisors"}
          </h3>
          <p className="text-fg-muted text-xs">
            {t("advisor_roster_desc") || "Swarm of autonomous agents"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {ADVISORS.map((advisor) => {
          const purpose = t(advisor.purposeKey);
          const isLive = !!advisor.routePath;

          return (
            <div
              key={advisor.id}
              className="group border-border-subtle flex items-center justify-between rounded-lg border bg-white/5 p-4 transition-all duration-200 hover:bg-white/10"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white">{advisor.name}</span>
                  {isLive ? (
                    <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                      Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300/70 uppercase">
                      Definition
                    </span>
                  )}
                </div>
                <p className="text-fg-muted mt-1 text-sm">{purpose}</p>
              </div>

              {isLive && advisor.routePath && (
                <Link
                  href={advisor.routePath}
                  className="text-brand-400 hover:text-brand-300 ml-4 flex shrink-0 items-center gap-1 text-xs font-bold uppercase transition"
                >
                  {t("access") || "Access"}
                  <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-fg-muted mt-6 border-t border-white/5 pt-4 text-[11px]">
        {t("advisor_roster_note") ||
          "Live advisors route to interactive tools. Definitions describe specialized agent roles for swarm coordination."}
      </div>
    </div>
  );
}
