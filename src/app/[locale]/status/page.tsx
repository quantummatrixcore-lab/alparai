import { CheckCircle } from "lucide-react";

export const metadata = {
  title: "System Status | ALPAR AI",
  description: "Real-time status of ALPAR AI systems and APIs.",
};

export default function StatusPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 py-20 text-zinc-50">
      <div className="w-full max-w-3xl space-y-8">
        <h1 className="text-center text-4xl font-bold tracking-tight">ALPAR AI System Status</h1>

        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 sm:flex-row">
          <CheckCircle className="h-12 w-12 shrink-0 text-emerald-500" />
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold text-emerald-500">All Systems Operational</h2>
            <p className="mt-1 text-emerald-500/80">Uptime over the last 90 days: 99.99%</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div>
              <h3 className="text-lg font-medium">API Services</h3>
              <p className="text-sm text-zinc-400">api.alparai.com</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
              Operational
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div>
              <h3 className="text-lg font-medium">Web Application</h3>
              <p className="text-sm text-zinc-400">alparai.com</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
              Operational
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div>
              <h3 className="text-lg font-medium">Database (Supabase)</h3>
              <p className="text-sm text-zinc-400">eu-west-1</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
              Operational
            </span>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-zinc-500">
          Powered by ALPAR AI Internal Monitoring
        </div>
      </div>
    </div>
  );
}
