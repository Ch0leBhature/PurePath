import axios from "axios";
import { configDotenv } from "dotenv";
import { redis, withLock } from "../cache/redisClient.js";
import { aqiKey } from "../cache/keys.js";

configDotenv({
  path: new URL("../.env", import.meta.url).pathname,
});

const DEFAULT_TTL_SECONDS = Number(process.env.AQI_CACHE_TTL_SECONDS || 600); // 10 minutes

const fetchAqiFromRemote = async (lat, lon) => {
  const res = await axios.get(
    `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OWM_API_KEY}`,
  );
  return res.data;
};

const getAiqData = async (lat, lon, options = {}) => {
  const precision = options.precision || 4;
  const forceRefresh = options.forceRefresh === true;
  const key = aqiKey(lat, lon, precision);

  const fetchFreshPayload = async ({ persistToCache = true } = {}) => {
    const data = await fetchAqiFromRemote(lat, lon);
    const payload = {
      data,
      fetchedAt: Date.now(),
    };

    if (persistToCache) {
      try {
        await redis.set(
          key,
          JSON.stringify(payload),
          "EX",
          DEFAULT_TTL_SECONDS,
        );
      } catch (e) {
        console.warn("AQI cache write skipped", e?.message || e);
      }
    }

    return payload;
  };

  try {
    if (!forceRefresh) {
      const cached = await redis.get(key);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // allow callers to decide staleness using timestamp
          return parsed;
        } catch (e) {
          // fallthrough to refetch
          console.warn("AQI cache parse failed", e?.message || e);
        }
      }
    }

    // Use distributed lock to avoid duplicate external calls
    return await withLock(key, 5000, async () => {
      // check cache again after acquiring lock
      if (!forceRefresh) {
        const again = await redis.get(key);
        if (again) return JSON.parse(again);
      }

      return fetchFreshPayload();
    });
  } catch (err) {
    console.warn(
      "AQI cache unavailable, fetching directly:",
      err?.message || err,
    );
    return fetchFreshPayload({ persistToCache: false });
  }
};

export { getAiqData };
