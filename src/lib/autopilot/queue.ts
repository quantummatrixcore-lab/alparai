import "server-only";
import { Redis } from "@upstash/redis";
import type { IdempotencyKey } from "./types";
import { logger } from "@/lib/utils/logger";

export interface QueueHandle {
  available: boolean;
  push: (job: QueueJob) => Promise<string | null>;
  pull: (max: number) => Promise<QueueJob[]>;
  ack: (id: string) => Promise<void>;
  size: () => Promise<number>;
}

export interface QueueJob {
  id: string;
  action: string;
  idempotencyKey: string;
  payload: unknown;
  enqueuedAt: number;
}

const QUEUE_KEY = "alpar:autopilot:queue";
const QUEUE_INDEX = "alpar:autopilot:queue:index";
const MAX_QUEUE_LENGTH = 10_000;

let _redis: Redis | null = null;
let _handle: QueueHandle | null = null;

const getRedis = (): Redis | null => {
  if (_redis) return _redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  _redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return _redis;
};

const createInProcessHandle = (): QueueHandle => {
  const inMemory = new Map<string, QueueJob>();
  return {
    available: false,
    push: async (job) => {
      inMemory.set(job.id, job);
      return job.id;
    },
    pull: async (max) => {
      const items: QueueJob[] = [];
      for (const [, job] of inMemory) {
        items.push(job);
        if (items.length >= max) break;
      }
      return items;
    },
    ack: async (id) => {
      inMemory.delete(id);
    },
    size: async () => inMemory.size,
  };
};

const createRedisHandle = (redis: Redis): QueueHandle => {
  return {
    available: true,
    push: async (job) => {
      const size = await redis.llen(QUEUE_KEY);
      if (size >= MAX_QUEUE_LENGTH) {
        logger.warn("[autopilot] queue at capacity, dropping job", { size, max: MAX_QUEUE_LENGTH });
        return null;
      }
      const data = JSON.stringify(job);
      await redis.rpush(QUEUE_KEY, data);
      await redis.sadd(QUEUE_INDEX, job.id);
      return job.id;
    },
    pull: async (max) => {
      const raw = await redis.lpop<string | null>(QUEUE_KEY, max);
      if (!raw) return [];
      const items = Array.isArray(raw) ? raw : [raw];
      const jobs: QueueJob[] = [];
      for (const item of items) {
        if (typeof item !== "string") continue;
        try {
          const parsed = JSON.parse(item) as QueueJob;
          jobs.push(parsed);
        } catch (e) {
          console.error("Ignored error:", e);
        }
      }
      return jobs;
    },
    ack: async (id) => {
      await redis.srem(QUEUE_INDEX, id);
    },
    size: async () => {
      const len = await redis.llen(QUEUE_KEY);
      return typeof len === "number" ? len : 0;
    },
  };
};

export const getQueue = (): QueueHandle => {
  if (_handle) return _handle;
  const redis = getRedis();
  _handle = redis ? createRedisHandle(redis) : createInProcessHandle();
  return _handle;
};

export const enqueueAutopilotJob = async (
  action: string,
  idempotencyKey: IdempotencyKey,
  payload: unknown,
): Promise<string | null> => {
  const q = getQueue();
  const job: QueueJob = {
    id: `${action}:${idempotencyKey}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    action,
    idempotencyKey,
    payload,
    enqueuedAt: Date.now(),
  };
  return q.push(job);
};
