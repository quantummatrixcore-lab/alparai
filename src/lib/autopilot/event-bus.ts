import Redis from "ioredis";

export class EventBus {
  private pubClient: Redis;
  private subClient: Redis;
  private handlers: Map<string, Array<(message: unknown) => void>>;

  constructor() {
    const redisUrl = process.env.UPSTASH_REDIS_URL!;
    this.pubClient = new Redis(redisUrl);
    this.subClient = new Redis(redisUrl);
    this.handlers = new Map();

    // Sadece BİR KEZ dinle (Memory Leak RCE çözümü)
    this.subClient.on("message", (chan: string, msg: string) => {
      const channelHandlers = this.handlers.get(chan);
      if (channelHandlers) {
        let parsedMsg = msg;
        try {
          parsedMsg = JSON.parse(msg);
        } catch (_e) {}
        channelHandlers.forEach((handler) => handler(parsedMsg));
      }
    });
  }

  async publish(channel: string, message: unknown): Promise<number> {
    return await this.pubClient.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, handler: (message: unknown) => void): Promise<void> {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, []);
      await this.subClient.subscribe(channel);
    }
    this.handlers.get(channel)!.push(handler);
  }

  async close() {
    this.pubClient.quit();
    this.subClient.quit();
  }
}
