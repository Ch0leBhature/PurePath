import { redis } from "../cache/redisClient.js";
import { getAiqData } from "../services/aqi.service.js";

function normalizeLatLng(lat, lng, precision = 4) {
  const la = Number(lat).toFixed(precision);
  const ln = Number(lng).toFixed(precision);
  return `${la}:${ln}`;
}

export async function addMonitored(req, res) {
  try {
    const { lat, lng } = req.body;
    if (lat == null || lng == null)
      return res.status(400).json({ error: "lat and lng required" });
    const member = normalizeLatLng(lat, lng);
    await redis.sadd("aqi:monitored", member);
    return res.json({ ok: true, member });
  } catch (e) {
    console.error("addMonitored", e);
    return res.status(500).json({ error: "server error" });
  }
}

export async function removeMonitored(req, res) {
  try {
    const { lat, lng } = req.body;
    if (lat == null || lng == null)
      return res.status(400).json({ error: "lat and lng required" });
    const member = normalizeLatLng(lat, lng);
    await redis.srem("aqi:monitored", member);
    return res.json({ ok: true, member });
  } catch (e) {
    console.error("removeMonitored", e);
    return res.status(500).json({ error: "server error" });
  }
}

export async function listMonitored(req, res) {
  try {
    const members = await redis.smembers("aqi:monitored");
    const coords = members.map((m) => {
      const [la, ln] = m.split(":");
      return { lat: Number(la), lng: Number(ln) };
    });
    return res.json({ ok: true, coords });
  } catch (e) {
    console.error("listMonitored", e);
    return res.status(500).json({ error: "server error" });
  }
}

export async function getCurrentAqi(req, res) {
  try {
    const { lat, lng } = req.body;
    if (lat == null || lng == null) {
      return res.status(400).json({ error: "lat and lng required" });
    }

    const payload = await getAiqData(Number(lat), Number(lng));
    const reading = payload?.data?.list?.[0] || null;

    return res.json({
      ok: true,
      lat: Number(lat),
      lng: Number(lng),
      aqi: reading?.main?.aqi ?? null,
      components: reading?.components || null,
      fetchedAt: payload?.fetchedAt || null,
    });
  } catch (e) {
    console.error("getCurrentAqi", e);
    return res.status(500).json({ error: "server error" });
  }
}
