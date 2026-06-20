import theme from "./theme";

export function getAqiColor(avgAqi) {
  // avgAqi is expected to be a numeric category-like value where:
  // <=1 Good, <=3 Moderate, <=4 Poor, >4 Very Poor
  const aqi = Number(avgAqi);
  if (!Number.isFinite(aqi)) return "#8B98A0";
  if (aqi <= 1) return theme.aqiGood; // Good
  if (aqi <= 2) return theme.aqiFair; // Fair (teal)
  if (aqi <= 3) return theme.aqiModerate; // Moderate (yellow)
  if (aqi <= 4) return theme.aqiPoor; // Poor (orange)
  return theme.aqiVeryPoor; // Very Poor (red)
}

export function getAqiLabel(avgAqi) {
  const aqi = Number(avgAqi);
  if (!Number.isFinite(aqi)) return "Unknown";
  if (aqi <= 1) return "Good";
  if (aqi <= 2) return "Fair";
  if (aqi <= 3) return "Moderate";
  if (aqi <= 4) return "Poor";
  return "Very Poor";
}
