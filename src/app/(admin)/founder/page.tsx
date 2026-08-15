"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Cpu,
  Database,
  Globe,
  Radio,
  Server,
  Shield,
  Terminal,
  Zap,
  Layers
} from "lucide-react";

const tokenData = [
  { time: "00:00", tokens: 12000, latency: 120 },
  { time: "04:00", tokens: 25000, latency: 150 },
  { time: "08:00", tokens: 80000, latency: 320 },
  { time: "12:00", tokens: 140000, latency: 410 },
  { time: "16:00", tokens: 95000, latency: 290 },
  { time: "20:00", tokens: 42000, latency: 180 },
  { time: "24:00", tokens: 18000, latency: 110 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

const agents = [
  { name: "Atatürk", role: "Meta-Orchestrator", status: "IDLE", color: "bg-blue-500", ping: "4ms" },
  { name: "Fatih", role: "Database / Security", status: "ACTIVE", color: "bg-green-500", ping: "12ms" },
  { name: "Sinan", role: "UI/UX Architecture", status: "IDLE", color: "bg-purple-500", ping: "8ms" },
  { name: "Tesla", role: "CI/CD & DevOps", status: "IDLE", color: "bg-amber-500", ping: "2ms" },
];

export default function OpusDashboard() {
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[SYSTEM] Agent-OS initialized. Orchestrator online.",
    "[EVENT] Fatih deployed to D:\\01_SaaS_Products\\Alparai.",
    "[EVENT] TYPE-1 vulnerability patched successfully.",
    "[TCP] Event-Bus connected on port 5055.",
  ]);

  useEffect(() => {
    const logs = [
      "[ROUTER] engine_tom -> engine_rpe mapped.",
      "[MEMORY] Context compressed via Nasus Doctrine.",
      "[ORCHESTRATOR] Subagent 'Tesla' killed. RAM freed.",
      "[API] DeepSeek V4 API rate limit optimal. 94% quota remaining.",
    ];
    let i = 0;
    const interval = setInterval(() => {
      setTerminalLogs((prev) => [...prev.slice(-4), logs[i % logs.length]]);
      i++;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-y-auto">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
            <Radio className="text-indigo-400" size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Agent-OS <span className="font-light text-slate-500">| God Mode</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            SYSTEM ONLINE
          </div>
        </div>
      </nav>

      <motion.div 
        className="p-6 max-w-[1600px] mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Core Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Cpu size={20} />
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">FREE</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">System RAM</h3>
            <div className="text-3xl font-bold text-white mt-1">12.4 <span className="text-lg text-slate-500 font-medium">GB</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-indigo-500 h-full w-[24%]"></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Only 24% utilized. Auto-kill active.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl group-hover:bg-pink-500/30 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
                <Zap size={20} />
              </div>
              <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">HIGH</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">LLM Throughput</h3>
            <div className="text-3xl font-bold text-white mt-1">14.2K <span className="text-lg text-slate-500 font-medium">tps</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-pink-500 h-full w-[82%]"></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Peak generation speed reached.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Shield size={20} />
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">SECURE</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">Codebase Integrity</h3>
            <div className="text-3xl font-bold text-white mt-1">100<span className="text-lg text-slate-500 font-medium">%</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-emerald-500 h-full w-full"></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Zero 'any' types. Fully typed.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Server size={20} />
              </div>
              <span className="text-xs font-semibold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md">SYNC</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">Event Bus Latency</h3>
            <div className="text-3xl font-bold text-white mt-1">2.4 <span className="text-lg text-slate-500 font-medium">ms</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-amber-500 h-full w-[12%]"></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">TCP port 5055 optimally routed.</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">AI Engine Token Burn Rate</h2>
                <p className="text-sm text-slate-400">Cumulative token usage across all free-tier models.</p>
              </div>
              <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-sm">Last 24h</div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tokenData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#c7d2fe' }}
                  />
                  <Area type="monotone" dataKey="tokens" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Subagent Radar */}
          <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col">
            <h2 className="text-lg font-bold text-white mb-1">Wolf Pack Matrix</h2>
            <p className="text-sm text-slate-400 mb-6">Active subagents running in background.</p>
            
            <div className="flex-1 flex flex-col gap-3">
              {agents.map((agent, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${agent.color} ${agent.status === 'ACTIVE' ? 'animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}`}></div>
                    <div>
                      <div className="text-sm font-bold text-white">{agent.name}</div>
                      <div className="text-xs text-slate-400">{agent.role}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${agent.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
                      {agent.status}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">{agent.ping} ping</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Row: Terminal & Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="bg-[#050505] border border-white/10 rounded-2xl p-0 backdrop-blur-md overflow-hidden flex flex-col h-64">
            <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-slate-400" />
                <span className="text-xs font-mono text-slate-400">agent-os/event-bus</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
              </div>
            </div>
            <div className="p-4 font-mono text-xs flex flex-col gap-1.5 overflow-hidden flex-1">
              {terminalLogs.map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`${log.includes('[EVENT]') ? 'text-amber-400' : log.includes('[ERROR]') ? 'text-red-400' : 'text-emerald-400'}`}
                >
                  <span className="text-slate-600 mr-2">{new Date().toISOString().split('T')[1].slice(0,8)}</span> 
                  {log}
                </motion.div>
              ))}
              <div className="flex items-center mt-2">
                <span className="text-indigo-500 mr-2">❯</span>
                <span className="w-2 h-4 bg-slate-400 animate-pulse"></span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            
            <div className="flex gap-8 items-center z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                  <Globe className="text-indigo-400" size={28} />
                </div>
                <span className="text-xs font-bold text-indigo-300">WebBridge</span>
              </div>
              
              <div className="h-1 w-16 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 relative">
                <div className="absolute top-1/2 left-0 w-2 h-2 bg-white rounded-full -translate-y-1/2 animate-[ping_2s_infinite]"></div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-2xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)]">
                  <Database className="text-purple-400" size={36} />
                </div>
                <span className="text-sm font-bold text-purple-300">Graphify Engine</span>
              </div>

              <div className="h-1 w-16 bg-gradient-to-r from-purple-500/50 to-pink-500/50 relative">
                <div className="absolute top-1/2 left-0 w-2 h-2 bg-white rounded-full -translate-y-1/2 animate-[ping_2s_infinite_0.5s]"></div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-2xl bg-pink-500/20 border border-pink-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                  <Layers className="text-pink-400" size={28} />
                </div>
                <span className="text-xs font-bold text-pink-300">Task Router</span>
              </div>
            </div>
            
            <div className="mt-8 z-10 text-center">
              <h3 className="font-bold text-white">Central Intelligence Topology</h3>
              <p className="text-xs text-slate-400 mt-1">Real-time data flow between core orchestration engines.</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
