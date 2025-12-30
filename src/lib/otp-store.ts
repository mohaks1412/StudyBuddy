
import { Redis } from '@upstash/redis';

const otpStore = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const otpStorage = {
  set: async (email: string, code: string, ttlSeconds = 600) => {
    
    await otpStore.del(email);
    await otpStore.setex(email, ttlSeconds, code);
  },
  
  get: async (email: string) => {
    const code = await otpStore.get(email) as string | null;
    
    return code || null;
  },
  
  delete: async (email: string) => {
    await otpStore.del(email);
  }
};
