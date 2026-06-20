import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SavedRoutes from "./pages/SavedRoutes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { getRoute } from "./services/routeService";
import { geoCodedData } from "./services/geoCodeService";
import { saveRoute } from "./services/savedRouteService";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [alternativesAvailable, setAlternativesAvailable] = useState(true);

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceError, setSourceError] = useState("");
  const [destinationError, setDestinationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingRoute, setSavingRoute] = useState(false);
  const [sourceSugg, setSourceSugg] = useState([]);
  const [destinationSugg, setDestinationSugg] = useState([]);

  const navigate = useNavigate();
  const { user } = useAuth();
  const analyzeRoute = async (source, destination, mode = "driving-car") => {
    try {
      setLoading(true);
      let srcCoords, destCoords;
      try {
        srcCoords = await geoCodedData(source);
        setSourceError("");
      } catch (err) {
        setSourceError("Source location not found");
        throw err;
      }

      try {
        destCoords = await geoCodedData(destination);
        setDestinationError("");
      } catch (err) {
        setDestinationError("Destination location not found");
        throw err;
      }
      const data = await getRoute(srcCoords, destCoords, mode);

      if (Array.isArray(data.routes) && data.routes.length) {
        setAlternativesAvailable(data.alternativesAvailable !== false);
        setRoutes(
          data.routes.map((route) => ({
            ...route,
            source,
            destination,
            aqi: route.avgAqi,
          }))
        );
        setActiveRouteIndex(0);
      } else if (data?.coordinates?.length) {
        setRoutes([
          {
            aqi: data.avgAqi,
            exposure: data.exposure,
            color: data.color,
            coordinates: data.coordinates,
            source: source,
            destination: destination,
            distance: data.distance,
            eta: data.eta,
          },
        ]);
        setActiveRouteIndex(0);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAnalyzeButton = async (mode) => {
    await analyzeRoute(source, destination, mode);
  };

  const handleSaveRoute = async (route) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setSavingRoute(true);
      await saveRoute(route);
      alert("Route saved successfully.");
    } catch (error) {
      console.error("Error saving route:", error);
      alert("Unable to save route. Please try again.");
    } finally {
      setSavingRoute(false);
    }
  };

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              routes={routes}
              activeRouteIndex={activeRouteIndex}
              setActiveRouteIndex={setActiveRouteIndex}
              setRoutes={setRoutes}
              source={source}
              setSource={setSource}
              destination={destination}
              setDestination={setDestination}
              handleAnalyzeButton={handleAnalyzeButton}
              handleSaveRoute={handleSaveRoute}
              savingRoute={savingRoute}
              loading={loading}
              sourceSugg={sourceSugg}
              setSourceSugg={setSourceSugg}
              destinationSugg={destinationSugg}
              setDestinationSugg={setDestinationSugg}
              sourceError={sourceError}
              destinationError={destinationError}
              clearSourceError={() => setSourceError("")}
              clearDestinationError={() => setDestinationError("")}
              alternativesAvailable={alternativesAvailable}
              analyzeRoute={analyzeRoute}
            />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedRoutes />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace/>} />
      </Routes>
    </div>
  );
}

export default App;
