import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Map from "../components/Map";
import RouteCards from "../components/RouteCards";
import AiCard from "../components/AiCard";

const Dashboard = ({
  sidebarOpen,
  setSidebarOpen,
  source,
  setSource,
  destination,
  setDestination,
  handleAnalyzeButton,
  handleSaveRoute,
  savingRoute,
  loading,
  sourceSugg,
  setSourceSugg,
  destinationSugg,
  setDestinationSugg,
  routes,
  setRoutes,
  analyzeRoute,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    
    
    const src=location?.state?.source;
    const dest=location?.state?.destination;
    if (src && dest) {
      
      setSource(src);
      setDestination(dest);
      
      const loadRoute = async ()=>{
        await analyzeRoute
        (
          src,
          dest,
        )
      }
      loadRoute();
      
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    
    }
  }, [location.state, setSource, setDestination, setRoutes]);

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
          loading={loading}
          sourceSugg={sourceSugg}
          setSourceSugg={setSourceSugg}
          setDestinationSugg={setDestinationSugg}
          destinationSugg={destinationSugg}
        />

        {/* MAP + ROUTES */}
        <div className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-4 md:gap-6">
          {/* MAP */}
          <Map routes={routes} />

          {/* ROUTE CARDS */}
          <RouteCards routes={routes} onSave={handleSaveRoute} savingRoute={savingRoute} />
        </div>

        {/* AI CARD */}
        <AiCard />
      </main>
    </div>

    
  )
}

export default Dashboard
