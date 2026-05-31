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

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingRoute, setSavingRoute] = useState(false);
  const [sourceSugg, setSourceSugg] = useState([]);
  const [destinationSugg, setDestinationSugg] = useState([]);

  const navigate = useNavigate();
  const { user } = useAuth();
  const analyzeRoute = async (source, destination) => {
  try {
    setLoading(true);
    const srcCoords = await geoCodedData(source);
    const destCoords = await geoCodedData(destination);
    const data = await getRoute(srcCoords, destCoords);

    if (data?.coordinates?.length) {
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
    }
  } catch (error) {
    console.error("Error fetching routes:", error);
  } finally {
    setLoading(false);
  }
};
  const handleAnalyzeButton = async () => {
    await analyzeRoute(source,destination) 
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
