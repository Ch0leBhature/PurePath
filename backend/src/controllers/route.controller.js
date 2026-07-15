import { getLocData } from "../services/route.service.js";
import { getAiqData } from "../services/aqi.service.js";
const getRoute = async (req, res) => {
  try {
    const { start, end, mode } = req.body;

    if (
      !Array.isArray(start) ||
      start.length !== 2 ||
      !Array.isArray(end) ||
      end.length !== 2
    ) {
      return res.status(400).json({ message: "Invalid route coordinates" });
    }

    // console.log("getRoute called with", { start, end, mode });

    const profile = mode || "driving-car";
    const data = await getLocData(start, end, profile);

    const geoJsonCoords = data.features?.[0]?.geometry?.coordinates;

    //error handling for missing or malformed data from ORS
    if (
      !geoJsonCoords ||
      !Array.isArray(geoJsonCoords) ||
      geoJsonCoords.length === 0
    ) {
      // console.error("No route coordinates returned from ORS", { data });
      return res
        .status(502)
        .json({ message: "no route data returned from upstream service" });
    }

    const leafletCoords = geoJsonCoords.map(([lng, lat]) => [lat, lng]);

    // console.log("req.body: ", req.body)

    return res.status(200).json({ coordinates: leafletCoords });
  } catch (err) {
    console.error("getRoute error", err?.stack || err);

    const upstreamStatus = err?.response?.status;
    if (upstreamStatus) {
      return res.status(502).json({
        message: "route provider request failed",
        upstreamStatus,
      });
    }

    return res.status(500).json({ message: "internal server error" });
  }
};

const getAqi = async (req, res) => {
  try {
    const { start, end, mode } = req.body;
    if (
      !Array.isArray(start) ||
      start.length !== 2 ||
      !Array.isArray(end) ||
      end.length !== 2
    ) {
      return res.status(400).json({ message: "Invalid route coordinates" });
    }
    const profile = mode || "driving-car";
    // compute straight-line distance between start and end (meters)
    const toRad = (v) => (v * Math.PI) / 180;
    const [lng1, lat1] = [start[0], start[1]];
    const [lng2, lat2] = [end[0], end[1]];
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDistance = R * c;

    // For long journeys (>100km) only request a single route from ORS
    const alternativesAllowed = straightDistance <= 100000; // 100 km
    const requestedTargetCount = Number(process.env.ROUTE_TARGET_COUNT || 3);
    // openrouteservice supports at most 3 alternative routes per request
    const candidateTargetCount = Math.min(3, Math.max(1, requestedTargetCount));
    const targetCount = alternativesAllowed ? candidateTargetCount : 1;
    const data = await getLocData(start, end, profile, targetCount);

    const features = Array.isArray(data.features) ? data.features : [];
    if (features.length === 0) {
      return res
        .status(502)
        .json({ message: "no route data returned from upstream service" });
    }

    const routes = await Promise.all(
      features.map(async (feature) => {
        const geoJsonCoords = feature.geometry?.coordinates;
        if (!Array.isArray(geoJsonCoords) || geoJsonCoords.length === 0) {
          throw new Error("Invalid feature geometry");
        }

        const leafletCoords = geoJsonCoords.map(([lng, lat]) => [lat, lng]);
        const desiredNumber = 30;
        const step = Math.max(
          1,
          Math.ceil(leafletCoords.length / desiredNumber),
        );

        const sampleCoords = leafletCoords.filter(
          (_, item) => item % step === 0,
        );
        const pollutantKeys = [
          "pm2_5",
          "pm10",
          "no2",
          "o3",
          "so2",
          "co",
          "no",
          "nh3",
        ];
        const sampleReadings = await Promise.all(
          sampleCoords.map(async (coords) => {
            const [lat, lon] = coords;
            const aqiPayload = await getAiqData(lat, lon);
            const reading = aqiPayload?.data?.list?.[0] || null;
            return {
              aqi: reading?.main?.aqi ?? null,
              components: reading?.components || null,
            };
          }),
        );

        const aqiValues = sampleReadings
          .map((reading) => reading.aqi)
          .filter((value) => value != null);
        const totalAqi = aqiValues.reduce((sum, value) => sum + value, 0);
        const avgAqi =
          Math.floor(
            (aqiValues.length ? totalAqi / aqiValues.length : 0) * 100,
          ) / 100;

        const componentReadings = sampleReadings
          .map((reading) => reading.components)
          .filter(Boolean);
        const pollutants = pollutantKeys.reduce((acc, key) => {
          const values = componentReadings
            .map((components) => Number(components?.[key]))
            .filter((value) => Number.isFinite(value));
          acc[key] = values.length
            ? Math.round(
                (values.reduce((sum, value) => sum + value, 0) /
                  values.length) *
                  100,
              ) / 100
            : 0;
          return acc;
        }, {});

        const dominantPollutant =
          Object.entries(pollutants).sort((a, b) => b[1] - a[1])[0]?.[0] ||
          null;

        let exposure = "";
        let color = "";

        if (avgAqi <= 1) {
          exposure = "Good";
          color = "#00e400";
        } else if (avgAqi <= 2) {
          exposure = "Fair";
          color = "#a3ff00";
        } else if (avgAqi <= 3) {
          exposure = "Moderate";
          color = "#ffff00";
        } else if (avgAqi <= 4) {
          exposure = "Poor";
          color = "#ff7e00";
        } else {
          exposure = "Very Poor";
          color = "#ff0000";
        }

        const segment = feature.properties?.segments?.[0] || {};
        const duration = segment.duration || 0; // seconds
        const distanceVal = segment.distance || 0; // meters
        const minutes = Math.ceil(duration / 60);
        const formattedDistance =
          distanceVal < 1000
            ? `${Math.round(distanceVal)} m`
            : `${(distanceVal / 1000).toFixed(2)} km`;

        return {
          id: feature.properties?.id || undefined,
          coordinates: leafletCoords,
          distance: formattedDistance,
          rawDistance: distanceVal,
          eta: minutes,
          rawDuration: duration,
          avgAqi,
          pollutants,
          dominantPollutant,
          // trafficMultiplier will be filled later
          trafficMultiplier: 1,
          exposure,
          color,
        };
      }),
    );

    // Attempt to load ranked response from cache
    const { redis } = await import("../cache/redisClient.js");
    const { rankedRouteKey } = await import("../cache/keys.js");
    const origin = { lat: start[1], lng: start[0] };
    const dest = { lat: end[1], lng: end[0] };
    const routeIdsHash =
      routes.map((r) => r.id || "").join("|") || String(routes.length);
    const preset = req.body.preset || "balanced";
    const userPrefsHash = "global";
    const cacheKey = rankedRouteKey(
      "default",
      origin,
      dest,
      routeIdsHash,
      preset,
      userPrefsHash,
    );
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          return res.status(200).json(parsed);
        } catch (e) {
          /* fallthrough */
        }
      }
    } catch (e) {
      /* ignore cache errors */
    }

    // fetch traffic multipliers for sampled points per route
    const { getTrafficMultiplier } =
      await import("../services/traffic.service.js");
    await Promise.all(
      routes.map(async (r) => {
        try {
          const pts = r.coordinates.slice(
            0,
            Math.max(1, Math.floor(r.coordinates.length / 6)),
          );
          const mults = await Promise.all(
            pts.map(async (c) => {
              const lat = Array.isArray(c) ? c[0] : c.lat;
              const lng = Array.isArray(c) ? c[1] : c.lng;
              return getTrafficMultiplier(lat, lng);
            }),
          );
          const avgMult =
            mults.reduce((s, v) => s + v, 0) / (mults.length || 1);
          r.trafficMultiplier = Math.max(0.5, Math.min(avgMult, 3));
          // adjust duration to reflect traffic
          r.rawDuration = Math.round(
            (r.rawDuration || 0) * r.trafficMultiplier,
          );
        } catch (e) {
          r.trafficMultiplier = 1;
        }
      }),
    );

    // rank routes using recommendation engine
    const { rankRoutes } =
      await import("../services/recommendation.service.js");
    const ranked = rankRoutes(routes, preset);
    const displayLimit = Number(process.env.MAX_DISPLAY_ROUTES || 3);
    const topRanked = ranked.ranked
      .slice(0, displayLimit)
      .map((route, index) => ({
        ...route,
        explanation: index === 0 ? ranked.explanation : undefined,
        presetLabel: ranked.presetLabel,
        isRecommended: index === 0,
      }));

    const responsePayload = {
      routes: topRanked,
      totalCandidates: ranked.ranked.length,
      alternativesAvailable: alternativesAllowed,
      explanation: ranked.explanation,
      preset: ranked.preset,
      presetLabel: ranked.presetLabel,
    };

    // persist analysis for analytics
    try {
      const RouteAnalysis = (await import("../models/routeAnalysis.model.js"))
        .default;
      const doc = {
        userId: req.user?._id || undefined,
        origin: { coordinates: [start[1], start[0]] },
        destination: { coordinates: [end[1], end[0]] },
        preset,
        candidates: ranked.ranked.map((r) => ({
          routeId: r.id,
          avgAqi: r.avgAqi,
          rawDuration: r.rawDuration,
          rawDistance: r.rawDistance,
          presetScore: r.score,
          exposure: r.exposure,
        })),
        chosenRouteId: ranked.ranked[0]?.id || undefined,
      };
      try {
        await RouteAnalysis.create(doc);
      } catch (e) {
        console.warn("persist analysis failed", e?.message || e);
      }
    } catch (e) {
      /* ignore */
    }

    // cache the ranked payload for short period
    try {
      await redis.set(
        cacheKey,
        JSON.stringify(responsePayload),
        "EX",
        Number(process.env.RANKED_CACHE_TTL || 300),
      );
    } catch (e) {
      /* ignore cache write errors */
    }

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error("getAqi error", err?.stack || err);

    const upstreamStatus = err?.response?.status;
    if (upstreamStatus) {
      return res.status(502).json({
        message: "route provider request failed",
        upstreamStatus,
      });
    }

    return res.status(500).json({ message: "internal server error" });
  }
};

export { getRoute, getAqi };
