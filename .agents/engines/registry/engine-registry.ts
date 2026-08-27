/**
 * 🏛️ Sovereign Engine Registry (TypeScript)
 *
 * Loads all 33 engine definitions from the engines/ directory
 * and provides a unified interface for querying, health-checking,
 * and executing engines.
 *
 * Usage:
 *   import { registry } from './lib/engine-registry';
 *   const all = await registry.listEngines();
 *   const tom = await registry.getEngine('TOM');
 *   const health = await registry.healthCheck();
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENGINES_DIR = path.resolve(__dirname, "..", "..", "engines");
const LIVE_API_URL = "http://37.27.251.29:9080/health/deep";

export interface EngineDefinition {
  id: string;
  key: string;
  name: string;
  description: string;
  version: string;
  status: string;
  capabilities: string[];
  registered_at?: string;
  uptime_seconds?: number;
}

export class EngineRegistry {
  private engines: Map<string, EngineDefinition> = new Map();
  private loaded = false;
  private liveDataTimestamp: string | null = null;

  async load(useLive: boolean = true): Promise<void> {
    if (this.loaded && !useLive) return;

    if (useLive) {
      try {
        const resp = await fetch(LIVE_API_URL, { signal: AbortSignal.timeout(5000) });
        if (resp.ok) {
          const data = await resp.json();
          const liveEngines = data?.engines?.engines || [];
          for (const e of liveEngines) {
            const def: EngineDefinition = {
              id: e.id,
              key: e.key,
              name: e.name,
              description: e.description,
              version: e.version || "3.3.0",
              status: e.status,
              capabilities: e.capabilities || [],
              registered_at: data.timestamp,
              uptime_seconds: data.uptime_seconds,
            };
            this.engines.set(e.key, def);
            this.engines.set(e.id, def);
          }
          this.liveDataTimestamp = data.timestamp;
          this.loaded = true;
          return;
        }
      } catch {
        // Live fetch failed — fall through to JSON fallback
      }
    }

    // JSON fallback
    const files = fs
      .readdirSync(ENGINES_DIR)
      .filter((f) => f.endsWith(".json"))
      .sort();

    for (const file of files) {
      const filePath = path.join(ENGINES_DIR, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const engine: EngineDefinition = JSON.parse(content);
      this.engines.set(engine.key, engine);
      this.engines.set(engine.id, engine);
    }

    this.loaded = true;
  }

  async refresh(): Promise<void> {
    this.engines.clear();
    this.loaded = false;
    await this.load(true);
  }

  isLive(): boolean {
    return this.liveDataTimestamp !== null;
  }

  getSource(): string {
    return this.isLive() ? `Live backend (${this.liveDataTimestamp})` : "JSON files (cached)";
  }

  listEngines(): EngineDefinition[] {
    return Array.from(this.engines.values())
      .filter((v, i, a) => a.findIndex((e) => e.id === v.id) === i)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  getEngine(keyOrId: string): EngineDefinition | undefined {
    return this.engines.get(keyOrId);
  }

  getHealthy(): EngineDefinition[] {
    return this.listEngines().filter((e) => e.status === "healthy");
  }

  getDegraded(): EngineDefinition[] {
    return this.listEngines().filter((e) => e.status !== "healthy");
  }

  healthCheck(): {
    total: number;
    healthy: number;
    degraded: number;
    healthyList: string[];
    degradedList: string[];
  } {
    const all = this.listEngines();
    const healthy = all.filter((e) => e.status === "healthy");
    const degraded = all.filter((e) => e.status !== "healthy");
    return {
      total: all.length,
      healthy: healthy.length,
      degraded: degraded.length,
      healthyList: healthy.map((e) => e.key),
      degradedList: degraded.map((e) => `${e.key}: ${e.status}`),
    };
  }

  getByCapability(capability: string): EngineDefinition[] {
    return this.listEngines().filter((e) =>
      e.capabilities.some((c) => c.toLowerCase().includes(capability.toLowerCase())),
    );
  }

  count(): number {
    return this.listEngines().length;
  }
}

export const registry = new EngineRegistry();

export default registry;
