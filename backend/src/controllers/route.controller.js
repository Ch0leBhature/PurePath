import { getLocData } from "../services/route.service.js";

const getRoute = async (req,res) => {
  try{
    const {start,end} = req.body 
    const data = await getLocData(start,end);
    
    const geoJsonCoords=data.features?.[0]?.geometry?.coordinates;
    
    const leafletCoords = geoJsonCoords.map( ([lng,lat]) => [lat,lng]);
    res.status(200).json({
      coordinates: leafletCoords
    })
  
  }catch(err){
    console.log(err);
    res.status(500).json({
      message:"failed to fetch route data"
    })
  }
}

export {
  getRoute,
}
