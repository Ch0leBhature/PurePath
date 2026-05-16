import axios from "axios"
const geoCodedData = async(place) =>{
  try{
    const response= await axios.get(`https://nominatim.openstreetmap.org/search?q=${place}&format=json&limit=1`)
    const data = response.data
    console.log(response)
    return[
      parseFloat(data[0].lon),
      parseFloat(data[0].lat)
    ]
  }catch(err){
    console.log("error in reverse geocoding",err)
  }
}

export {geoCodedData}
