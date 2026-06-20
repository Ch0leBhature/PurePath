import { useState } from "react";
import { getAqiColor } from "../utils/aqi";
import theme from "../utils/theme";

const RouteCards = ({ routes, activeRouteIndex = 0, onRouteSelect, onSave, savingRoute, alternativesAvailable = true }) => {
  const [activeSaveIndex, setActiveSaveIndex] = useState(null);
  const [saveSource, setSaveSource] = useState("");
  const [saveDestination, setSaveDestination] = useState("");
  const [showAlternatives, setShowAlternatives] = useState(true);

  return (
    <div className="flex flex-col gap-4">

      {routes.length > 0 && (
        <>
          {/* Recommended route (index 0) */}
          {routes[0] && (
            (() => {
              const route = routes[0];
              const index = 0;
              const isActive = index === activeRouteIndex;
              return (
                <div
                  key={index}
                  onClick={() => onRouteSelect?.(index)}
                  className={`cursor-pointer rounded-2xl p-4 md:p-6 transition duration-150 transform ${isActive ? "shadow-md scale-[1.01]" : "hover:translate-y-[-2px]"}`}
                    style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.4)", background: theme.surface, border: `1px solid ${isActive ? theme.primary : theme.card}` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-[14px] h-[14px] rounded-full" style={{ background: getAqiColor(route?.avgAqi) }} />
                    <span className="rounded-full px-2 py-1 text-xs" style={{ background: theme.surface, color: theme.primary }}>⭐ Recommended</span>
                  </div>

                  <h3 className="text-lg md:text-xl font-semibold mb-4" style={{ color: theme.text }}>{route.source || "Source"} → {route.destination || "Destination"}</h3>

                  <p className="mb-2 text-sm md:text-base" style={{ color: theme.muted }}>Open Weather Index: {route.aqi} / 5</p>
                  <p className="mb-2 text-sm md:text-base" style={{ color: theme.muted }}>ETA: {route.eta} minutes</p>
                  <p className="mb-2 text-sm md:text-base" style={{ color: theme.muted }}>DISTANCE: {route.distance}</p>
                  <span className="text-sm md:text-base" style={{ color: theme.muted }}>Exposure: {route.exposure}</span>

                  {onSave && activeSaveIndex === index ? (
                    <div className="mt-5 space-y-3 rounded-3xl p-4" style={{ border: `1px solid ${theme.card}`, background: '#181f22' }}>
                      <p className="text-sm" style={{ color: theme.muted }}>Save this route with custom source/destination.</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input type="text" value={saveSource} onChange={(e) => setSaveSource(e.target.value)} placeholder="Source" className="w-full rounded-2xl px-4 py-3 outline-none" style={{ background: theme.surface, border: `1px solid ${theme.card}`, color: theme.text }} />
                        <input type="text" value={saveDestination} onChange={(e) => setSaveDestination(e.target.value)} placeholder="Destination" className="w-full rounded-2xl px-4 py-3 outline-none" style={{ background: theme.surface, border: `1px solid ${theme.card}`, color: theme.text }} />
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button type="button" onClick={() => setActiveSaveIndex(null)} className="rounded-2xl px-5 py-3 text-sm font-semibold transition duration-150" style={{ border: `1px solid ${theme.card}`, background: 'transparent', color: theme.text }}>Cancel</button>
                        <button type="button" onClick={() => onSave({ ...route, src: saveSource, dest: saveDestination })} disabled={savingRoute || !saveSource || !saveDestination} className="rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2" style={{ background: theme.primary, color: '#000' }}>{savingRoute ? <span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"/> : null}{savingRoute ? "Saving..." : "Save Route"}</button>
                      </div>
                    </div>
                  ) : onSave ? (
                    <button type="button" onClick={() => { setActiveSaveIndex(index); setSaveSource(route.src || route.source || ""); setSaveDestination(route.dest || route.destination || ""); }} className="mt-5 flex rounded-2xl bg-[#7fbbb3] px-5 py-3 text-sm font-semibold text-black transition duration-150">Save route with source & destination</button>
                  ) : null}
                </div>
              );
            })()
          )}

          {/* Alternatives (indices 1..) */}
          {routes.length > 1 && alternativesAvailable && showAlternatives && (
            <div className="flex flex-col gap-3">
              {routes.slice(1).map((route, idx) => {
                const index = idx + 1;
                const isActive = index === activeRouteIndex;
                return (
                  <div key={index} onClick={() => onRouteSelect?.(index)} className={`cursor-pointer rounded-2xl p-3 transition duration-150 ${isActive ? "" : "hover:translate-y-[-1px]"}`} style={{ background: theme.surface, border: `1px solid ${isActive ? theme.primary : theme.card}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-[12px] h-[12px] rounded-full" style={{ background: getAqiColor(route?.avgAqi) }} />
                      <span className="text-sm" style={{ color: theme.text }}>ETA: {route.eta} minutes • {route.distance}</span>
                    </div>
                    <div className="text-sm" style={{ color: theme.text }}>Exposure: {route.exposure}</div>
                    <div className="text-sm" style={{ color: theme.muted }}>Open Weather Index: {route.aqi} / 5</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Alternatives toggle */}
          {routes.length > 1 && (
            <div className="mt-2 flex items-center justify-between">
              {alternativesAvailable ? (
                <button
                  type="button"
                  onClick={() => setShowAlternatives((s) => !s)}
                  className="text-sm px-3 py-2 rounded-xl transition duration-150"
                  style={{ color: theme.text, background: theme.background, border: `1px solid ${theme.card}` }}
                >
                  {showAlternatives ? "Hide alternatives" : "Show alternatives"}
                </button>
              ) : (
                <div className="text-sm px-3 py-2 rounded-xl" style={{ color: theme.warning, background: theme.background, border: `1px solid ${theme.card}` }}>
                  Alternative routes unavailable for journeys over 100 km
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  )
}

export default RouteCards
