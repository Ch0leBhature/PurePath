import { getLocData } from "../services/route.service.js";
import { getAiqData } from "../services/aqi.service.js";  
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

const getAqi = async (req,res) =>{
  try{
    const {start ,end} = req.body;
    const data = await getLocData(start, end);

    const geoJsonCoords = data.features?.[0]?.geometry?.coordinates;
    const leafletCoords = geoJsonCoords.map(([lng, lat]) => [lat, lng]);
   
    const desiredNumber = 30;
    const step = Math.max(1,Math.ceil(leafletCoords.length/desiredNumber));

    const sampleCoords = leafletCoords.filter((_,item)=>item%step ===0)


    const aqiPromises = sampleCoords.map ( async(coords) => {
        const [lat,lon] = coords
        const aqiData = await getAiqData(lat,lon)
        return aqiData.list[0].main.aqi
      }
    );
    console.log("sampleCoords : ",sampleCoords.length)
    const aqiValues=await Promise.all(aqiPromises); 

    const totalAqi = aqiValues.reduce((sum,value)=>{
      return sum=sum+value;
    },0)
    
    const avgAqi = totalAqi/aqiValues.length


    let exposure=""
    if (avgAqi <= 2) {
      exposure = "Low";
    }
    else if (avgAqi <= 3) {
      exposure = "Moderate";
    }
    else {
      exposure = "High";
    }

    
    return res.status(200).json({coordinates:leafletCoords,avgAqi,exposure})
    


  }catch(err){
    console.log("getAqi error",err)
    return res.status(500).json({message:"internal Server Error"})
  }
}

export {
  getRoute,
  getAqi,
}

