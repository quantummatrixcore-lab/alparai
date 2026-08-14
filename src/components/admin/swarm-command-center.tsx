import { Shield } from "lucide-react";

export const swarmUnits = [
  {
    name: "GAZİ KOMUTAN",
    model: "Gemini Pro 2M",
    status: "online",
    role: "Supreme Orchestrator",
    color: "#dc2626",
  },
  {
    name: "GENEL KURMAY",
    model: "GPT-OSS-120B",
    status: "standby",
    role: "Stratejik Analiz",
    color: "#7c3aed",
  },
  {
    name: "YILDIRIM KITALARI",
    model: "DeepSeek Flash",
    status: "standby",
    role: "Hızlı Müdahale",
    color: "#2563eb",
  },
  {
    name: "İNŞAAT TABURU",
    model: "Nemotron Ultra",
    status: "standby",
    role: "Backend Mühendislik",
    color: "#059669",
  },
  {
    name: "KEŞİF KOLU",
    model: "GLM-5.2",
    status: "standby",
    role: "İstihbarat & Graphify",
    color: "#d97706",
  },
  {
    name: "TASARIM KOMANDOLARI",
    model: "Gemma-4-31B",
    status: "standby",
    role: "UI/UX Elite",
    color: "#ec4899",
  },
  {
    name: "HARİCİYE DAİRESİ",
    model: "MiMo V2.5",
    status: "standby",
    role: "i18n & Diplomasi",
    color: "#0891b2",
  },
];

export function SwarmCommandCenter() {
  const onlineCount = swarmUnits.filter((u) => u.status === "online").length;
  const standbyCount = swarmUnits.filter((u) => u.status === "standby").length;

  return (
    <section className="group bg-bg-elevated/40 relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-white/20 sm:rounded-3xl sm:p-6 md:p-8">
      {/* Background Ambient Glow */}
      <div className="bg-danger-600/10 group-hover:bg-danger-600/15 pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full blur-3xl transition-all duration-500" />
      <div className="bg-brand-600/10 group-hover:bg-brand-600/15 pointer-events-none absolute -right-32 -bottom-32 h-64 w-64 rounded-full blur-3xl transition-all duration-500" />

      <div className="relative z-10 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="border-danger-500/30 bg-danger-500/10 text-danger-500 flex h-11 w-11 items-center justify-center rounded-2xl border shadow-inner">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  SWARM KOMUTA MERKEZİ
                </h2>
                <span className="border-danger-500/30 bg-danger-500/10 text-danger-400 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold">
                  <span className="bg-danger-500 h-1.5 w-1.5 animate-pulse rounded-full" />
                  GAZİ KOMUTAN
                </span>
              </div>
              <p className="text-fg-muted text-xs sm:text-sm">
                Otonom Çoklu Ajan Swarm & Model Yönlendirme Protokolü
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="border-success-500/30 bg-success-500/10 text-success-400 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold">
              <span className="bg-success-400 h-2 w-2 animate-pulse rounded-full" />
              {onlineCount} Aktif
            </span>
            <span className="border-warning-500/30 bg-warning-500/10 text-warning-400 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold">
              <span className="bg-warning-400 h-2 w-2 rounded-full" />
              {standbyCount} Beklemede
            </span>
          </div>
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {swarmUnits.map((unit) => {
            const isOnline = unit.status === "online";
            return (
              <div
                key={unit.name}
                className="group/card bg-bg-tertiary/60 relative flex flex-col justify-between rounded-xl border border-white/10 p-3.5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-lg"
                style={{
                  borderTopColor: `${unit.color}80`,
                  borderTopWidth: "2px",
                }}
              >
                <div className="space-y-2">
                  {/* Status & Badge */}
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
                      style={{
                        backgroundColor: `${unit.color}20`,
                        color: unit.color,
                        border: `1px solid ${unit.color}40`,
                      }}
                    >
                      {unit.model}
                    </span>
                    <span className="text-fg-muted flex items-center gap-1 text-[10px] font-semibold">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isOnline
                            ? "bg-success-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                            : "bg-warning-400/80"
                        }`}
                      />
                      <span
                        className={isOnline ? "text-success-400 font-bold" : "text-warning-400/90"}
                      >
                        {isOnline ? "ONLINE" : "STANDBY"}
                      </span>
                    </span>
                  </div>

                  {/* Unit Name */}
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-100 group-hover/card:text-white">
                      {unit.name}
                    </h3>
                    <p className="text-fg-muted mt-0.5 text-[11px] font-medium">{unit.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
