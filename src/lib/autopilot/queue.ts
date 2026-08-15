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
