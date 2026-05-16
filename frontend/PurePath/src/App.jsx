import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Map from "./components/Map";
import RouteCards from "./components/RouteCards";
import AiCard from "./components/AiCard";
import { getRoute } from "./services/routeService";
import {geoCodedData} from "./services/geoCodeService" 
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  
  const [source,setSource] = useState("");
  const [destination,setDestination] = useState("")
  console.log("helo?!") 



  const handleAnalyzeButton = async () =>{
    try{
      const srcCoords = await geoCodedData(source);
      const destCoords = await geoCodedData(destination);
      console.log("src: ",srcCoords);
      console.log("dest: ",destCoords);
      
      const data = await getRoute(srcCoords, destCoords);
      console.log("route response", data);
      const geojsonCoords = data?.coordinates;

        if (geojsonCoords?.length) {
          setRoutes([
            {
              name: "Live Route",
              aqi: 72,
              eta: "22 mins",
              exposure: "Moderate",
              color: "#6abaf2",
              coordinates: geojsonCoords
            },
          ]);
        }
    }
    catch (error) {
      console.error("Error fetching routes:", error);
    }

     
        
  };


  
  return (
    <div className="flex min-h-screen bg-[#141b1e] text-white">
      {/* SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* TOPBAR */}
        <Topbar 
          onMenuClick={() => setSidebarOpen(true)} 
          source={source}
          setSource={setSource}
          destination={destination}
          setDestination={setDestination}
          handleAnalyzeButton={handleAnalyzeButton}
        />

        {/* MAP + ROUTES */}
        <div className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-4 md:gap-6">
          {/* MAP */}
          <Map routes={routes} />

          {/* ROUTE CARDS */}
          <RouteCards routes={routes} />
        </div>

        {/* AI CARD */}
        <AiCard />
      </main>
    </div>
  );
}

export default App;
