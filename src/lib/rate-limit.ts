type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitRecord>();

export function rateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  store.set(ip, record);
  
  return { success: true, remaining: limit - record.count, resetAt: record.resetAt };
}

// Clean up expired entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of store.entries()) {
    if (now > record.resetAt) {
      store.delete(ip);
    }
  }
}, 60000).unref();
