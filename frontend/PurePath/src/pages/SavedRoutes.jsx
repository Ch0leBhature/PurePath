import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { getSavedRoutes, deleteRoute } from "../services/savedRouteService";
import apiClient from "../services/apiClient";
import wsClient from "../services/ws.client";
import { getAqiColor, getAqiLabel } from "../utils/aqi";
import theme from "../utils/theme";

function getSavedTimestamp(id) {
  if (!id || typeof id !== "string" || id.length < 8) return null;
  const timestamp = parseInt(id.slice(0, 8), 16) * 1000;
  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
}

function formatSavedTime(id) {
  const date = getSavedTimestamp(id);
  if (!date) return "Saved recently";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatLiveTime(timestamp) {
  if (!timestamp) return "Waiting for update";

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

function formatAqi(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "N/A";
  return `${numeric.toFixed(2)} / 5`;
}

function getMonitorPoints(coordinates = [], desiredPoints = 6) {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return [];

  const step = Math.max(1, Math.floor(coordinates.length / desiredPoints));
  const unique = new Map();

  coordinates.forEach((coord, index) => {
    if (index % step !== 0 && index !== coordinates.length - 1) return;

    const lat = Array.isArray(coord) ? coord[0] : coord?.lat;
    const lng = Array.isArray(coord) ? coord[1] : coord?.lng;
    const la = Number(lat).toFixed(4);
    const ln = Number(lng).toFixed(4);

    if (!Number.isFinite(Number(la)) || !Number.isFinite(Number(ln))) return;

    const channel = `aqi:channel:${la}:${ln}`;
    unique.set(channel, { lat: Number(la), lng: Number(ln), channel });
  });

  return Array.from(unique.values()).slice(0, desiredPoints);
}

function averageAqi(values) {
  const numericValues = values.filter((value) =>
    Number.isFinite(Number(value)),
  );
  if (!numericValues.length) return null;
  return (
    numericValues.reduce((sum, value) => sum + Number(value), 0) /
    numericValues.length
  );
}

const SavedRoutes = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [liveAqiByRoute, setLiveAqiByRoute] = useState({});

  const handleUnauthorized = useCallback(
    async (err) => {
      if (err?.response?.status === 401) {
        await logout();
        navigate("/login");
        return true;
      }
      return false;
    },
    [logout, navigate],
  );

  const fetchRoutes = useCallback(async () => {
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
  }, [handleUnauthorized]);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteRoute(id);
      setRoutes((current) => current.filter((route) => route._id !== id));
      setLiveAqiByRoute((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    } catch (err) {
      if (await handleUnauthorized(err)) return;
      console.error("Failed to delete saved route", err);
      setError("Unable to delete saved route.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchRoutes();
    };

    load();
  }, [fetchRoutes]);

  useEffect(() => {
    let cancelled = false;
    const subscriptions = [];
    const livePointValues = new Map();

    const setupLiveAqi = async () => {
      const nextInitialState = {};

      routes.forEach((route) => {
        const monitorPoints = getMonitorPoints(route.coordinates);
        nextInitialState[route._id] = monitorPoints.length
          ? {
              status: "loading",
              aqi: null,
              updatedAt: null,
              pointCount: monitorPoints.length,
            }
          : {
              status: "snapshot",
              aqi: Number.isFinite(Number(route.aqi))
                ? Number(route.aqi)
                : null,
              updatedAt: null,
              pointCount: 0,
            };
      });

      if (!cancelled) {
        setLiveAqiByRoute(nextInitialState);
      }

      await Promise.all(
        routes.map(async (route) => {
          const monitorPoints = getMonitorPoints(route.coordinates);
          if (!monitorPoints.length) return;

          const pointValues = new Map();
          livePointValues.set(route._id, pointValues);

          await Promise.all(
            monitorPoints.map(async ({ lat, lng, channel }) => {
              try {
                const response = await apiClient.post("/api/aqi/current", {
                  lat,
                  lng,
                });
                const currentAqi = Number(response?.data?.aqi);
                if (Number.isFinite(currentAqi)) {
                  pointValues.set(channel, currentAqi);
                }
              } catch (requestError) {
                console.warn(
                  "Unable to load current AQI for saved route",
                  requestError,
                );
              }

              apiClient.post("/api/aqi/monitor", { lat, lng }).catch(() => {});

              const handler = (msg) => {
                try {
                  const parsed =
                    typeof msg === "string" ? JSON.parse(msg) : msg;
                  const nextAqi = Number(parsed?.newAqi ?? parsed?.aqi);
                  if (!Number.isFinite(nextAqi)) return;

                  pointValues.set(channel, nextAqi);
                  const average = averageAqi(Array.from(pointValues.values()));

                  if (!cancelled) {
                    setLiveAqiByRoute((current) => ({
                      ...current,
                      [route._id]: {
                        status: "live",
                        aqi: average,
                        updatedAt: parsed?.ts || Date.now(),
                        pointCount: monitorPoints.length,
                      },
                    }));
                  }
                } catch (parseError) {
                  console.warn(parseError);
                }
              };

              wsClient.subscribeChannel(channel, handler);
              subscriptions.push({ channel, handler });
            }),
          );

          const initialAverage = averageAqi(Array.from(pointValues.values()));
          if (!cancelled) {
            setLiveAqiByRoute((current) => ({
              ...current,
              [route._id]: {
                status: initialAverage != null ? "live" : "watching",
                aqi: initialAverage,
                updatedAt: initialAverage != null ? Date.now() : null,
                pointCount: monitorPoints.length,
              },
            }));
          }
        }),
      );
    };

    setupLiveAqi();

    return () => {
      cancelled = true;
      subscriptions.forEach(({ channel, handler }) => {
        wsClient.unsubscribeChannel(channel, handler);
      });
    };
  }, [routes]);

  const summary = useMemo(() => {
    const numericAqis = routes
      .map((route) => Number(route.aqi))
      .filter((value) => Number.isFinite(value));

    const avgAqi = numericAqis.length
      ? numericAqis.reduce((sum, value) => sum + value, 0) / numericAqis.length
      : null;

    const healthiestRoute = routes.reduce((best, route) => {
      const currentAqi = Number(route.aqi);
      const bestAqi = Number(best?.aqi);
      if (!Number.isFinite(currentAqi)) return best;
      if (!best || !Number.isFinite(bestAqi) || currentAqi < bestAqi)
        return route;
      return best;
    }, null);

    const realtimeEnabled = routes.filter(
      (route) => getMonitorPoints(route.coordinates).length > 0,
    ).length;

    return {
      totalRoutes: routes.length,
      avgAqi,
      healthiestRoute,
      realtimeEnabled,
    };
  }, [routes]);

  return (
    <div className="flex min-h-screen bg-transparent text-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-300">
          <section
            className="overflow-hidden rounded-4xl border px-6 py-6 md:px-8 md:py-8"
            style={{
              background:
                "linear-gradient(145deg, rgba(24,34,38,0.96), rgba(16,22,26,0.92))",
              borderColor: theme.card,
              boxShadow: "0 18px 44px rgba(0,0,0,0.22)",
            }}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="text-2xl md:hidden"
                  style={{ color: theme.text }}
                >
                  ☰
                </button>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                      style={{
                        background: "rgba(127,187,179,0.12)",
                        color: theme.primary,
                      }}
                    >
                      Saved journeys
                    </span>
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        background: "rgba(96,165,250,0.12)",
                        color: "#93c5fd",
                      }}
                    >
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-current" />
                      Live AQI enabled for saved routes with geometry
                    </span>
                  </div>
                  <h1
                    className="mt-4 text-3xl font-bold md:text-5xl"
                    style={{ color: theme.text }}
                  >
                    Your saved routes now track live AQI.
                  </h1>
                  
                </div>
              </div>

              <button
                type="button"
                onClick={fetchRoutes}
                className="rounded-3xl px-5 py-3 font-semibold transition duration-200 hover:-translate-y-0.5"
                style={{ background: theme.primary, color: "#081012" }}
              >
                Refresh routes
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {[
                {
                  label: "Saved routes",
                  value: summary.totalRoutes,
                  note: "Personal route shortcuts ready to reopen",
                },
                
                {
                  label: "Cleanest saved route",
                  value: summary.healthiestRoute
                    ? `${summary.healthiestRoute.source} → ${summary.healthiestRoute.destination}`
                    : "No data yet",
                  note: summary.healthiestRoute
                    ? `${getAqiLabel(summary.healthiestRoute.aqi)} air snapshot`
                    : "Save a route to surface it here",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border px-5 py-4"
                  style={{
                    background: "rgba(20,27,30,0.72)",
                    borderColor: theme.card,
                  }}
                >
                  <div
                    className="text-[11px] uppercase tracking-[0.18em]"
                    style={{ color: theme.muted }}
                  >
                    {item.label}
                  </div>
                  <div
                    className="mt-2 text-lg font-semibold md:text-xl"
                    style={{ color: theme.text }}
                  >
                    {item.value}
                  </div>
                  <p
                    className="mt-2 text-sm leading-6"
                    style={{ color: theme.muted }}
                  >
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {loading ? (
            <div
              className="rounded-4xl border p-10 text-center"
              style={{
                background: "rgba(16, 22, 26, 0.72)",
                borderColor: theme.card,
                color: theme.muted,
              }}
            >
              Loading saved routes...
            </div>
          ) : error ? (
            <div
              className="rounded-4xl border p-10 text-center"
              style={{
                background: "rgba(230,126,128,0.08)",
                borderColor: theme.danger,
                color: "#fecaca",
              }}
            >
              {error}
            </div>
          ) : routes.length === 0 ? (
            <div
              className="rounded-4xl border p-12 text-center"
              style={{
                background: "rgba(16, 22, 26, 0.72)",
                borderColor: theme.card,
              }}
            >
              <div className="mb-4 text-6xl">🗺️</div>
              <h3
                className="text-2xl font-semibold"
                style={{ color: theme.text }}
              >
                No saved routes yet
              </h3>
              
            <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-6 rounded-3xl px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                style={{ background: theme.primary, color: "#081012" }}
              >
                Explore routes on dashboard
              </button>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {routes.map((route) => {
                const snapshotAqi = Number(route.aqi);
                const snapshotColor = getAqiColor(snapshotAqi);
                const snapshotLabel = getAqiLabel(snapshotAqi);
                const liveState = liveAqiByRoute[route._id] || {
                  status: "snapshot",
                  aqi: Number.isFinite(snapshotAqi) ? snapshotAqi : null,
                  updatedAt: null,
                  pointCount: 0,
                };
                const effectiveLiveAqi = Number.isFinite(Number(liveState.aqi))
                  ? Number(liveState.aqi)
                  : null;
                const liveColor = getAqiColor(effectiveLiveAqi);
                const liveLabel = getAqiLabel(effectiveLiveAqi);
                const hasRealtimeGeometry =
                  getMonitorPoints(route.coordinates).length > 0;

                return (
                  <article
                    key={route._id}
                    className="rounded-4xl border p-6 transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(24,34,38,0.96), rgba(15,22,25,0.94))",
                      borderColor: theme.card,
                      boxShadow: "0 12px 28px rgba(0,0,0,0.16)",
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                            style={{
                              background: "rgba(127,187,179,0.12)",
                              color: theme.primary,
                            }}
                          >
                            Saved route
                          </span>
                          <span
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                            style={{
                              background: hasRealtimeGeometry
                                ? "rgba(96,165,250,0.12)"
                                : "rgba(255,255,255,0.08)",
                              color: hasRealtimeGeometry
                                ? "#93c5fd"
                                : theme.muted,
                            }}
                          >
                            {hasRealtimeGeometry ? (
                              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-current" />
                            ) : null}
                            {hasRealtimeGeometry
                              ? "Realtime AQI active"
                              : "Snapshot only — resave route for live AQI"}
                          </span>
                        </div>
                        <h2
                          className="mt-3 text-2xl font-semibold"
                          style={{ color: theme.text }}
                        >
                          {route.source} → {route.destination}
                        </h2>
                        <p
                          className="mt-2 text-sm"
                          style={{ color: theme.muted }}
                        >
                          {formatSavedTime(route._id)}
                        </p>
                      </div>

                      <span
                        className="rounded-full px-3 py-1 text-sm font-medium"
                        style={{
                          background: `${liveColor}22`,
                          color: liveColor,
                          border: `1px solid ${liveColor}44`,
                        }}
                      >
                        {route.exposure || liveLabel}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                      <div
                        className="rounded-3xl border p-5"
                        style={{
                          background: "rgba(20,27,30,0.76)",
                          borderColor: `${snapshotColor}44`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div
                              className="text-[11px] uppercase tracking-[0.18em]"
                              style={{ color: theme.muted }}
                            >
                              Saved AQI snapshot
                            </div>
                            <div
                              className="mt-2 text-3xl font-semibold"
                              style={{ color: snapshotColor }}
                            >
                              {formatAqi(route.aqi)}
                            </div>
                          </div>
                          <span
                            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
                            style={{
                              background: `${snapshotColor}1a`,
                              color: snapshotColor,
                            }}
                          >
                            {snapshotLabel}
                          </span>
                        </div>

                        <div
                          className="mt-4 h-2.5 overflow-hidden rounded-full"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(
                                8,
                                Math.min(
                                  (Number(route.aqi || 0) / 5) * 100,
                                  100,
                                ),
                              )}%`,
                              background: snapshotColor,
                            }}
                          />
                        </div>

                        <p
                          className="mt-4 text-sm leading-6"
                          style={{ color: theme.muted }}
                        >
                          This is the AQI value stored when you originally saved
                          the route.
                        </p>
                      </div>

                      <div
                        className="rounded-3xl border p-5"
                        style={{
                          background: "rgba(20,27,30,0.76)",
                          borderColor: `${liveColor}44`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div
                              className="text-[11px] uppercase tracking-[0.18em]"
                              style={{ color: theme.muted }}
                            >
                              Live AQI
                            </div>
                            <div
                              className="mt-2 text-3xl font-semibold"
                              style={{ color: liveColor }}
                            >
                              {effectiveLiveAqi != null
                                ? formatAqi(effectiveLiveAqi)
                                : "--"}
                            </div>
                          </div>
                          <span
                            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
                            style={{
                              background: `${liveColor}1a`,
                              color: liveColor,
                            }}
                          >
                            {hasRealtimeGeometry
                              ? effectiveLiveAqi != null
                                ? liveLabel
                                : liveState.status === "loading"
                                  ? "Loading"
                                  : "Watching"
                              : "Unavailable"}
                          </span>
                        </div>

                        <div
                          className="mt-4 h-2.5 overflow-hidden rounded-full"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(
                                8,
                                Math.min(
                                  (Number(effectiveLiveAqi || 0) / 5) * 100,
                                  100,
                                ),
                              )}%`,
                              background: liveColor,
                            }}
                          />
                        </div>

                        <p
                          className="mt-4 text-sm leading-6"
                          style={{ color: theme.muted }}
                        >
                          {hasRealtimeGeometry
                            ? effectiveLiveAqi != null
                              ? `Tracking ${liveState.pointCount} sampled route points. Last refresh at ${formatLiveTime(liveState.updatedAt)}.`
                              : "Connecting live AQI monitors for this saved route."
                            : "This older saved route has no stored coordinates yet. Open it on the dashboard and save it again to enable live AQI here."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {[
                        {
                          label: "Distance",
                          value: route.distance || "Unknown",
                        },
                        {
                          label: "ETA",
                          value: route.eta ? `${route.eta} min` : "Unknown",
                        },
                        {
                          label: "Live status",
                          value: hasRealtimeGeometry
                            ? effectiveLiveAqi != null
                              ? "Live AQI active"
                              : "Monitoring"
                            : "Snapshot only",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl px-4 py-3"
                          style={{
                            background: "rgba(20, 27, 30, 0.75)",
                            border: `1px solid ${theme.card}`,
                          }}
                        >
                          <div
                            className="text-[11px] uppercase tracking-[0.18em]"
                            style={{ color: theme.muted }}
                          >
                            {item.label}
                          </div>
                          <div
                            className="mt-1 text-lg font-semibold"
                            style={{ color: theme.text }}
                          >
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/", {
                            state: {
                              source: route.source,
                              destination: route.destination,
                            },
                          })
                        }
                        className="rounded-3xl px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                        style={{
                          border: `1px solid ${theme.primary}`,
                          background: theme.primary,
                          color: "#081012",
                        }}
                      >
                        Open live dashboard
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(route._id)}
                        disabled={deletingId === route._id}
                        className="rounded-3xl px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                        style={{ background: theme.danger, color: "white" }}
                      >
                        {deletingId === route._id
                          ? "Deleting..."
                          : "Delete route"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedRoutes;
