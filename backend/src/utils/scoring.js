function minMaxNormalize(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((v) => (v - min) / (max - min));
}

export function normalizeMetrics(routes) {
  // Expect routes to have numeric fields: eta (seconds), distance (meters), avgAqi
  const etas = routes.map((r) => r.rawDuration || r.duration || 0);
  const distances = routes.map((r) => r.rawDistance || r.distanceVal || 0);
  const aqis = routes.map((r) => r.avgAqi || 0);
  const traffics = routes.map((r) => r.trafficMultiplier || 1);

  const nEta = minMaxNormalize(etas);
  const nDist = minMaxNormalize(distances);
  const nAqi = minMaxNormalize(aqis);
  const nTraffic = minMaxNormalize(traffics);

  return routes.map((r, i) => ({
    ...r,
    norm: {
      eta: nEta[i],
      distance: nDist[i],
      aqi: nAqi[i],
      traffic: nTraffic[i],
    },
  }));
}

export function scoreRoute(route, weights) {
  // higher score is better; since normalized metrics are 0..1 where higher means worse (more time/distance/aqi), invert them
  const norm = route.norm || {
    eta: 0.5,
    distance: 0.5,
    aqi: 0.5,
    traffic: 0.5,
  };
  const w = weights;
  const etaScore = (1 - (norm.eta ?? 0)) * (w.eta || 0);
  const distScore = (1 - (norm.distance ?? 0)) * (w.distance || 0);
  const aqiScore = (1 - (norm.aqi ?? 0)) * (w.aqi || 0);
  const trafficScore = (1 - (norm.traffic ?? 0)) * (w.traffic || 0);

  const total = etaScore + distScore + aqiScore + trafficScore;
  return {
    score: total,
    breakdown: { etaScore, distScore, aqiScore, trafficScore },
  };
}

export default { normalizeMetrics, scoreRoute, minMaxNormalize };
