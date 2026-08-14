"use client";

import { useMemo, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { PlayCircle, Lock, Filter, Sparkles, Info, Download, FileImage } from "lucide-react";
import type { PlanItem } from "@/lib/utils/markdown-parser";
import {
  buildDependencyGraph,
  findCriticalPath,
  type TaskDependencyNode,
} from "@/lib/utils/masterplan-deps";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 70;

interface MasterPlanDepsGraphProps {
  items: PlanItem[];
  onOpenItem: (item: PlanItem) => void;
  searchQuery?: string;
}

interface LayoutNode extends TaskDependencyNode {
  x: number;
  y: number;
  layer: number;
}

export function MasterPlanDepsGraph({
  items,
  onOpenItem,
  searchQuery = "",
}: MasterPlanDepsGraphProps) {
  const t = useTranslations("admin");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "connected" | "blocked" | "startable">(
    "connected",
  );

  const svgRef = useRef<SVGSVGElement | null>(null);

  const graph = useMemo(() => buildDependencyGraph(items), [items]);

  const criticalPathIds = useMemo(() => findCriticalPath(graph.nodes, graph.edges), [graph]);
  const criticalPathSet = useMemo(() => new Set(criticalPathIds), [criticalPathIds]);

  const criticalEdgeSet = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < criticalPathIds.length - 1; i++) {
      const from = criticalPathIds[i];
      const to = criticalPathIds[i + 1];
      graph.edges.forEach((e) => {
        if (e.fromId === from && e.toId === to) {
          set.add(e.id);
        }
      });
    }
    return set;
  }, [criticalPathIds, graph.edges]);

  const itemMap = useMemo(() => {
    const map = new Map<string, PlanItem>();
    items.forEach((i) => map.set(i.id, i));
    return map;
  }, [items]);

  // Export handlers for SVG and PNG graph downloads
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "master-plan-graph.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svgWidth || 800;
      canvas.height = svgHeight || 600;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = pngUrl;
            a.download = "master-plan-graph.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pngUrl);
          }
        }, "image/png");
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Compute node layers and coordinates for SVG layout
  const { layoutNodes, layoutEdges, svgWidth, svgHeight } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // 1. Filter nodes based on searchQuery and filterMode
    let activeNodes = graph.nodes;
    if (q) {
      activeNodes = activeNodes.filter(
        (n) =>
          n.id.toLowerCase().includes(q) ||
          n.title.toLowerCase().includes(q) ||
          (n.owner ?? "").toLowerCase().includes(q) ||
          n.priority.toLowerCase().includes(q),
      );
    }

    if (filterMode === "connected") {
      activeNodes = activeNodes.filter((n) => n.dependsOn.length > 0 || n.blocks.length > 0);
    } else if (filterMode === "blocked") {
      activeNodes = activeNodes.filter((n) => n.isBlocked);
    } else if (filterMode === "startable") {
      activeNodes = activeNodes.filter((n) => n.canStart);
    }

    // 2. Topological layering calculation
    const layerMap = new Map<string, number>();

    // Helper to calculate depth recursively
    const getLayer = (id: string, visited = new Set<string>()): number => {
      if (layerMap.has(id)) return layerMap.get(id)!;
      if (visited.has(id)) return 0; // Cycle safety
      visited.add(id);

      const node = graph.nodeMap.get(id);
      if (!node || node.dependsOn.length === 0) {
        layerMap.set(id, 0);
        return 0;
      }

      let maxPrereqLayer = 0;
      node.dependsOn.forEach((depId) => {
        const depLayer = getLayer(depId, new Set(visited));
        if (depLayer >= maxPrereqLayer) maxPrereqLayer = depLayer + 1;
      });

      layerMap.set(id, maxPrereqLayer);
      return maxPrereqLayer;
    };

    activeNodes.forEach((n) => getLayer(n.id));

    // Group nodes by layer
    const layers: LayoutNode[][] = [];
    activeNodes.forEach((n) => {
      const l = layerMap.get(n.id) || 0;
      while (layers.length <= l) layers.push([]);
      layers[l]!.push({ ...n, layer: l, x: 0, y: 0 });
    });

    // 3. Assign SVG X and Y coordinates
    const COL_GAP = 90;
    const ROW_GAP = 24;
    const PADDING = 30;

    let maxRowLen = 0;
    layers.forEach((layerNodes) => {
      if (layerNodes.length > maxRowLen) maxRowLen = layerNodes.length;
    });

    const calculatedWidth = Math.max(800, layers.length * (NODE_WIDTH + COL_GAP) + PADDING * 2);
    const calculatedHeight = Math.max(400, maxRowLen * (NODE_HEIGHT + ROW_GAP) + PADDING * 2);

    const layoutNodesList: LayoutNode[] = [];
    const layoutNodeMap = new Map<string, LayoutNode>();

    layers.forEach((layerNodes, colIdx) => {
      const x = PADDING + colIdx * (NODE_WIDTH + COL_GAP);
      layerNodes.forEach((node, rowIdx) => {
        const y = PADDING + rowIdx * (NODE_HEIGHT + ROW_GAP);
        const layoutNode = { ...node, x, y };
        layoutNodesList.push(layoutNode);
        layoutNodeMap.set(node.id, layoutNode);
      });
    });

    // Filter edges where both endpoints are in layoutNodeMap
    const validEdges = graph.edges.filter(
      (e) => layoutNodeMap.has(e.fromId) && layoutNodeMap.has(e.toId),
    );

    return {
      layoutNodes: layoutNodesList,
      layoutEdges: validEdges,
      svgWidth: calculatedWidth,
      svgHeight: calculatedHeight,
    };
  }, [graph, searchQuery, filterMode]);

  // Determine active highlight focus
  const activeFocusId = hoveredNodeId || selectedNodeId;

  const highlightedNodeIds = useMemo(() => {
    if (!activeFocusId) return null;
    const set = new Set<string>([activeFocusId]);
    const focusNode = graph.nodeMap.get(activeFocusId);
    if (focusNode) {
      focusNode.dependsOn.forEach((d) => set.add(d));
      focusNode.blocks.forEach((b) => set.add(b));
    }
    return set;
  }, [activeFocusId, graph.nodeMap]);

  const highlightedEdgeIds = useMemo(() => {
    if (!activeFocusId) return null;
    const set = new Set<string>();
    graph.edges.forEach((edge) => {
      if (edge.fromId === activeFocusId || edge.toId === activeFocusId) {
        set.add(edge.id);
      }
    });
    return set;
  }, [activeFocusId, graph.edges]);

  const layoutNodeMap = useMemo(() => {
    const map = new Map<string, LayoutNode>();
    layoutNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [layoutNodes]);

  return (
    <div className="space-y-4">
      {/* Visualizer Header & Filter Controls */}
      <div className="bg-bg-secondary border-border-subtle flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
        <div className="text-fg-muted flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
          <Sparkles className="text-brand-400 h-4 w-4" />
          <span>{t("deps_graph_filter_label")}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterMode("connected")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterMode === "connected"
                ? "bg-brand-500/20 text-brand-400 border-brand-500/30 border"
                : "bg-bg-tertiary text-fg-muted border-border-subtle border hover:text-white"
            }`}
          >
            {t("deps_filter_connected", {
              count: graph.nodes.filter((n) => n.dependsOn.length > 0 || n.blocks.length > 0)
                .length,
            })}
          </button>
          <button
            onClick={() => setFilterMode("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterMode === "all"
                ? "bg-brand-500/20 text-brand-400 border-brand-500/30 border"
                : "bg-bg-tertiary text-fg-muted border-border-subtle border hover:text-white"
            }`}
          >
            {t("deps_filter_all", { count: graph.stats.totalTasks })}
          </button>
          <button
            onClick={() => setFilterMode("startable")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterMode === "startable"
                ? "border-success-500/30 bg-success-500/20 text-success-400 border"
                : "bg-bg-tertiary text-fg-muted border-border-subtle border hover:text-white"
            }`}
          >
            <PlayCircle className="text-success-400 h-3.5 w-3.5" />
            {t("deps_filter_startable", { count: graph.stats.startableCount })}
          </button>
          <button
            onClick={() => setFilterMode("blocked")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterMode === "blocked"
                ? "border-warning-500/30 bg-warning-500/20 text-warning-400 border"
                : "bg-bg-tertiary text-fg-muted border-border-subtle border hover:text-white"
            }`}
          >
            <Lock className="text-warning-400 h-3.5 w-3.5" />
            {t("deps_filter_blocked", { count: graph.stats.blockedCount })}
          </button>
          <button
            onClick={handleExportSVG}
            className="border-border-subtle bg-bg-tertiary text-fg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:text-white"
          >
            <Download className="text-brand-400 h-3.5 w-3.5" />
            <span>Export SVG</span>
          </button>
          <button
            onClick={handleExportPNG}
            className="border-border-subtle bg-bg-tertiary text-fg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:text-white"
          >
            <FileImage className="text-brand-400 h-3.5 w-3.5" />
            <span>Export PNG</span>
          </button>
        </div>
      </div>

      {/* Legend & Instructions */}
      <div className="bg-bg-tertiary/40 border-border-subtle/60 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="bg-success-400 h-2.5 w-2.5 rounded-full"></span>
            <span className="text-fg-secondary font-medium">{t("deps_legend_green")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="bg-warning-400 h-2.5 w-2.5 rounded-full"></span>
            <span className="text-fg-secondary font-medium">{t("deps_graph_legend_blocker")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="bg-brand-400 h-2.5 w-2.5 rounded-full"></span>
            <span className="text-fg-secondary font-medium">{t("deps_graph_legend_peer")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="bg-danger-500 h-2.5 w-2.5 rounded-full"></span>
            <span className="text-fg-secondary text-danger-400 font-medium font-semibold">
              Kritik Yol (Critical Path)
            </span>
          </div>
        </div>
        <div className="text-fg-muted flex items-center gap-1 italic">
          <Info className="text-brand-400 h-3.5 w-3.5" />
          <span>{t("deps_legend_instruction")}</span>
        </div>
      </div>

      {/* Cycle Warning */}
      {graph.hasCycle && (
        <div className="border-danger-500/20 bg-danger-500/10 text-danger-400 mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm font-semibold">
          <span>⚠️</span>
          <span>
            {t("deps_graph_cycle_warning", {
              nodes: graph.cycles.map((c) => c.join(" -> ")).join(", "),
            })}
          </span>
        </div>
      )}

      {/* SVG Canvas Board */}
      <div className="bg-bg-secondary border-border-subtle relative min-h-[420px] overflow-x-auto rounded-xl border p-4 shadow-sm">
        {layoutNodes.length === 0 ? (
          <div className="text-fg-muted flex flex-col items-center justify-center py-16 text-center">
            <Filter className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm font-semibold">{t("deps_graph_empty")}</p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            role="img"
            aria-label={t("deps_svg_aria_label")}
            aria-describedby="deps-graph-legend"
            className="block h-auto w-full select-none"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          >
            <defs>
              {/* Arrow markers */}
              <marker
                id="arrow-satisfied"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>
              <marker
                id="arrow-blocking"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
              </marker>
              <marker
                id="arrow-critical"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
              </marker>
            </defs>

            {/* 1. Render Edges (Connecting Lines) */}
            {layoutEdges.map((edge) => {
              const fromNode = layoutNodeMap.get(edge.fromId);
              const toNode = layoutNodeMap.get(edge.toId);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + NODE_WIDTH; // right edge of source card
              const y1 = fromNode.y + NODE_HEIGHT / 2; // vertical center
              const x2 = toNode.x; // left edge of target card
              const y2 = toNode.y + NODE_HEIGHT / 2;

              // Cubic bezier curve path
              const dx = Math.abs(x2 - x1) / 2;
              const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              const isHighlighted = highlightedEdgeIds ? highlightedEdgeIds.has(edge.id) : true;
              const isSatisfied = edge.status === "satisfied";
              const isCriticalEdge = criticalEdgeSet.has(edge.id);

              let edgeStroke = isSatisfied ? "#10b981" : "#f59e0b";
              let marker = isSatisfied ? "url(#arrow-satisfied)" : "url(#arrow-blocking)";

              if (isCriticalEdge) {
                edgeStroke = "#ef4444";
                marker = "url(#arrow-critical)";
              }

              return (
                <g
                  key={edge.id}
                  className="transition-opacity duration-200"
                  style={{ opacity: isHighlighted ? 1 : 0.15 }}
                >
                  <path
                    d={pathD}
                    fill="none"
                    stroke={edgeStroke}
                    strokeWidth={isCriticalEdge ? 3 : isHighlighted && activeFocusId ? 3 : 2}
                    strokeDasharray={isCriticalEdge ? "none" : isSatisfied ? "none" : "5 3"}
                    markerEnd={marker}
                  />
                </g>
              );
            })}

            {/* 2. Render Nodes (Cards) */}
            {layoutNodes.map((node) => {
              const planItem = itemMap.get(node.id);
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isHighlighted = highlightedNodeIds ? highlightedNodeIds.has(node.id) : true;
              const isCriticalNode = criticalPathSet.has(node.id);

              let cardBorder = "stroke-border-subtle";
              let cardBg = "#111827"; // dark bg

              if (isCriticalNode) {
                cardBorder = "stroke-red-500";
              } else if (node.status === "completed") {
                cardBorder = "stroke-emerald-500/40";
              } else if (node.canStart) {
                cardBorder = "stroke-emerald-400";
              } else if (node.isBlocked) {
                cardBorder = "stroke-amber-500/50";
              }

              if (isSelected || isHovered) {
                cardBorder = "stroke-brand-400";
                cardBg = "#1f2937";
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => {
                    setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
                    if (planItem) onOpenItem(planItem);
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
                      if (planItem) onOpenItem(planItem);
                    }
                  }}
                  className="focus-visible:ring-brand-400 focus:ring-brand-500 cursor-pointer transition-opacity duration-200 focus:ring-2 focus:outline-none focus-visible:ring-2"
                  style={{ opacity: isHighlighted ? 1 : 0.2 }}
                >
                  {/* Card Background Container */}
                  <rect
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx="10"
                    fill={cardBg}
                    className={`${cardBorder} transition-all`}
                    strokeWidth={isSelected || isHovered ? "2.5" : "1.5"}
                  />

                  {/* Header: ID and Priority */}
                  <text
                    x="12"
                    y="22"
                    fill="#9ca3af"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    #{node.id}
                  </text>
                  <text
                    x="160"
                    y="22"
                    fill={node.priority.includes("P0") ? "#f87171" : "#fbbf24"}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {node.priority}
                  </text>

                  {/* Title (Truncated string) */}
                  <text x="12" y="42" fill="#ffffff" fontSize="11" fontWeight="600">
                    {node.title.length > 24 ? `${node.title.substring(0, 22)}...` : node.title}
                  </text>

                  {/* Footer Status Indicators */}
                  <g transform="translate(12, 50)">
                    {node.status === "completed" && (
                      <text x="0" y="10" fill="#34d399" fontSize="9" fontWeight="bold">
                        ✓ {t("plan_status_completed")}
                      </text>
                    )}
                    {node.status !== "completed" && node.canStart && (
                      <text x="0" y="10" fill="#34d399" fontSize="9" fontWeight="bold">
                        {t("deps_status_startable")}
                      </text>
                    )}
                    {node.status !== "completed" && node.isBlocked && (
                      <text x="0" y="10" fill="#fbbf24" fontSize="9" fontWeight="bold">
                        🔒 {t("deps_status_blocked", { count: node.pendingDependencies.length })}
                      </text>
                    )}
                    {node.blocks.length > 0 && (
                      <text x="120" y="10" fill="#60a5fa" fontSize="9" fontWeight="bold">
                        → {t("deps_blocks_count", { count: node.blocks.length })}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}
