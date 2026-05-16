import { getLocData } from "../services/route.service.js";

const getRoute = async (req, res) => {
  try {
    const { start, end } = req.body;
    //error handling for missing params 
    console.log("getRoute called with", { start, end });
    const data = await getLocData(start, end);

    const geoJsonCoords = data.features?.[0]?.geometry?.coordinates;
    //error handling for missing or malformed data from ORS
    if (!geoJsonCoords || !Array.isArray(geoJsonCoords) || geoJsonCoords.length === 0) {
      console.error("No route coordinates returned from ORS", { data });
      return res.status(502).json({ message: "no route data returned from upstream service" });
    }

    const leafletCoords = geoJsonCoords.map(([lng, lat]) => [lat, lng]);
    return res.status(200).json({ coordinates: leafletCoords });
  } catch (err) {
    console.error("getRoute error", err);
    return res.status(500).json({ message: "internal server error" });
  }
};

export {
  getRoute,
}

