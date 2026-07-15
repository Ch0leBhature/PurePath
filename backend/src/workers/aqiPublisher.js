import { redis } from "../cache/redisClient.js";
import { aqiKey } from "../cache/keys.js";
import { getAiqData } from "../services/aqi.service.js";

const DEFAULT_INTERVAL_MS = Number(
  process.env.AQI_PUBLISH_INTERVAL_MS || 60000,
);
const THRESHOLD = Number(process.env.AQI_DELTA_THRESHOLD || 5);

async function sampleAndPublish() {
  try {
    const members = await redis.smembers("aqi:monitored");
    if (!members || members.length === 0) return;

    for (const entry of members) {
      const [latStr, lngStr] = entry.split(":");
      const lat = Number(latStr);
      const lng = Number(lngStr);
      try {
        // previous cached value
        const key = aqiKey(lat, lng);
        const prevRaw = await redis.get(key);
        const prev = prevRaw ? JSON.parse(prevRaw) : null;
        const prevAqi = prev?.data?.list?.[0]?.main?.aqi ?? null;

        const payload = await getAiqData(lat, lng, { forceRefresh: true });
        const newAqi = payload?.data?.list?.[0]?.main?.aqi ?? null;

        if (prevAqi === null || newAqi === null) continue;

        if (Math.abs(newAqi - prevAqi) >= THRESHOLD) {
          const channel = `aqi:channel:${lat.toFixed(4)}:${lng.toFixed(4)}`;
          const message = JSON.stringify({
            lat,
            lng,
            prevAqi,
            newAqi,
            ts: Date.now(),
          });
          await redis.publish(channel, message);
        }
      } catch (e) {
        console.warn("sample error", e?.message || e);
      }
    }
  } catch (err) {
    console.error("AQI publisher error", err);
  }
}

let intervalHandle = null;

export function startPublisher(intervalMs = DEFAULT_INTERVAL_MS) {
  if (intervalHandle) return;
  intervalHandle = setInterval(sampleAndPublish, intervalMs);
  console.log("AQI publisher started, interval=", intervalMs);
}

export function stopPublisher() {
  if (!intervalHandle) return;
  clearInterval(intervalHandle);
  intervalHandle = null;
}
