// lib/otp-store.ts
const otpStore = new Map<string, { code: string; expires: number }>();

export const otpStorage = {
  set: async (email: string, code: string, ttlSeconds = 600) => {
    otpStore.set(email, {
      code,
      expires: Date.now() + ttlSeconds * 1000
    });
  },
  
  get: async (email: string) => {
    const data = otpStore.get(email);
    if (!data || Date.now() > data.expires) {
      otpStore.delete(email);
      return null;
    }
    return data.code;
  },
  
  delete: async (email: string) => {
    otpStore.delete(email);
  }
};
