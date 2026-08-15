import Redis from 'ioredis';

export class EventBus {
  private pubClient: Redis;
  private subClient: Redis;

  constructor() {
    const redisUrl = process.env.UPSTASH_REDIS_URL!;
    this.pubClient = new Redis(redisUrl);
    this.subClient = new Redis(redisUrl);
  }

  async publish(channel: string, message: any): Promise<number> {
    return await this.pubClient.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, handler: (message: any) => void): Promise<void> {
    await this.subClient.subscribe(channel);
    this.subClient.on('message', (chan, msg) => {
      if (chan === channel) {
        try {
          handler(JSON.parse(msg));
        } catch (e) {
          handler(msg);
        }
      }
    });
  }

  async close() {
    this.pubClient.quit();
    this.subClient.quit();
  }
}
