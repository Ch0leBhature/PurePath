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
  const [preset, setPreset] = useState("balanced");
  const [analysisMeta, setAnalysisMeta] = useState({
    explanation: "",
    presetLabel: "Balanced",
    totalCandidates: 0,
  });

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceError, setSourceError] = useState("");
  const [destinationError, setDestinationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingRoute, setSavingRoute] = useState(false);
  const [sourceSugg, setSourceSugg] = useState([]);
  const [destinationSugg, setDestinationSugg] = useState([]);
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

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
      const data = await getRoute(srcCoords, destCoords, mode, preset);

      if (Array.isArray(data.routes) && data.routes.length) {
        setAlternativesAvailable(data.alternativesAvailable !== false);
        setAnalysisMeta({
          explanation: data.explanation || "",
          presetLabel: data.presetLabel || "Balanced",
          totalCandidates: data.totalCandidates || data.routes.length,
        });
        setRoutes(
          data.routes.map((route) => ({
            ...route,
            source,
            destination,
            aqi: route.avgAqi,
            analysisExplanation: data.explanation || "",
            presetLabel: data.presetLabel || route.presetLabel || "Balanced",
          })),
        );
        setActiveRouteIndex(0);
      } else if (data?.coordinates?.length) {
        setAnalysisMeta({
          explanation: "",
          presetLabel: "Balanced",
          totalCandidates: 1,
        });
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
            rank: 1,
            presetLabel: "Balanced",
          },
        ]);
        setActiveRouteIndex(0);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      const backendMessage = error?.response?.data?.message;
      const upstreamStatus = error?.response?.data?.upstreamStatus;
      const details = upstreamStatus ? ` (upstream ${upstreamStatus})` : "";
      showNotification(
        backendMessage
          ? `${backendMessage}${details}`
          : "Unable to analyze route. Please try again.",
        "error",
      );
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
      showNotification("Route saved successfully!", "success");
    } catch (error) {
      console.error("Error saving route:", error);
      showNotification("Unable to save route. Please try again.", "error");
    } finally {
      setSavingRoute(false);
    }
  };

  return (
    <div className="min-h-screen">
      {notification && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-xl text-white font-medium shadow-lg z-50 ${
            notification.type === "success"
              ? "bg-green-600"
              : notification.type === "error"
                ? "bg-red-600"
                : "bg-blue-600"
          }`}
        >
          {notification.message}
        </div>
      )}
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
              preset={preset}
              setPreset={setPreset}
              analysisMeta={analysisMeta}
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
