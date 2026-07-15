import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Map from "../components/Map";
import RouteCards from "../components/RouteCards";
import AirQualitySummary from "../components/AirQualitySummary";

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
  preset,
  setPreset,
  analysisMeta,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const src = location?.state?.source;
    const dest = location?.state?.destination;

    if (src && dest) {
      setSource(src);
      setDestination(dest);

      const loadRoute = async () => {
        await analyzeRoute(src, dest);
      };

      loadRoute();

      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [
    analyzeRoute,
    location.pathname,
    location.state,
    navigate,
    setDestination,
    setRoutes,
    setSource,
  ]);

  return (
    <div className="flex min-h-screen bg-transparent text-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6 md:space-y-8 animate-in fade-in duration-300">
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
            preset={preset}
            setPreset={setPreset}
          />

          <section className="space-y-5 md:space-y-6">
            <Map
              routes={routes}
              activeRouteIndex={activeRouteIndex}
              onRouteSelect={setActiveRouteIndex}
            />

            <RouteCards
              routes={routes}
              activeRouteIndex={activeRouteIndex}
              onRouteSelect={setActiveRouteIndex}
              onSave={handleSaveRoute}
              savingRoute={savingRoute}
              alternativesAvailable={alternativesAvailable}
              analysisMeta={analysisMeta}
            />

            <AirQualitySummary routes={routes} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
