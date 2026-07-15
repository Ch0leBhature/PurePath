function roundCoord(num, decimals = 5) {
  return Number(Number(num).toFixed(decimals));
}

export function routeGeomKey(mode, origin, destination) {
  const oLat = roundCoord(origin.lat);
  const oLng = roundCoord(origin.lng);
  const dLat = roundCoord(destination.lat);
  const dLng = roundCoord(destination.lng);
  return `route:geom:v1:${mode}:${oLat},${oLng}:${dLat},${dLng}`;
}

export function aqiKey(lat, lng, precision = 4) {
  const la = roundCoord(lat, precision);
  const ln = roundCoord(lng, precision);
  return `aqi:coord:v1:${la}:${ln}`;
}

export function rankedRouteKey(mode, origin, destination, routeIdsHash, preset, userPrefsHash) {
  const o = `${roundCoord(origin.lat)},${roundCoord(origin.lng)}`;
  const d = `${roundCoord(destination.lat)},${roundCoord(destination.lng)}`;
  return `route:rank:v1:${mode}:${o}:${d}:${routeIdsHash}:${preset}:${userPrefsHash || 'global'}`;
}

export default { routeGeomKey, aqiKey, rankedRouteKey };
