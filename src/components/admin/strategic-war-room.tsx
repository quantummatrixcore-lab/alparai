"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Robot, GlobeHemisphereWest, Scan, Database, Pulse } from "@phosphor-icons/react";

export interface LiveProvider {
  id: string;
  name: string;
  trust_score: number | null;
}

interface StrategicWarRoomProps {
  liveProviders?: LiveProvider[];
}

export function StrategicWarRoom({ liveProviders = [] }: StrategicWarRoomProps) {
  const t = useTranslations("admin");
  const [activeNode, setActiveNode] = useState<string | number | null>(null);
  const [pulse, setPulse] = useState(false);

  // Generate nodes dynamically
  const NODES = [
    { id: "core", label: t("core_engine"), type: "system", x: 50, y: 50, status: "healthy" },
    { id: "db", label: t("global_threat_db"), type: "data", x: 50, y: 85, status: "healthy" },
  ];

  const CONNECTIONS = [{ source: "core", target: "db" }];

  // Map live providers to a circle around the core
  liveProviders.forEach((provider, idx) => {
    const angle = (idx / Math.max(liveProviders.length, 1)) * Math.PI * 2 - Math.PI / 2;
    // Radius of 35% around the center (50, 50)
    const x = 50 + 35 * Math.cos(angle);
    const y = 50 + 30 * Math.sin(angle);
    NODES.push({
      id: provider.id,
      label: provider.name,
      type: "region",
      x,
      y,
      status:
        (provider.trust_score ?? 80) >= 80
          ? "healthy"
          : (provider.trust_score ?? 80) >= 50
            ? "warning"
            : "critical",
    });
    CONNECTIONS.push({ source: "core", target: provider.id });
  });

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-neutral-950/80 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="inline-flex items-center gap-2 font-mono text-lg font-bold tracking-widest text-white uppercase">
          <GlobeHemisphereWest weight="duotone" className="text-brand-400 h-6 w-6" />
          {t("war_room_title")}
        </h2>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 rounded border border-cyan-500/20 bg-cyan-950/50 px-2 py-1 font-mono text-xs text-cyan-400">
            <Scan weight="duotone" className="h-3.5 w-3.5" /> {t("live_topology")}
          </span>
          <span className="bg-brand-950/50 text-brand-400 border-brand-500/20 inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-xs">
            <Pulse weight="duotone" className="h-3.5 w-3.5 animate-pulse" /> {t("active")}
          </span>
        </div>
      </div>

      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-[#050505] inset-shadow-sm">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] bg-[size:40px_40px]" />

        {/* SVG Connections */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {CONNECTIONS.map((conn, i) => {
            const source = NODES.find((n) => n.id === conn.source);
            const target = NODES.find((n) => n.id === conn.target);
            if (!source || !target) return null;
            return (
              <motion.line
                key={i}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                vectorEffect="non-scaling-stroke"
                stroke={
                  activeNode === source.id || activeNode === target.id
                    ? "#06b6d4"
                    : "rgba(255,255,255,0.1)"
                }
                strokeWidth={activeNode === source.id || activeNode === target.id ? 2 : 1}
                strokeDasharray={pulse ? "5,5" : "none"}
                animate={{ strokeDashoffset: pulse ? [0, -10] : 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {NODES.map((node) => {
          const isActive = activeNode === node.id;
          const statusColors = {
            healthy:
              "text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-cyan-950/30",
            warning:
              "text-brand-400 border-brand-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-brand-950/30",
            critical:
              "text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] bg-red-950/30",
          };

          const Icon =
            node.type === "system" ? Robot : node.type === "data" ? Database : GlobeHemisphereWest;

          return (
            <motion.button
              key={node.id}
              className={`group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
              whileHover={{ scale: 1.1 }}
            >
              <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${statusColors[node.status as keyof typeof statusColors]} ${isActive ? "ring-2 ring-white/20" : ""}`}
              >
                {node.status === "critical" && (
                  <span className="absolute -inset-1 animate-ping rounded-full bg-red-500/20" />
                )}
                <Icon weight={isActive ? "fill" : "duotone"} className="h-6 w-6" />
              </div>
              <div className="flex flex-col items-center">
                <span className="rounded border border-white/10 bg-neutral-900/80 px-2 py-0.5 font-mono text-[10px] tracking-wider whitespace-nowrap text-white uppercase opacity-80 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  {node.label}
                </span>
                <span
                  className={`mt-0.5 font-mono text-[9px] tracking-widest uppercase ${node.status === "critical" ? "text-red-400" : node.status === "warning" ? "text-brand-400" : "text-cyan-400"}`}
                >
                  {t("status_" + node.status)}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
