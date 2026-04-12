import Redis from 'ioredis';
import { createClient } from 'redis';

export class TaintDatabase {
  private redis: Redis;

  constructor() {
    this.redis = createClient({
      host: 'redis',
      port: 6379,
      db: 1 // Dedicated taint DB
    });
  }

  async isPermanentlyTainted(coinId: string): Promise<boolean> {
    const taintStatus = await this.redis.get(`taint:permanent:${coinId}`);
    return taintStatus === '1';
  }

  async markPermanentlyTainted(coinId: string, exitHistory: string[]): Promise<void> {
    const pipeline = this.redis.multi();
    
    // Set permanent taint (TTL: FOREVER)
    pipeline.set(`taint:permanent:${coinId}`, '1');
    pipeline.pexpire(`taint:permanent:${coinId}`, -1); // No expiry
    
    // Store exit history
    pipeline.hset(`coin:${coinId}:history`, 'exits', JSON.stringify(exitHistory));
    
    // Add to global blacklist
    pipeline.sadd('global_taint_blacklist', coinId);
    
    await pipeline.exec();
    
    // Notify all nodes
    await this.redis.publish('taint:new', coinId);
  }

  async broadcastTaint(coinId: string): Promise<void> {
    await this.redis.publish('ecosystem:taint_alert', JSON.stringify({
      coinId,
      timestamp: Date.now(),
      severity: 'PERMANENT'
    }));
  }
}
