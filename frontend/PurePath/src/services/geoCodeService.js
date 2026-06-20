import axios from "axios"
const geoCodedData = async(place) =>{
  try{
    if (!place || !place.trim()) {
      throw new Error("Invalid place for geocoding");
    }
    const response= await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`)
    const data = response.data
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`No geocoding result for ${place}`);
    }
    return[
      parseFloat(data[0].lon),
      parseFloat(data[0].lat)
    ]
  }catch(err){
    console.log("error in reverse geocoding",err)
    throw err;
  }
}

export {geoCodedData}
