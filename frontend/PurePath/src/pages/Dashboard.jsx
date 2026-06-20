import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Map from "../components/Map";
import RouteCards from "../components/RouteCards";


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
  activeRouteIndex,
  setActiveRouteIndex,
  setRoutes,
  analyzeRoute,
  sourceError,
  destinationError,
  clearSourceError,
  clearDestinationError,
  alternativesAvailable,
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
          sourceError={sourceError}
          destinationError={destinationError}
          clearSourceError={clearSourceError}
          clearDestinationError={clearDestinationError}
        />

        {/* MAP + ROUTES */}
        <div className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-4 md:gap-6">
          {/* MAP */}
          <Map
          routes={routes}
          activeRouteIndex={activeRouteIndex}
          onRouteSelect={setActiveRouteIndex}
        />

          {/* ROUTE CARDS */}
          <RouteCards
            routes={routes}
            activeRouteIndex={activeRouteIndex}
            onRouteSelect={setActiveRouteIndex}
            onSave={handleSaveRoute}
            savingRoute={savingRoute}
              alternativesAvailable={alternativesAvailable}
          />
        </div>

        
      </main>
    </div>

    
  )
}

export default Dashboard
