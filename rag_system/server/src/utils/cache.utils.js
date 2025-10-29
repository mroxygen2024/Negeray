  const cacheStore = new Map();

export const getCache = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cacheStore.delete(key);
    return null;
  }
  return entry.value;
};

export const setCache = (key, value, ttl = process.env.CACHE_TTL ) => {
  cacheStore.set(key, { value, expiry: Date.now() + ttl });
};
