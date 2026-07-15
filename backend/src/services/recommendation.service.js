import PRESETS from "../config/presets.js";
import { normalizeMetrics, scoreRoute } from "../utils/scoring.js";

const PRESET_LABELS = {
  fastest: "Fastest",
  balanced: "Balanced",
  eco: "Eco",
  lowest_pollution: "Clean Air",
};

function hashRouteIds(routes) {
  return routes.map((r) => r.id || "").join("|");
}

function winnerBy(routes, selector, direction = "min") {
  return routes.reduce((best, route) => {
    const bestValue = selector(best);
    const nextValue = selector(route);
    return direction === "max"
      ? nextValue > bestValue
        ? route
        : best
      : nextValue < bestValue
        ? route
        : best;
  }, routes[0]);
}

function buildPresetReason(route, winners, presetKey, rank) {
  const presetLabel = PRESET_LABELS[presetKey] || PRESET_LABELS.balanced;
  if (rank === 1) {
    return `Best overall match for the ${presetLabel} preset.`;
  }

  switch (presetKey) {
    case "fastest":
      return route.id === winners.fastest.id
        ? "Fastest ETA among the returned options."
        : "Slightly slower, but included as an alternate trade-off.";
    case "eco":
    case "lowest_pollution":
      return route.id === winners.cleanest.id
        ? "Lowest estimated pollution exposure among the returned options."
        : "Alternate route with a different time vs. air-quality trade-off.";
    default:
      return "Balanced against ETA, traffic, distance, and air quality.";
  }
}

function annotateRoutes(routes, presetKey) {
  const winners = {
    fastest: winnerBy(routes, (route) => route.rawDuration ?? 0),
    cleanest: winnerBy(routes, (route) => route.avgAqi ?? 0),
    shortest: winnerBy(routes, (route) => route.rawDistance ?? 0),
    calmest: winnerBy(routes, (route) => route.trafficMultiplier ?? 1),
  };

  return routes.map((route, index) => {
    const highlights = [];
    if (route.id === winners.fastest.id) highlights.push("Fastest ETA");
    if (route.id === winners.cleanest.id) highlights.push("Cleanest air");
    if (route.id === winners.shortest.id) highlights.push("Shortest distance");
    if (route.id === winners.calmest.id) highlights.push("Lowest traffic");

    return {
      ...route,
      rank: index + 1,
      highlights,
      recommendationReason: buildPresetReason(
        route,
        winners,
        presetKey,
        index + 1,
      ),
    };
  });
}

export function rankRoutes(routes, presetKey = "balanced") {
  const weights = PRESETS[presetKey] || PRESETS.balanced;

  // ensure numeric raw fields exist
  const enriched = routes.map((r, idx) => ({
    ...r,
    id: r.id ?? `r${idx}`,
    rawDuration: r.rawDuration ?? r.duration ?? 0,
    rawDistance: r.rawDistance ?? r.distanceVal ?? 0,
    avgAqi: r.avgAqi ?? 0,
  }));

  const normalized = normalizeMetrics(enriched);

  const scored = normalized.map((route) => {
    const { score, breakdown } = scoreRoute(route, weights);
    return { ...route, score, breakdown };
  });

  scored.sort((a, b) => b.score - a.score || a.avgAqi - b.avgAqi);

  const fastest = winnerBy(scored, (route) => route.rawDuration ?? 0);
  const best = scored[0];
  const ranked = annotateRoutes(scored, presetKey);
  const explanation = generateExplanation(best, fastest, presetKey);

  return {
    ranked,
    explanation,
    preset: presetKey,
    presetLabel: PRESET_LABELS[presetKey] || PRESET_LABELS.balanced,
    routeIdsHash: hashRouteIds(ranked),
  };
}

function generateExplanation(best, baseline, presetKey) {
  const presetLabel = PRESET_LABELS[presetKey] || PRESET_LABELS.balanced;
  const routeLabel =
    best?.id && !/^r\d+$/.test(best.id) ? best.id : "This route";
  const aqiDiff = baseline.avgAqi
    ? ((baseline.avgAqi - best.avgAqi) / baseline.avgAqi) * 100
    : 0;
  const etaDiffSec = (best.rawDuration ?? 0) - (baseline.rawDuration ?? 0);
  const etaDiffMin = Math.round(Math.abs(etaDiffSec) / 60);
  const sign = etaDiffSec > 0 ? "increases" : "changes";

  if (presetKey === "fastest") {
    return `${routeLabel} ranks highest for the ${presetLabel} preset because it keeps ETA lowest while still considering traffic and air quality.`;
  }

  return `${routeLabel} ranks highest for the ${presetLabel} preset, improving pollution exposure by ${Math.round(aqiDiff)}% versus the fastest route while ${sign} travel time by ${etaDiffMin} minutes.`;
}

export default { rankRoutes };
