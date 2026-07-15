export const PRESETS = {
  fastest: { eta: 0.7, traffic: 0.2, distance: 0.05, aqi: 0.05 },
  balanced: { eta: 0.35, traffic: 0.2, distance: 0.15, aqi: 0.3 },
  eco: { aqi: 0.5, eta: 0.25, distance: 0.15, traffic: 0.1 },
  lowest_pollution: { aqi: 0.8, eta: 0.15, distance: 0.05 },
};

export default PRESETS;
