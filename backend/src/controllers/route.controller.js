import { getLocData } from "../services/route.service.js";
import { getAiqData } from "../services/aqi.service.js";  
const getRoute = async (req, res) => {
  try {
    const { start, end, mode } = req.body;

    if (!Array.isArray(start) || start.length !== 2 || !Array.isArray(end) || end.length !== 2) {
      return res.status(400).json({ message: "Invalid route coordinates" });
    }

    console.log("getRoute called with", { start, end, mode });

    const profile = mode || "driving-car";
    const data = await getLocData(start, end, profile);

    const geoJsonCoords = data.features?.[0]?.geometry?.coordinates;
    
    //error handling for missing or malformed data from ORS
    if (!geoJsonCoords || !Array.isArray(geoJsonCoords) || geoJsonCoords.length === 0) {
      console.error("No route coordinates returned from ORS", { data });
      return res.status(502).json({ message: "no route data returned from upstream service" });
    }

    
    const leafletCoords = geoJsonCoords.map(([lng, lat]) => [lat, lng]);

    console.log("req.body: ", req.body)

    return res.status(200).json({ coordinates: leafletCoords });
  




  } catch (err) {
    
    console.error("getRoute error", err);
    
    return res.status(500).json({ message: "internal server error" });
  }
};

const getAqi = async (req,res) =>{
  try{
    const {start ,end, mode} = req.body;
    if (!Array.isArray(start) || start.length !== 2 || !Array.isArray(end) || end.length !== 2) {
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
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const straightDistance = R * c;

    // For long journeys (>100km) only request a single route from ORS
    const alternativesAllowed = straightDistance <= 100000; // 100 km
    const targetCount = alternativesAllowed ? 3 : 1;
    const data = await getLocData(start, end, profile, targetCount);

    const features = Array.isArray(data.features) ? data.features : [];
    if (features.length === 0) {
      return res.status(502).json({ message: "no route data returned from upstream service" });
    }

    const routes = await Promise.all(
      features.map(async (feature) => {
        const geoJsonCoords = feature.geometry?.coordinates;
        if (!Array.isArray(geoJsonCoords) || geoJsonCoords.length === 0) {
          throw new Error("Invalid feature geometry");
        }

        const leafletCoords = geoJsonCoords.map(([lng, lat]) => [lat, lng]);
        const desiredNumber = 30;
        const step = Math.max(1, Math.ceil(leafletCoords.length / desiredNumber));

        const sampleCoords = leafletCoords.filter((_, item) => item % step === 0);
        const aqiPromises = sampleCoords.map(async (coords) => {
          const [lat, lon] = coords;
          const aqiData = await getAiqData(lat, lon);
          return aqiData.list[0].main.aqi;
        });

        const aqiValues = await Promise.all(aqiPromises);
        const totalAqi = aqiValues.reduce((sum, value) => sum + value, 0);
        const avgAqi = (aqiValues.length ? totalAqi / aqiValues.length : 0).toFixed(2);

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
        const duration = segment.duration || 0;
        const distanceVal = segment.distance || 0;
        const minutes = Math.ceil(duration / 60) ;
        const formattedDistance = distanceVal < 1000 ? `${Math.round(distanceVal)} m` : `${(distanceVal / 1000).toFixed(2)} km`;

        return {
          coordinates: leafletCoords,
          distance: formattedDistance,
          eta: minutes,
          avgAqi,
          exposure,
          color,
        };
      })
    );

    return res.status(200).json({ routes, alternativesAvailable: alternativesAllowed });
  } catch (err) {
    console.error("getAqi error", err);
    return res.status(500).json({ message: "internal server error" });
  }
};

export {
  getRoute,
  getAqi,
}

