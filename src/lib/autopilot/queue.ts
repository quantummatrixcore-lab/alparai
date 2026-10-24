let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
import "server-only";
import { Redis } from "@upstash/redis";
import { logger } from "@/lib/utils/logger";
import type { IdempotencyKey } from "./types";


export interface QueueJob {
  id?: string;
  action: string;
  idempotencyKey: string;
  data: Record<string, unknown>;
  payload?: Record<string, unknown>;
  retries?: number;
  retryCount?: number;
  maxRetries?: number;
}

export interface QueueHandle {
  available: boolean;
  enqueue: (job: QueueJob) => Promise<string | null>;
  push: (job: QueueJob) => Promise<string | null>;
  pull: (count?: number) => Promise<QueueJob[]>;
  ack: (jobId: string) => Promise<void>;
  deadLetter?: (job: QueueJob, reason?: string) => Promise<void>;
  size: () => Promise<number>;
}

const MAX_QUEUE_LENGTH = 10000;
const QUEUE_KEY = "alpar:autopilot:queue";
const INDEX_KEY = "alpar:autopilot:queue:index";
const DLQ_KEY = "alpar:autopilot:queue:dead_letter";

class InMemoryQueue implements QueueHandle {
  available = false;
  private jobs: QueueJob[] = [];
  private deadLetters: Array<{ job: QueueJob; reason?: string; timestamp: number }> = [];

  async enqueue(job: QueueJob): Promise<string | null> {
    const id = job.id || `job_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const fullJob: QueueJob = { ...job, id, payload: job.payload ?? job.data };
    this.jobs.push(fullJob);
    return id;
  }

  async push(job: QueueJob): Promise<string | null> {
    return this.enqueue(job);
  }

  async pull(count: number = 10): Promise<QueueJob[]> {
    return this.jobs.splice(0, count);
  }

  async ack(_jobId: string): Promise<void> {
    // Already removed on pull in memory, marked as completed
  }

  async deadLetter(job: QueueJob, reason?: string): Promise<void> {
    this.deadLetters.push({ job, reason, timestamp: Date.now() });
    logger.warn(`[autopilot] job ${job.id || "unknown"} moved to dead_letter: ${reason ?? "max retries reached"}`);
  }

  async size(): Promise<number> {
    return this.jobs.length;
  }

  getDeadLetters(): Array<{ job: QueueJob; reason?: string; timestamp: number }> {
    return [...this.deadLetters];
  }
}

class RedisQueue implements QueueHandle {
  available = true;
  private redis: Redis;

  constructor(url: string, token: string) {
    this.redis = new Redis({ url, token });
  }

  async enqueue(job: QueueJob): Promise<string | null> {
    try {
      const currentLen = await this.redis.llen(QUEUE_KEY);
      if (currentLen >= MAX_QUEUE_LENGTH) {
        logger.warn(
          `[autopilot] queue at capacity (${currentLen}/${MAX_QUEUE_LENGTH}), dropping job`,
          {
            action: job.action,
            idempotencyKey: job.idempotencyKey,
          },
        );
        return null;
      }
      const id = job.id || `job_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
      const fullJob: QueueJob = { ...job, id, payload: job.payload ?? job.data };
      await this.redis.rpush(QUEUE_KEY, JSON.stringify(fullJob));
      await this.redis.sadd(INDEX_KEY, id);
      return id;
    } catch (err) {
      logger.error("[autopilot] failed to enqueue job to Redis", { error: err });
      return null;
    }
  }

  async push(job: QueueJob): Promise<string | null> {
    return this.enqueue(job);
  }

  async pull(count: number = 10): Promise<QueueJob[]> {
    try {
      const raw = await this.redis.lpop(QUEUE_KEY, count);
      if (!raw) return [];
      const items = Array.isArray(raw) ? raw : [raw];
      const parsed: QueueJob[] = [];
      for (const item of items) {
        if (!item) continue;
        try {
          const obj = typeof item === "string" ? JSON.parse(item) : item;
          if (obj && typeof obj === "object") {
            parsed.push(obj);
          }
        } catch {
          // ignore invalid json
        }
      }
      return parsed;
    } catch (err) {
      logger.error("[autopilot] failed to pull jobs from Redis", { error: err });
      return [];
    }
  }

  async ack(jobId: string): Promise<void> {
    if (!jobId) return;
    try {
      await this.redis.srem(INDEX_KEY, jobId);
    } catch (err) {
      logger.error("[autopilot] failed to ack job in Redis", { jobId, error: err });
    }
  }

  async deadLetter(job: QueueJob, reason?: string): Promise<void> {
    try {
      const record = {
        job,
        reason: reason ?? "max retries reached",
        timestamp: Date.now(),
      };
      await this.redis.rpush(DLQ_KEY, JSON.stringify(record));
      logger.warn(`[autopilot] job ${job.id || "unknown"} moved to Redis dead_letter: ${record.reason}`);
    } catch (err) {
      logger.error("[autopilot] failed to move job to dead_letter queue in Redis", { jobId: job.id, error: err });
    }
  }

  async size(): Promise<number> {
    try {
      return await this.redis.llen(QUEUE_KEY);
    } catch {
      return 0;
    }
  }
}

let cachedQueue: QueueHandle | null = null;

export function getQueue(): QueueHandle {
  const url = (vault.read('UPSTASH_REDIS_REST_URL') ?? process.env.UPSTASH_REDIS_REST_URL);
  const token = (vault.read('UPSTASH_REDIS_REST_TOKEN') ?? process.env.UPSTASH_REDIS_REST_TOKEN);
  if (url && token) {
    if (!cachedQueue || !cachedQueue.available) {
      cachedQueue = new RedisQueue(url, token);
    }
    return cachedQueue;
  }
  if (!cachedQueue || cachedQueue.available) {
    cachedQueue = new InMemoryQueue();
  }
  return cachedQueue;
}

export async function enqueueAutopilotJob(
  action: string,
  idempotencyKey: IdempotencyKey | string,
  data: Record<string, unknown> = {},
): Promise<string | null> {
  const q = getQueue();
  return await q.enqueue({
    action,
    idempotencyKey: String(idempotencyKey),
    data,
    payload: data,
  });
}
