import Redis from "ioredis";
import events from "events";

// Raise default listener limit slightly to avoid MaxListeners warnings
events.defaultMaxListeners = Number(process.env.NODE_EVENT_MAX_LISTENERS || 20);

const redisOptions = process.env.REDIS_URL
  ? process.env.REDIS_URL
  : {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 5000),
      maxRetriesPerRequest: Number(
        process.env.REDIS_MAX_RETRIES_PER_REQUEST || 1,
      ),
    };

const redis = new Redis(redisOptions);

let lastRedisErrorLogAt = 0;
const REDIS_ERROR_LOG_INTERVAL_MS = Number(
  process.env.REDIS_ERROR_LOG_INTERVAL_MS || 15000,
);

redis.on("error", (err) => {
  const now = Date.now();
  if (now - lastRedisErrorLogAt >= REDIS_ERROR_LOG_INTERVAL_MS) {
    lastRedisErrorLogAt = now;
    console.error(
      "Redis unavailable, continuing without cache:",
      err?.message || err,
    );
  }
});
redis.on("connect", () => console.log("Redis connected"));
// increase per-client limit {redundant}
if (typeof redis.setMaxListeners === "function") {
  try {
    redis.setMaxListeners(Number(process.env.NODE_EVENT_MAX_LISTENERS || 20));
  } catch (e) {
    /* ignore */
  }
}

// Simple distributed lock helper using SET NX PX + safe release via Lua
const withLock = async (key, ttlMs, fn, attempt = 0) => {
  const lockKey = `lock:${key}`;
  const token = `${Date.now()}:${Math.random()}`;
  const maxAttempts = Number(process.env.REDIS_LOCK_MAX_ATTEMPTS || 20);
  const acquired = await redis.set(lockKey, token, "PX", ttlMs, "NX");
  if (acquired) {
    try {
      return await fn();
    } finally {
      const lua = `if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end`;
      try {
        await redis.eval(lua, 1, lockKey, token);
      } catch (e) {
        console.warn("lock release failed", e?.message || e);
      }
    }
  }

  if (attempt >= maxAttempts) {
    throw new Error(
      `Failed to acquire Redis lock for ${key} after ${maxAttempts} attempts`,
    );
  }

  await new Promise((r) => setTimeout(r, 100));
  return withLock(key, ttlMs, fn, attempt + 1);
};

export { redis, withLock };
