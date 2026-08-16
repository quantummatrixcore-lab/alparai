/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface TaskPayload {
  id: string;
  type: string;
  data: any;
}

export class AutopilotQueue {
  private queueName: string;

  constructor(queueName: string = 'autopilot:queue') {
    this.queueName = queueName;
  }

  async enqueue(task: TaskPayload): Promise<void> {
    await redis.lpush(this.queueName, JSON.stringify(task));
  }

  async dequeue(): Promise<TaskPayload | null> {
    const data = await redis.rpop(this.queueName);
    if (!data) return null;
    return typeof data === 'string' ? JSON.parse(data) : (data as TaskPayload);
  }

  async getQueueLength(): Promise<number> {
    return await redis.llen(this.queueName);
  }
}

// --- SHIM FOR LEGACY EXPORTS ---
export interface QueueJob {
  id?: string;
  action: string;
  idempotencyKey: string;
  data: any;
  payload?: any;
}

export interface QueueHandle {
  enqueue: (job: QueueJob) => Promise<void>;
  pull: (count?: number) => Promise<QueueJob[]>;
  ack: (jobId: string) => Promise<void>;
  size: () => number | Promise<number>;
  available: () => number | Promise<number>;
}

export const getQueue = (): QueueHandle => {
  const q = new AutopilotQueue();
  return {
    enqueue: async (job: QueueJob) => await q.enqueue({ id: job.idempotencyKey, type: job.action, data: job.data }),
    pull: async () => [],
    ack: async () => {},
    size: async () => await q.getQueueLength(),
    available: async () => await q.getQueueLength(),
  };
};

export const enqueueAutopilotJob = async (action: string, idempotencyKey: string, data: any): Promise<void> => {
  await getQueue().enqueue({ action, idempotencyKey, data });
};
