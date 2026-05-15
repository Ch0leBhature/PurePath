import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Map from "./components/Map";
import RouteCards from "./components/RouteCards";
import AiCard from "./components/AiCard";
import { getRoute } from "./services/routeService";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  
  const [source,setSource] = useState("");
  const [destination,setDestination] = useState

  useEffect(() => {
    const fetchRoutes = async () => {
      const mockRoutes = [
        {
          name: "Clean Route",
          aqi: 62,
          eta: "28 mins",
          exposure: "Low",
          color: "#8ccf7e",
          coordinates: [
            [22.5726, 88.3639],
            [22.5750, 88.3700],
            [22.5800, 88.3800],
          ],
        },
        {
          name: "Balanced Route",
          aqi: 89,
          eta: "24 mins",
          exposure: "Moderate",
          color: "#e5c76b",
          coordinates: [
            [22.5726, 88.3639],
            [22.5700, 88.3550],
            [22.5680, 88.3480],
          ],
        },
        {
          name: "Fastest Route",
          aqi: 132,
          eta: "19 mins",
          exposure: "High",
          color: "#e67e80",
          coordinates: [
            [22.5726, 88.3639],
            [22.5740, 88.3650],
            [22.5800, 88.3800],
          ],
        },
      ];

      try {
        const data = await getRoute([88.3639, 22.5726], [88.3800,22.5800]);
        const geojsonCoords = data.coordinates

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
        } else {
          setRoutes(mockRoutes);
        }
      } catch (error) {
        console.error("Error fetching routes:", error);
        setRoutes(mockRoutes);
      }
    };

    fetchRoutes();
  }, []);

  // Uncomment and modify when API key is available
  // const fetchRoute = async function(){
  //   const data = await getRoute([88.3639, 22.5726], [88.3800, 22.5800]);
  //   const coords = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
  //   setRouteCoords([coords]);
  // }

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
