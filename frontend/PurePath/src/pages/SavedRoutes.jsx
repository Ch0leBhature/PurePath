import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getSavedRoutes, deleteRoute } from "../services/savedRouteService";

const SavedRoutes = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleUnauthorized = async (err) => {
    if (err?.response?.status === 401) {
      await logout();
      navigate("/login");
      return true;
    }
    return false;
  };

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const savedRoutes = await getSavedRoutes();
      setRoutes(savedRoutes);
    } catch (err) {
      if (await handleUnauthorized(err)) return;
      console.error("Failed to load saved routes", err);
      setError("Unable to load saved routes.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteRoute(id);
      setRoutes((current) => current.filter((route) => route._id !== id));
    } catch (err) {
      if (await handleUnauthorized(err)) return;
      console.error("Failed to delete saved route", err);
      setError("Unable to delete saved route.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);
  
  return (
    <div className="min-h-screen bg-[#141b1e] text-white px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Saved Routes</h1>
            <p className="text-gray-400 mt-2">Viewing saved routes for the current user. Select any route to open it on the dashboard map.</p>
          </div>
          <button
            type="button"
            onClick={fetchRoutes}
            className="rounded-2xl bg-[#8ccf7e] px-5 py-3 text-black font-semibold hover:bg-[#7bc56d] transition"
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="rounded-3xl border border-[#2d3437] bg-[#1b2225] p-8 text-center text-gray-300">
            Loading saved routes...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-[#2d3437] bg-[#1b2225] p-8 text-center text-red-400">
            {error}
          </div>
        ) : routes.length === 0 ? (
          <div className="rounded-3xl border border-[#2d3437] bg-[#1b2225] p-8 text-center text-gray-300">
            No saved routes yet. Save one from the dashboard to see it here.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {routes.map((route) => (
              <article key={route._id} className="rounded-3xl border border-[#2d3437] bg-[#1b2225] p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{route.source} → {route.destination}</h2>
                    <p className="text-gray-400 text-sm mt-2">AQI: {route.aqi ?? "N/A"}</p>
                  </div>
                  <span className="rounded-full bg-[#232a2d] px-3 py-1 text-sm text-gray-300">{route.exposure || "Unknown"}</span>
                </div>

                <div className="space-y-3 text-gray-300 text-sm">
                  <p>
                    <strong>Distance:</strong> {route.distance || "Unknown"}
                  </p>
                  <p>
                    <strong>ETA:</strong> {route.eta ? `${route.eta} mins` : "Unknown"}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => navigate("/", { state: { source:route.source, destination:route.destination } })}
                    className="rounded-2xl border border-[#8ccf7e] bg-transparent px-4 py-3 text-sm font-semibold text-[#8ccf7e] hover:bg-[#8ccf7e] hover:text-black transition"
                  >
                    View on Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(route._id)}
                    disabled={deletingId === route._id}
                    className="rounded-2xl bg-[#ff4d4f] px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
                  >
                    {deletingId === route._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRoutes;

