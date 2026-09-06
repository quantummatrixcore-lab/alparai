import type { PlanItem } from "@/lib/utils/markdown-parser";

export interface TaskDependencyNode {
  id: string;
  title: string;
  status: "completed" | "pending" | "paused";
  priority: string;
  owner?: string;
  dependsOn: string[];
  blocks: string[];
  pendingDependencies: string[];
  pendingBlockedTasks: string[];
  isBlocked: boolean;
  isBlocking: boolean;
  canStart: boolean;
}

export interface TaskDependencyEdge {
  id: string;
  fromId: string;
  toId: string;
  status: "satisfied" | "blocking";
}

export interface DependencyGraphData {
  nodes: TaskDependencyNode[];
  edges: TaskDependencyEdge[];
  nodeMap: Map<string, TaskDependencyNode>;
  startableTaskIds: string[];
  blockedTaskIds: string[];
  cycles: string[][];
  hasCycle: boolean;
  stats: {
    totalTasks: number;
    totalEdges: number;
    completedTasks: number;
    pendingTasks: number;
    pausedTasks: number;
    startableCount: number;
    blockedCount: number;
    blockingCount: number;
  };
}

/**
 * Parses and builds a complete dependency graph from MASTER_PLAN items.
 * Cross-references depends:#XX / Depends: #XX and blocks:#XX bidirectionally.
 */
export function buildDependencyGraph(items: PlanItem[]): DependencyGraphData {
  const itemMap = new Map<string, PlanItem>();
  items.forEach((item) => itemMap.set(item.id, item));

  const completedSet = new Set(items.filter((i) => i.status === "completed").map((i) => i.id));

  // Bidirectional dependency mapping
  const dependsOnMap = new Map<string, Set<string>>();
  const blocksMap = new Map<string, Set<string>>();

  items.forEach((item) => {
    if (!dependsOnMap.has(item.id)) dependsOnMap.set(item.id, new Set());
    if (!blocksMap.has(item.id)) blocksMap.set(item.id, new Set());

    // Explicit depends from markdown parser
    if (item.dependsOn) {
      item.dependsOn.forEach((depId) => {
        dependsOnMap.get(item.id)!.add(depId);
        if (!blocksMap.has(depId)) blocksMap.set(depId, new Set());
        blocksMap.get(depId)!.add(item.id);
      });
    }

    if (item.depends) {
      item.depends.forEach((depNum) => {
        const depId = String(depNum);
        dependsOnMap.get(item.id)!.add(depId);
        if (!blocksMap.has(depId)) blocksMap.set(depId, new Set());
        blocksMap.get(depId)!.add(item.id);
      });
    }

    // Explicit blocks from markdown parser
    if (item.blocks) {
      item.blocks.forEach((blockedId) => {
        blocksMap.get(item.id)!.add(blockedId);
        if (!dependsOnMap.has(blockedId)) dependsOnMap.set(blockedId, new Set());
        dependsOnMap.get(blockedId)!.add(item.id);
      });
    }
  });

  const nodes: TaskDependencyNode[] = [];
  const edges: TaskDependencyEdge[] = [];
  const edgeSet = new Set<string>();
  const nodeMap = new Map<string, TaskDependencyNode>();

  const startableTaskIds: string[] = [];
  const blockedTaskIds: string[] = [];

  items.forEach((item) => {
    const rawDeps = Array.from(dependsOnMap.get(item.id) || []);
    const rawBlocks = Array.from(blocksMap.get(item.id) || []);

    const pendingDeps = rawDeps.filter((depId) => !completedSet.has(depId));
    const pendingBlocks = rawBlocks.filter((targetId) => {
      const targetItem = itemMap.get(targetId);
      return targetItem && targetItem.status !== "completed";
    });

    const isBlocked = item.status === "pending" && pendingDeps.length > 0;
    const canStart = item.status === "pending" && pendingDeps.length === 0;
    const isBlocking = pendingBlocks.length > 0;

    if (canStart) startableTaskIds.push(item.id);
    if (isBlocked) blockedTaskIds.push(item.id);

    const node: TaskDependencyNode = {
      id: item.id,
      title: item.title,
      status: item.status,
      priority: item.priority,
      owner: item.owner,
      dependsOn: rawDeps,
      blocks: rawBlocks,
      pendingDependencies: pendingDeps,
      pendingBlockedTasks: pendingBlocks,
      isBlocked,
      isBlocking,
      canStart,
    };

    nodes.push(node);
    nodeMap.set(item.id, node);

    // Build edges (fromPrereq -> toDependent)
    rawDeps.forEach((depId) => {
      const edgeId = `${depId}->${item.id}`;
      if (!edgeSet.has(edgeId)) {
        edgeSet.add(edgeId);
        edges.push({
          id: edgeId,
          fromId: depId,
          toId: item.id,
          status: completedSet.has(depId) ? "satisfied" : "blocking",
        });
      }
    });
  });

  // --- DFS Cycle Detection ---
  const visited = new Map<string, number>(); // 0: unvisited, 1: visiting, 2: visited
  const pathStack: string[] = [];
  const cycles: string[][] = [];

  function dfs(id: string) {
    visited.set(id, 1);
    pathStack.push(id);

    const deps = dependsOnMap.get(id) || new Set();
    for (const depId of deps) {
      const state = visited.get(depId) || 0;
      if (state === 1) {
        const cycleStartIdx = pathStack.indexOf(depId);
        cycles.push([...pathStack.slice(cycleStartIdx), depId]);
      } else if (state === 0) {
        dfs(depId);
      }
    }

    pathStack.pop();
    visited.set(id, 2);
  }

  items.forEach((item) => {
    if ((visited.get(item.id) || 0) === 0) {
      dfs(item.id);
    }
  });
  // ---------------------------

  const stats = {
    totalTasks: items.length,
    totalEdges: edges.length,
    completedTasks: items.filter((i) => i.status === "completed").length,
    pendingTasks: items.filter((i) => i.status === "pending").length,
    pausedTasks: items.filter((i) => i.status === "paused").length,
    startableCount: startableTaskIds.length,
    blockedCount: blockedTaskIds.length,
    blockingCount: nodes.filter((n) => n.isBlocking).length,
  };

  return {
    nodes,
    edges,
    nodeMap,
    startableTaskIds,
    blockedTaskIds,
    cycles,
    hasCycle: cycles.length > 0,
    stats,
  };
}

/**
 * Filter utility to extract startable tasks (pending tasks with 0 incomplete dependencies)
 */
export function getStartableTasks(items: PlanItem[]): PlanItem[] {
  const graph = buildDependencyGraph(items);
  const startableSet = new Set(graph.startableTaskIds);
  return items.filter((i) => startableSet.has(i.id));
}

/**
 * Filter utility to extract blocked tasks (pending tasks waiting on incomplete dependencies)
 */
export function getBlockedTasks(items: PlanItem[]): PlanItem[] {
  const graph = buildDependencyGraph(items);
  const blockedSet = new Set(graph.blockedTaskIds);
  return items.filter((i) => blockedSet.has(i.id));
}

/**
 * Finds the critical path (longest path of dependent tasks in the DAG) using DFS.
 * Returns array of node IDs on the critical path.
 */
export function findCriticalPath(
  nodes: TaskDependencyNode[],
  edges: TaskDependencyEdge[],
): string[] {
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));

  edges.forEach((e) => {
    if (adj.has(e.fromId)) {
      adj.get(e.fromId)!.push(e.toId);
    }
  });

  const memo = new Map<string, string[]>();

  function dfs(nodeId: string): string[] {
    if (memo.has(nodeId)) return memo.get(nodeId)!;

    const neighbors = adj.get(nodeId) || [];
    let longestNextPath: string[] = [];

    for (const neighborId of neighbors) {
      const neighborPath = dfs(neighborId);
      if (neighborPath.length > longestNextPath.length) {
        longestNextPath = neighborPath;
      }
    }

    const path = [nodeId, ...longestNextPath];
    memo.set(nodeId, path);
    return path;
  }

  let longestPath: string[] = [];
  nodes.forEach((n) => {
    const path = dfs(n.id);
    if (path.length > longestPath.length) {
      longestPath = path;
    }
  });

  return longestPath;
}
