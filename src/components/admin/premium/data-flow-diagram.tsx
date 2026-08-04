"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  status: "active" | "idle" | "error";
  throughput?: string;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  active?: boolean;
}

interface DataFlowDiagramProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  title?: string;
  className?: string;
}

export function DataFlowDiagram({ nodes, edges, title, className }: DataFlowDiagramProps) {
  useEffect(() => {
    const interval = setInterval(() => {}, 2000);
    return () => clearInterval(interval);
  }, []);

  const getNode = (id: string) => nodes.find((n) => n.id === id);

  const statusColor = {
    active: { fill: "#27ae60", glow: "rgba(39,174,96,0.3)" },
    idle: { fill: "#94a3b8", glow: "rgba(148,163,184,0.1)" },
    error: { fill: "#e63946", glow: "rgba(230,57,70,0.3)" },
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-[#050505] p-6",
        className,
      )}
    >
      {title && (
        <h3 className="text-fg-muted mb-4 text-xs font-bold tracking-wider uppercase">{title}</h3>
      )}
      <div className="relative" style={{ height: 200 }}>
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Edges */}
          {edges.map((edge, i) => {
            const from = getNode(edge.from);
            const to = getNode(edge.to);
            if (!from || !to) return null;
            return (
              <g key={i}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={edge.active ? "#a855f7" : "rgba(255,255,255,0.08)"}
                  strokeWidth="0.3"
                  strokeDasharray={edge.active ? "2,2" : "none"}
                />
                {edge.active && (
                  <circle r="1" fill="#a855f7" opacity="0.8">
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path={`M${from.x},${from.y} L${to.x},${to.y}`}
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const color = statusColor[node.status];
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="4"
                  fill={color.fill}
                  opacity="0.2"
                  filter="url(#nodeGlow)"
                />
                <circle cx={node.x} cy={node.y} r="2.5" fill={color.fill} />
                <text
                  x={node.x}
                  y={node.y + 6}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.5)"
                  fontSize="2.5"
                  fontFamily="monospace"
                >
                  {node.label}
                </text>
                {node.throughput && (
                  <text
                    x={node.x}
                    y={node.y + 9}
                    textAnchor="middle"
                    fill={color.fill}
                    fontSize="2"
                    fontFamily="monospace"
                  >
                    {node.throughput}
                  </text>
                )}
              </g>
            );
          })}

          <defs>
            <filter id="nodeGlow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}
