"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Activity,
  CheckCircle2,
  Clock,
  DollarSign,
  Code2,
  Mail,
  Play,
  Pause,
  Zap,
  Cpu,
  Terminal,
  TrendingUp,
  Check,
  Circle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Agent {
  id: string;
  name: string;
  role: string;
  engine: string;
  model: string;
  status: "idle" | "working" | "reviewing" | "deploying";
  currentTask: string;
  color: string;
  avatarBg: string;
  tag: string;
}

interface ConveyorTask {
  id: string;
  title: string;
  stage: number; // 0: Inbox, 1: Value, 2: Code, 3: Approval, 4: Live
  assignedTo: string;
  progress: number;
  category: string;
  color: string;
}

const INITIAL_AGENTS: Agent[] = [
  { id: "1", name: "Atatürk", role: "Supreme Commander", engine: "TOM", model: "gemini-3.1-pro", status: "reviewing", currentTask: "Orchestrating 24/7 Swarm & Master DAG", color: "#8b5cf6", avatarBg: "bg-purple-500/20 text-purple-400 border-purple-500/40", tag: "Supreme DAG" },
  { id: "2", name: "Fatih", role: "Security Sentinel", engine: "SENTINEL", model: "nemotron-3-ultra", status: "working", currentTask: "Auditing CSP & AST Sandbox", color: "#ef4444", avatarBg: "bg-red-500/20 text-red-400 border-red-500/40", tag: "Zero-Trust" },
  { id: "3", name: "İbn-i Sina", role: "Self-Healer", engine: "TARTARUS", model: "nemotron-3-ultra", status: "idle", currentTask: "Monitoring Error Boundaries & WAL", color: "#10b981", avatarBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", tag: "Self-Healing" },
  { id: "4", name: "Edison", role: "CI/CD & Pipeline", engine: "TCSFL", model: "nemotron-3.5", status: "working", currentTask: "DeepSeek Harness Plugin Build", color: "#f59e0b", avatarBg: "bg-amber-500/20 text-amber-400 border-amber-500/40", tag: "5-Step CI/CD" },
  { id: "5", name: "Sokrates", role: "360 Validator", engine: "MV", model: "gemini-3.6-flash", status: "deploying", currentTask: "Live Site E2E & Conveyor UX Test", color: "#06b6d4", avatarBg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40", tag: "E2E QA" },
  { id: "6", name: "Gutenberg", role: "SEO & Documentation", engine: "BABEL", model: "mimo-v2.5", status: "idle", currentTask: "JSON-LD, i18n & Metadata Sync", color: "#ec4899", avatarBg: "bg-pink-500/20 text-pink-400 border-pink-500/40", tag: "i18n & Docs" },
  { id: "7", name: "Da Vinci", role: "UI & Aesthetics", engine: "HEPHAESTUS", model: "muse-spark", status: "working", currentTask: "Isometric Neon & Glassmorphism R&D", color: "#3b82f6", avatarBg: "bg-blue-500/20 text-blue-400 border-blue-500/40", tag: "UI/UX Elite" },
  { id: "8", name: "Columbus", role: "Navigation Zero-404", engine: "COLUMBUS", model: "nemotron-3-ultra", status: "idle", currentTask: "Internal Route Graph Audit", color: "#14b8a6", avatarBg: "bg-teal-500/20 text-teal-400 border-teal-500/40", tag: "Route Moat" },
  { id: "9", name: "Von Neumann", role: "Cache & Memory", engine: "ZENITHINTEL", model: "gemini-3.1-pro", status: "working", currentTask: "Cordis Session Topology & V8 Heap", color: "#a855f7", avatarBg: "bg-purple-500/20 text-purple-400 border-purple-500/40", tag: "Spatiotemporal" },
  { id: "10", name: "Aurelius", role: "Quality Gate", engine: "OMEGA", model: "gemini-3.6-flash", status: "reviewing", currentTask: "TypeScript 0 Error Enforcement", color: "#eab308", avatarBg: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40", tag: "Governance" }
];

export function AutonomousCompanyCanvas() {
  const [agents] = useState<Agent[]>(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(INITIAL_AGENTS[0] ?? null);
  const [isRunning, setIsRunning] = useState(true);
  const [revenue, setRevenue] = useState(846);
  const [hoursSaved, setHoursSaved] = useState(128);
  const [tasksProcessed, setTasksProcessed] = useState(42);
  const [simulationSpeed, setSimulationSpeed] = useState<1 | 2 | 4>(1);
  const [activeStation, setActiveStation] = useState<number | null>(null);

  const [activeTasks, setActiveTasks] = useState<ConveyorTask[]>([
    { id: "task-101", title: "Campaign Plan", stage: 0, assignedTo: "Gutenberg", progress: 68, category: "INCOMING", color: "#a855f7" },
    { id: "task-102", title: "Lead Outreach", stage: 1, assignedTo: "Von Neumann", progress: 45, category: "PROSPECT", color: "#10b981" },
    { id: "task-103", title: "Feature Build", stage: 2, assignedTo: "Edison", progress: 82, category: "DEVELOP", color: "#f97316" },
    { id: "task-104", title: "Human Approval", stage: 3, assignedTo: "Atatürk", progress: 94, category: "REVIEW", color: "#eab308" },
    { id: "task-105", title: "Live Deploy V2", stage: 4, assignedTo: "Sokrates", progress: 20, category: "DEPLOY", color: "#06b6d4" }
  ]);

  const priorityQueue = [
    { title: "Lead Scoring Tool", status: "done", time: "2m ago" },
    { title: "Multi-Agent Swarm", status: "done", time: "12m ago" },
    { title: "DeepSeek Harness AST", status: "in_progress", time: "Active" },
    { title: "Cordis Plugin Matrix", status: "queued", time: "Queued" }
  ];

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setActiveTasks((prev) =>
        prev.map((task) => {
          const increment = (Math.floor(Math.random() * 6) + 3) * simulationSpeed;
          const nextProgress = task.progress + increment;
          if (nextProgress >= 100) {
            const nextStage = (task.stage + 1) % 5;
            if (nextStage === 0) {
              setRevenue((r) => r + Math.floor(Math.random() * 12) + 6);
              setHoursSaved((h) => h + 1);
              setTasksProcessed((t) => t + 1);
            }
            return {
              ...task,
              stage: nextStage,
              progress: 0,
              color: nextStage === 0 ? "#a855f7" : nextStage === 1 ? "#10b981" : nextStage === 2 ? "#f97316" : nextStage === 3 ? "#eab308" : "#06b6d4"
            };
          }
          return { ...task, progress: nextProgress };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, simulationSpeed]);

  const stations = [
    { id: 0, tag: "INCOMING", label: "Campaign Plan", icon: Mail, color: "#a855f7", bg: "bg-purple-500/20 text-purple-300 border-purple-500/40", glow: "rgba(168,85,247,0.5)", x: 230, y: 170 },
    { id: 1, tag: "PROSPECT", label: "Lead Outreach", icon: DollarSign, color: "#10b981", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", glow: "rgba(16,185,129,0.5)", x: 420, y: 195 },
    { id: 2, tag: "DEVELOP", label: "Feature Build", icon: Code2, color: "#f97316", bg: "bg-orange-500/20 text-orange-300 border-orange-500/40", glow: "rgba(249,115,22,0.5)", x: 610, y: 175 },
    { id: 3, tag: "REVIEW", label: "Human Approval", icon: CheckCircle2, color: "#eab308", bg: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40", glow: "rgba(234,179,8,0.5)", x: 800, y: 190 },
    { id: 4, tag: "DEPLOY", label: "Live Production", icon: Zap, color: "#06b6d4", bg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40", glow: "rgba(6,182,212,0.5)", x: 970, y: 260 }
  ];

  const injectNewTask = () => {
    const taskTypes = [
      { title: "DeepSeek AST Sandbox Verification", category: "DEVELOP", color: "#f97316", stage: 2, assignedTo: "Fatih" },
      { title: "Automated Enterprise Lead Intake", category: "INCOMING", color: "#a855f7", stage: 0, assignedTo: "Gutenberg" },
      { title: "Stripe Token Arbitrage Review", category: "PROSPECT", color: "#10b981", stage: 1, assignedTo: "Von Neumann" },
      { title: "Vercel Master Deploy Sign-off", category: "REVIEW", color: "#eab308", stage: 3, assignedTo: "Atatürk" }
    ];
    const chosen = taskTypes[Math.floor(Math.random() * taskTypes.length)]!;
    setActiveTasks((prev) => [
      ...prev.slice(1),
      {
        id: `task-${Date.now()}`,
        title: chosen.title,
        stage: chosen.stage,
        assignedTo: chosen.assignedTo,
        progress: 10,
        category: chosen.category,
        color: chosen.color
      }
    ]);
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto p-2 sm:p-4 select-none">
      <div className="relative w-full rounded-3xl p-3 sm:p-4 bg-white/70 dark:bg-[#0c1424]/80 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          <div className="p-3 sm:p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 backdrop-blur-md flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Revenue Target
              </span>
              <span className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                84.6%
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 my-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">${revenue}</span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">/ $1,000</span>
            </div>
            <div>
              <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  style={{ width: `${Math.min(100, (revenue / 1000) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                <span>$0</span>
                <span>$500</span>
                <span>$1,000</span>
              </div>
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 backdrop-blur-md flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                Hours Saved
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +18% vs yesterday
              </span>
            </div>
            <div className="flex items-end justify-between mt-1">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {hoursSaved}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">HOURS</span>
              </div>
              <div className="flex items-end gap-1 h-8 pb-1">
                {[40, 65, 45, 80, 60, 95, 75, 100].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-emerald-400/60 dark:bg-emerald-500/50 hover:bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ height: `${(h / 100) * 26}px` }}
                  />
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Autonomous 24/7 labor efficiency</p>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 backdrop-blur-md flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-wider uppercase">
                  Autonomous AI Company
                </h2>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ONLINE
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest -mt-0.5">
              24/7 OPERATIONS
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1.5">
                  {["#8b5cf6", "#06b6d4", "#10b981", "#f97316", "#eab308"].map((c, idx) => (
                    <div
                      key={idx}
                      className="w-5 h-5 rounded-full border-2 border-white dark:border-[#0c1424] flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: c }}
                    >
                      <Bot className="w-3 h-3" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 ml-1">
                  10/10 ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-right">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">STATUS</span>
                <span className="text-xs font-black text-emerald-500 dark:text-emerald-400">99.89%</span>
              </div>
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 backdrop-blur-md flex flex-col justify-between h-full gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                Task Pipeline
              </span>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Activity className="w-3 h-3 text-purple-400" />
                {tasksProcessed} Executed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={injectNewTask}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl h-8 text-xs font-bold shadow-md shadow-purple-500/20"
              >
                <Zap className="w-3.5 h-3.5 mr-1" /> + Inject Task
              </Button>
              <Button
                size="sm"
                variant="outline"
                aria-label={isRunning ? "Pause" : "Resume"}
                title={isRunning ? "Pause" : "Resume"}
                onClick={() => setIsRunning(!isRunning)}
                className="rounded-xl h-8 px-2.5 border-slate-200 dark:border-white/10 text-xs font-bold"
              >
                {isRunning ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSimulationSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1))}
                className="rounded-xl h-8 px-2 text-[11px] font-mono font-bold border-slate-200 dark:border-white/10"
              >
                {simulationSpeed}x
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full min-h-[580px] lg:min-h-[660px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] dark:from-[#0b1220] dark:via-[#0e1628] dark:to-[#070b14]">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <svg
          viewBox="0 0 1200 680"
          className="w-full h-full object-cover min-h-[580px] lg:min-h-[660px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.1" />
            </filter>
            <filter id="neonGlowPurple" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#a855f7" floodOpacity="0.8" />
            </filter>
            <filter id="neonGlowGreen" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#10b981" floodOpacity="0.8" />
            </filter>
            <filter id="neonGlowOrange" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#f97316" floodOpacity="0.8" />
            </filter>
            <filter id="neonGlowYellow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#eab308" floodOpacity="0.8" />
            </filter>
            <filter id="neonGlowCyan" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#06b6d4" floodOpacity="0.8" />
            </filter>
            <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdfefe" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#eef2f6" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="conveyorTrack" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="deskWood" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f7d0a2" />
              <stop offset="100%" stopColor="#d99859" />
            </linearGradient>
            <linearGradient id="sofaFabric" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          <g stroke="currentColor" strokeWidth="0.8" className="text-slate-300/40 dark:text-white/[0.04]">
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={`diag1-${i}`} x1={i * 90 - 200} y1="0" x2={i * 90 + 700} y2="680" />
            ))}
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={`diag2-${i}`} x1={i * 90 + 500} y1="0" x2={i * 90 - 400} y2="680" />
            ))}
          </g>
          <path d="M 230 180 C 230 320, 360 380, 480 390" fill="none" stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6 4" className="animate-pulse" filter="url(#neonGlowPurple)" />
          <path d="M 420 205 C 420 300, 490 340, 520 380" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6 4" className="animate-pulse" filter="url(#neonGlowGreen)" />
          <path d="M 610 185 C 610 280, 590 320, 580 380" fill="none" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6 4" className="animate-pulse" filter="url(#neonGlowOrange)" />
          <path d="M 800 200 C 800 320, 680 370, 620 390" fill="none" stroke="#eab308" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6 4" className="animate-pulse" filter="url(#neonGlowYellow)" />
          <path d="M 970 270 C 970 420, 800 440, 660 410" fill="none" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6 4" className="animate-pulse" filter="url(#neonGlowCyan)" />
          <path d="M 120 260 C 120 120, 1060 120, 1060 260 C 1060 420, 780 430, 780 480 C 780 540, 120 540, 120 260 Z" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 120 250 C 120 110, 1060 110, 1060 250 C 1060 410, 780 420, 780 470 C 780 530, 120 530, 120 250 Z" fill="none" stroke="url(#conveyorTrack)" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 120 250 C 120 110, 1060 110, 1060 250 C 1060 410, 780 420, 780 470 C 780 530, 120 530, 120 250 Z" fill="none" stroke="#1e293b" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 120 250 C 120 110, 1060 110, 1060 250 C 1060 410, 780 420, 780 470 C 780 530, 120 530, 120 250 Z" fill="none" stroke="#22c55e" strokeWidth="5" strokeDasharray="14 18" strokeLinecap="round" className="animate-[dash_12s_linear_infinite]" filter="url(#neonGlowGreen)" />
          <g transform="translate(230, 160)" className="cursor-pointer" onClick={() => setActiveStation(0)}>
            <ellipse cx="0" cy="18" rx="34" ry="14" fill="#a855f7" opacity="0.3" filter="url(#neonGlowPurple)" />
            <ellipse cx="0" cy="12" rx="30" ry="12" fill="#7e22ce" />
            <ellipse cx="0" cy="8" rx="26" ry="10" fill="#c084fc" />
            <circle cx="0" cy="-6" r="18" fill="#581c87" stroke="#d8b4fe" strokeWidth="2.5" filter="url(#neonGlowPurple)" />
            <text x="0" y="-1" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">✉</text>
            <g transform="translate(-55, -45)">
              <rect x="-18" y="-14" width="36" height="20" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" filter="url(#cardShadow)" />
              <text x="0" y="0" textAnchor="middle" fontSize="10">⚙️ 🔑</text>
            </g>
            <g transform="translate(-18, -60)">
              <rect x="-10" y="-12" width="20" height="18" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" filter="url(#cardShadow)" />
              <text x="0" y="1" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#3b82f6">!</text>
            </g>
            <g transform="translate(-60, -8)">
              <ellipse cx="0" cy="12" rx="8" ry="4" fill="rgba(0,0,0,0.15)" />
              <rect x="-6" y="-6" width="12" height="14" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="0" cy="-12" r="7" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="-2.5" cy="-12" r="1.5" fill="#3b82f6" />
              <circle cx="2.5" cy="-12" r="1.5" fill="#3b82f6" />
              <g transform="translate(18, 4)">
                <ellipse cx="0" cy="10" rx="8" ry="4" fill="rgba(0,0,0,0.15)" />
                <rect x="-6" y="-6" width="12" height="14" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="0" cy="-12" r="7" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="-2.5" cy="-12" r="1.5" fill="#8b5cf6" />
                <circle cx="2.5" cy="-12" r="1.5" fill="#8b5cf6" />
              </g>
            </g>
          </g>
          <g transform="translate(420, 185)" className="cursor-pointer" onClick={() => setActiveStation(1)}>
            <ellipse cx="0" cy="18" rx="34" ry="14" fill="#10b981" opacity="0.35" filter="url(#neonGlowGreen)" />
            <ellipse cx="0" cy="12" rx="30" ry="12" fill="#047857" />
            <ellipse cx="0" cy="8" rx="26" ry="10" fill="#34d399" />
            <circle cx="0" cy="-6" r="18" fill="#064e3b" stroke="#6ee7b7" strokeWidth="2.5" filter="url(#neonGlowGreen)" />
            <text x="0" y="0" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="black">$</text>
          </g>
          <g transform="translate(610, 165)" className="cursor-pointer" onClick={() => setActiveStation(2)}>
            <ellipse cx="0" cy="18" rx="34" ry="14" fill="#f97316" opacity="0.35" filter="url(#neonGlowOrange)" />
            <ellipse cx="0" cy="12" rx="30" ry="12" fill="#c2410c" />
            <ellipse cx="0" cy="8" rx="26" ry="10" fill="#fb923c" />
            <circle cx="0" cy="-6" r="18" fill="#7c2d12" stroke="#fdba74" strokeWidth="2.5" filter="url(#neonGlowOrange)" />
            <text x="0" y="0" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="black">&lt; &gt;</text>
          </g>
          <g transform="translate(800, 180)" className="cursor-pointer" onClick={() => setActiveStation(3)}>
            <ellipse cx="0" cy="18" rx="34" ry="14" fill="#eab308" opacity="0.35" filter="url(#neonGlowYellow)" />
            <ellipse cx="0" cy="12" rx="30" ry="12" fill="#a16207" />
            <ellipse cx="0" cy="8" rx="26" ry="10" fill="#facc15" />
            <circle cx="0" cy="-6" r="18" fill="#713f12" stroke="#fef08a" strokeWidth="2.5" filter="url(#neonGlowYellow)" />
            <text x="0" y="0" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">✓</text>
            <g transform="translate(48, -10)">
              <ellipse cx="0" cy="14" rx="9" ry="4" fill="rgba(0,0,0,0.15)" />
              <rect x="-7" y="-7" width="14" height="16" rx="4" fill="#ffffff" stroke="#10b981" strokeWidth="1.8" />
              <circle cx="0" cy="-14" r="8" fill="#ffffff" stroke="#10b981" strokeWidth="1.8" />
              <circle cx="-3" cy="-14" r="1.5" fill="#10b981" />
              <circle cx="3" cy="-14" r="1.5" fill="#10b981" />
              <g transform="translate(-5, -34)">
                <rect x="-14" y="-10" width="28" height="16" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" filter="url(#cardShadow)" />
                <text x="0" y="2" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#10b981">✓ OK</text>
              </g>
            </g>
          </g>
          <g transform="translate(970, 250)" className="cursor-pointer" onClick={() => setActiveStation(4)}>
            <ellipse cx="0" cy="18" rx="36" ry="14" fill="#06b6d4" opacity="0.4" filter="url(#neonGlowCyan)" />
            <ellipse cx="0" cy="12" rx="32" ry="12" fill="#0e7490" />
            <ellipse cx="0" cy="8" rx="28" ry="10" fill="#38bdf8" />
            <circle cx="0" cy="-6" r="18" fill="#164e63" stroke="#a5f3fc" strokeWidth="2.5" filter="url(#neonGlowCyan)" />
            <text x="0" y="0" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">⚡</text>
          </g>
          <g transform="translate(560, 390)">
            <ellipse cx="0" cy="65" rx="140" ry="40" fill="rgba(0,0,0,0.14)" />
            <polygon points="-130,20 0,-35 130,20 0,75" fill="url(#deskWood)" stroke="#b45309" strokeWidth="2" />
            <polygon points="-130,20 0,75 0,95 -130,40" fill="#b45309" />
            <polygon points="130,20 0,75 0,95 130,40" fill="#92400e" />
            <g transform="translate(60, 50)">
              <rect x="0" y="0" width="40" height="35" fill="#78350f" rx="3" />
              <line x1="8" y1="12" x2="32" y2="12" stroke="#d97706" strokeWidth="2" />
              <line x1="8" y1="24" x2="32" y2="24" stroke="#d97706" strokeWidth="2" />
            </g>
            <circle cx="-85" cy="30" r="5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
            <rect x="85" y="15" width="10" height="12" rx="2" fill="#d97706" />
            <circle cx="90" cy="12" r="6" fill="#22c55e" />
            <g transform="translate(-75, -20) rotate(12)">
              <rect x="-35" y="-35" width="70" height="42" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.8" filter="url(#neonGlowCyan)" />
              <rect x="-32" y="-32" width="64" height="36" rx="2" fill="#020617" />
              <line x1="-28" y1="-24" x2="10" y2="-24" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="-28" y1="-18" x2="20" y2="-18" stroke="#a855f7" strokeWidth="1.5" />
              <line x1="-28" y1="-12" x2="-5" y2="-12" stroke="#22c55e" strokeWidth="1.5" />
              <line x1="-28" y1="-6" x2="15" y2="-6" stroke="#e2e8f0" strokeWidth="1.5" />
            </g>
            <g transform="translate(0, -35)">
              <rect x="-48" y="-40" width="96" height="52" rx="4" fill="#0f172a" stroke="#a855f7" strokeWidth="2.2" filter="url(#neonGlowPurple)" />
              <rect x="-44" y="-36" width="88" height="44" rx="2" fill="#090d16" />
              <text x="-38" y="-22" fill="#c084fc" fontSize="7" fontFamily="monospace" fontWeight="bold">&gt; ATATÜRK_TOM: 2M_CTX</text>
              <text x="-38" y="-12" fill="#34d399" fontSize="6.5" fontFamily="monospace">&gt; 10_TWINS_PARALLEL: OK</text>
              <text x="-38" y="-2" fill="#38bdf8" fontSize="6.5" fontFamily="monospace">&gt; DEEPSEEK_HARNESS: RUN</text>
            </g>
            <g transform="translate(75, -20) rotate(-12)">
              <rect x="-35" y="-35" width="70" height="42" rx="3" fill="#0f172a" stroke="#22c55e" strokeWidth="1.8" filter="url(#neonGlowGreen)" />
              <rect x="-32" y="-32" width="64" height="36" rx="2" fill="#020617" />
              <path d="M -28 -8 Q -15 -25 0 -12 T 25 -20" fill="none" stroke="#22c55e" strokeWidth="1.5" />
            </g>
            <rect x="-30" y="32" width="45" height="14" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <rect x="22" y="34" width="12" height="10" rx="2" fill="#334155" />
            <g transform="translate(0, 50)">
              <ellipse cx="0" cy="30" rx="20" ry="7" fill="#0f172a" />
              <line x1="0" y1="10" x2="0" y2="30" stroke="#475569" strokeWidth="4" />
              <rect x="-18" y="-22" width="36" height="32" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <rect x="-14" y="-8" width="28" height="24" rx="6" fill="#15803d" />
              <circle cx="0" cy="-18" r="10" fill="#78350f" />
              <circle cx="0" cy="-21" r="10" fill="#573010" />
            </g>
          </g>
          <g transform="translate(140, 520)">
            <ellipse cx="35" cy="45" rx="65" ry="20" fill="rgba(0,0,0,0.12)" />
            <polygon points="-15,10 65,-25 110,10 30,45" fill="url(#sofaFabric)" />
            <rect x="-15" y="-20" width="80" height="30" rx="8" fill="#4338ca" stroke="#3730a3" strokeWidth="2" />
            <rect x="-5" y="-12" width="25" height="22" rx="5" fill="#6366f1" />
            <rect x="30" y="-12" width="25" height="22" rx="5" fill="#818cf8" />
            <polygon points="40,35 75,20 95,35 60,50" fill="#d99859" stroke="#b45309" strokeWidth="1" />
          </g>
          <g transform="translate(85, 420)">
            <ellipse cx="0" cy="18" rx="14" ry="6" fill="rgba(0,0,0,0.15)" />
            <polygon points="-10,0 10,0 7,16 -7,16" fill="#c2410c" stroke="#9a3412" strokeWidth="1" />
            <circle cx="-6" cy="-8" r="9" fill="#16a34a" />
            <circle cx="6" cy="-10" r="10" fill="#22c55e" />
            <circle cx="0" cy="-18" r="11" fill="#4ade80" />
          </g>
          <g transform="translate(740, 510)">
            <ellipse cx="0" cy="18" rx="14" ry="6" fill="rgba(0,0,0,0.15)" />
            <polygon points="-10,0 10,0 7,16 -7,16" fill="#ea580c" stroke="#c2410c" strokeWidth="1" />
            <circle cx="-5" cy="-8" r="9" fill="#15803d" />
            <circle cx="5" cy="-10" r="10" fill="#16a34a" />
            <circle cx="0" cy="-18" r="11" fill="#22c55e" />
          </g>
          <g transform="translate(70, 180)">
            <polygon points="-9,0 9,0 6,14 -6,14" fill="#c2410c" />
            <circle cx="0" cy="-12" r="10" fill="#22c55e" />
          </g>
        </svg>
        <div className="absolute inset-0 pointer-events-none">
          {stations.map((st) => {
            const taskInStage = activeTasks.find((t) => t.stage === st.id);
            const isSelected = activeStation === st.id;
            return (
              <div
                key={st.id}
                style={{ left: `${(st.x / 1200) * 100}%`, top: `${(st.y / 680) * 100}%` }}
                className="absolute -translate-x-1/2 -translate-y-full mb-3 pointer-events-auto transition-transform duration-300 hover:scale-110"
              >
                <div
                  onClick={() => setActiveStation(st.id)}
                  className={`cursor-pointer px-3 py-1.5 rounded-2xl border backdrop-blur-xl shadow-lg flex flex-col items-center gap-0.5 transition-all duration-300 ${
                    isSelected
                      ? "bg-white/95 dark:bg-slate-900/95 ring-2 ring-purple-500 scale-105 shadow-purple-500/30"
                      : "bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800"
                  } ${st.bg}`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-black uppercase tracking-wider">{st.tag}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white truncate max-w-[110px]">
                    {st.label}
                  </span>
                  {taskInStage && (
                    <div className="w-16 bg-slate-200 dark:bg-white/10 h-1 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${taskInStage.progress}%`, backgroundColor: st.color }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-4 left-4 z-20 max-w-[210px] w-full p-3 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Shipped Tasks
            </span>
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none text-[9px] font-bold">
              +14%
            </Badge>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-xl font-black text-slate-900 dark:text-white">42</span>
            <span className="text-[10px] font-semibold text-slate-400">Total Today</span>
          </div>
          <div className="flex items-end gap-1.5 h-6 pt-1">
            {[30, 60, 45, 90, 75, 100].map((v, idx) => (
              <div
                key={idx}
                className="flex-1 bg-emerald-500/40 hover:bg-emerald-500 rounded-sm transition-all"
                style={{ height: `${(v / 100) * 20}px` }}
              />
            ))}
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-[260px] w-full p-3 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-xl hidden sm:block">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
            Priority Queue
          </span>
          <div className="flex flex-col gap-1 text-[10px]">
            {priorityQueue.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-1.5">
                  {item.status === "done" ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : item.status === "in_progress" ? (
                    <Circle className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" />
                  ) : (
                    <Circle className="w-3 h-3 text-slate-400" />
                  )}
                  <span className={`truncate font-medium ${item.status === "done" ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-200"}`}>
                    {item.title}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-4 right-4 z-20 max-w-[220px] w-full p-3 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Performance
            </span>
            <span className="text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
              800 req/m
            </span>
          </div>
          <div className="h-10 w-full mt-1.5 flex items-end">
            <svg viewBox="0 0 100 30" className="w-full h-full">
              <path d="M 0 25 Q 20 10 40 18 T 80 5 T 100 12" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
              <path d="M 0 28 Q 20 20 40 22 T 80 14 T 100 18" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
            </svg>
          </div>
          <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-0.5">
            <span>200</span>
            <span>400</span>
            <span>600</span>
            <span>800</span>
          </div>
        </div>
        <div className="absolute top-8 right-4 z-20 flex flex-col gap-2 max-w-[190px] w-full hidden md:flex">
          <div className="p-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-[9px] mb-1">
              <span className="font-bold text-slate-500 dark:text-slate-400">TASK: Feature Build</span>
              <Badge className="bg-orange-500/20 text-orange-400 text-[8px] px-1.5 py-0 border-none font-bold">
                WORKING
              </Badge>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: "82%" }} />
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-[9px] mb-1">
              <span className="font-bold text-slate-500 dark:text-slate-400">TASK: Human Review</span>
              <Badge className="bg-yellow-500/20 text-yellow-400 text-[8px] px-1.5 py-0 border-none font-bold">
                WORKING
              </Badge>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: "94%" }} />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {agents.map((agent) => {
          const isSelected = selectedAgent?.id === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 backdrop-blur-xl flex flex-col justify-between ${
                isSelected
                  ? "bg-purple-500/15 dark:bg-purple-500/20 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.25)] scale-[1.02]"
                  : "bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-white/5 hover:bg-white dark:hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: agent.color }}
                  />
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {agent.name}
                  </span>
                </div>
                <Badge className="text-[8px] px-1 py-0 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-none font-mono">
                  {agent.engine}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">
                {agent.role}
              </p>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-white/5 text-[9px]">
                <span className="text-slate-400 font-mono truncate max-w-[80px]">{agent.tag}</span>
                <span className={`font-bold capitalize ${agent.status === "working" ? "text-orange-500" : agent.status === "reviewing" ? "text-yellow-500" : "text-emerald-500"}`}>
                  ● {agent.status}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {selectedAgent && (
        <Card className="bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-white/10 backdrop-blur-2xl p-5 shadow-xl rounded-3xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedAgent.name}
                  </h3>
                  <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30 text-[10px] font-bold">
                    {selectedAgent.engine} Engine
                  </Badge>
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                    {selectedAgent.model}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  {selectedAgent.role} — Antigravity Digital Twin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs capitalize font-bold">
                ● {selectedAgent.status}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
            <div className="bg-slate-50 dark:bg-black/40 p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 flex flex-col justify-between">
              <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                Active Autopilot Directive:
              </span>
              <p className="text-slate-900 dark:text-white font-mono mt-1 text-xs font-semibold">
                {selectedAgent.currentTask}
              </p>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-purple-600 dark:text-purple-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>Deterministic Zero-Feedback Autonomous Execution Active</span>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-black/40 p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 flex flex-col justify-between">
              <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                Architecture & Sandbox Moat:
              </span>
              <p className="text-emerald-600 dark:text-emerald-400 font-mono mt-1 text-xs font-semibold">
                DeepSeek Harness (@deepseek-ai/dsh) & Cordis Spatiotemporal DAG Bridge
              </p>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-cyan-500" />
                <span>AST Isolation, Memory Pool & 24/7 Swarm Coordination</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
