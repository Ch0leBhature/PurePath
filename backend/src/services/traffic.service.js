import { fetchTomTomFlowSegment } from "../clients/tomtom.client.js";

// Returns a multiplier to apply to rawDuration (e.g., 1.2 means 20% slower)
export async function getTrafficMultiplier(lat, lng) {
  try {
    const data = await fetchTomTomFlowSegment(lat, lng);
    const segment = data?.flowSegmentData;
    if (!segment) return 1;

    const currentTravelTime = Number(segment.currentTravelTime);
    const freeFlowTravelTime = Number(segment.freeFlowTravelTime);
    const currentSpeed = Number(segment.currentSpeed);
    const freeFlowSpeed = Number(segment.freeFlowSpeed);

    const travelTimeRatio =
      Number.isFinite(currentTravelTime) &&
      Number.isFinite(freeFlowTravelTime) &&
      currentTravelTime > 0 &&
      freeFlowTravelTime > 0
        ? currentTravelTime / freeFlowTravelTime
        : null;

    const speedRatio =
      Number.isFinite(currentSpeed) &&
      Number.isFinite(freeFlowSpeed) &&
      currentSpeed > 0 &&
      freeFlowSpeed > 0
        ? freeFlowSpeed / currentSpeed
        : null;

    const ratio =
      travelTimeRatio && Number.isFinite(travelTimeRatio)
        ? travelTimeRatio
        : speedRatio;

    if (!ratio || !Number.isFinite(ratio) || ratio <= 0) return 1;

    return Math.max(0.5, Math.min(ratio, 3));
  } catch (e) {
    // If TomTom is not configured or the lookup fails, treat as no-impact.
    return 1;
  }
}

export default { getTrafficMultiplier };
