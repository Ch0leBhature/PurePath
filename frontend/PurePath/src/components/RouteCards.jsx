import { useMemo, useState } from "react";
import { getAqiColor } from "../utils/aqi";
import theme from "../utils/theme";

const badgePalette = {
  recommended: { bg: "rgba(127, 187, 179, 0.18)", color: theme.primary },
  fastest: { bg: "rgba(96, 165, 250, 0.18)", color: "#93c5fd" },
  clean: { bg: "rgba(52, 211, 153, 0.18)", color: "#6ee7b7" },
  shortest: { bg: "rgba(251, 191, 36, 0.18)", color: "#fcd34d" },
  traffic: { bg: "rgba(192, 132, 252, 0.18)", color: "#d8b4fe" },
  fallback: { bg: "rgba(255, 255, 255, 0.08)", color: theme.text },
};

const pollutantMeta = {
  pm2_5: { label: "PM2.5" },
  pm10: { label: "PM10" },
  no2: { label: "NO₂" },
  o3: { label: "O₃" },
  so2: { label: "SO₂" },
  co: { label: "CO" },
};

function highlightStyle(label) {
  if (label.includes("Fastest")) return badgePalette.fastest;
  if (label.includes("Cleanest")) return badgePalette.clean;
  if (label.includes("Shortest")) return badgePalette.shortest;
  if (label.includes("traffic")) return badgePalette.traffic;
  return badgePalette.fallback;
}

function Metric({ label, value, accent }) {
  return (
    <div
      className="rounded-2xl px-4 py-3 transition duration-200"
      style={{
        background: "rgba(20, 27, 30, 0.72)",
        border: `1px solid ${theme.card}`,
      }}
    >
      <div
        className="text-[11px] uppercase tracking-[0.18em]"
        style={{ color: theme.muted }}
      >
        {label}
      </div>
      <div
        className="mt-1 text-base font-semibold"
        style={{ color: accent || theme.text }}
      >
        {value}
      </div>
    </div>
  );
}

function getTrafficSeverity(multiplier) {
  const value = Number(multiplier || 1);
  if (value <= 1.05) {
    return { label: "Low", color: theme.success };
  }
  if (value <= 1.2) {
    return { label: "Medium", color: theme.aqiModerate };
  }
  return { label: "High", color: theme.danger };
}

function SaveForm({ route, onSave, onCancel, savingRoute }) {
  const [saveSource, setSaveSource] = useState(route.src || route.source || "");
  const [saveDestination, setSaveDestination] = useState(
    route.dest || route.destination || "",
  );

  return (
    <div
      className="mt-5 space-y-3 rounded-3xl p-4 animate-in fade-in slide-in-from-top-1 duration-200"
      style={{
        background: "rgba(20, 27, 30, 0.92)",
        border: `1px solid ${theme.card}`,
      }}
    >
      <p className="text-sm" style={{ color: theme.muted }}>
        Save this ranked route with custom source and destination labels.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={saveSource}
          onChange={(event) => setSaveSource(event.target.value)}
          placeholder="Source"
          className="w-full rounded-2xl px-4 py-3 outline-none transition duration-200 focus:scale-[1.01]"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.card}`,
            color: theme.text,
          }}
        />
        <input
          type="text"
          value={saveDestination}
          onChange={(event) => setSaveDestination(event.target.value)}
          placeholder="Destination"
          className="w-full rounded-2xl px-4 py-3 outline-none transition duration-200 focus:scale-[1.01]"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.card}`,
            color: theme.text,
          }}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
          style={{
            border: `1px solid ${theme.card}`,
            background: "transparent",
            color: theme.text,
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() =>
            onSave({ ...route, src: saveSource, dest: saveDestination })
          }
          disabled={savingRoute || !saveSource || !saveDestination}
          className="flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: theme.primary, color: "#081012" }}
        >
          {savingRoute ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
          ) : null}
          {savingRoute ? "Saving..." : "Save route"}
        </button>
      </div>
    </div>
  );
}

function RouteCard({
  route,
  index,
  isActive,
  isRecommended,
  onRouteSelect,
  onSave,
  savingRoute,
}) {
  const [showSave, setShowSave] = useState(false);
  const trafficSeverity = getTrafficSeverity(route.trafficMultiplier);

  return (
    <article
      onClick={() => onRouteSelect?.(index)}
      className={`group h-full cursor-pointer rounded-[30px] border p-5 transition-all duration-300 ${isActive ? "md:-translate-y-1 md:scale-[1.01]" : "hover:-translate-y-1"}`}
      style={{
        background: isActive
          ? "linear-gradient(180deg, rgba(127,187,179,0.10), rgba(20,27,30,0.92))"
          : "linear-gradient(180deg, rgba(24,34,38,0.92), rgba(15,22,25,0.92))",
        borderColor: isActive ? theme.primary : theme.card,
        boxShadow: isActive
          ? "0 16px 32px rgba(0,0,0,0.24)"
          : "0 10px 24px rgba(0,0,0,0.16)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="h-3.5 w-3.5 rounded-full"
            style={{ background: getAqiColor(route?.avgAqi) }}
          />
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]"
            style={
              isRecommended
                ? {
                    background: badgePalette.recommended.bg,
                    color: badgePalette.recommended.color,
                  }
                : { background: "rgba(255,255,255,0.06)", color: theme.text }
            }
          >
            #{route.rank || index + 1}{" "}
            {isRecommended ? "Recommended" : "Alternative"}
          </span>
        </div>
        <div className="text-right">
          <div
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: theme.muted }}
          >
            AQI
          </div>
          <div
            className="text-lg font-semibold"
            style={{ color: getAqiColor(route?.avgAqi) }}
          >
            {route.avgAqi ?? route.aqi} / 5
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-semibold" style={{ color: theme.text }}>
          {route.source || "Source"} → {route.destination || "Destination"}
        </h3>
        <p className="mt-2 text-sm leading-6" style={{ color: theme.muted }}>
          {route.recommendationReason || route.explanation}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="ETA" value={`${route.eta} min`} />
        <Metric label="Distance" value={route.distance} />
        <Metric
          label="Exposure"
          value={route.exposure}
          accent={getAqiColor(route?.avgAqi)}
        />
        <Metric
          label="Traffic"
          value={trafficSeverity.label}
          accent={trafficSeverity.color}
        />
      </div>

      {!!route.highlights?.length && (
        <div className="mt-5 flex flex-wrap gap-2">
          {route.highlights.map((highlight) => {
            const style = highlightStyle(highlight);
            return (
              <span
                key={highlight}
                className="rounded-full px-3 py-1 text-xs font-medium transition duration-200 group-hover:scale-[1.02]"
                style={{ background: style.bg, color: style.color }}
              >
                {highlight}
              </span>
            );
          })}
        </div>
      )}

      {route.dominantPollutant ? (
        <div
          className="mt-5 rounded-3xl p-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${theme.card}`,
          }}
        >
          <div
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: theme.muted }}
          >
            Dominant pollutant
          </div>
          <div
            className="mt-2 text-base font-semibold"
            style={{ color: theme.text }}
          >
            {pollutantMeta[route.dominantPollutant]?.label ||
              route.dominantPollutant}
          </div>
        </div>
      ) : null}

      {route.explanation && isRecommended ? (
        <div
          className="mt-5 rounded-3xl p-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${theme.card}`,
          }}
        >
          <div
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: theme.muted }}
          >
            Why this route
          </div>
          <p className="mt-2 text-sm leading-6" style={{ color: theme.text }}>
            {route.explanation}
          </p>
        </div>
      ) : null}

      {onSave ? (
        showSave ? (
          <SaveForm
            key={`${route.id || index}-${route.source || ""}-${route.destination || ""}-${route.eta || ""}`}
            route={route}
            onSave={onSave}
            onCancel={() => setShowSave(false)}
            savingRoute={savingRoute}
          />
        ) : (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowSave(true);
            }}
            className="mt-5 rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
            style={{ background: theme.primary, color: "#081012" }}
          >
            Save route
          </button>
        )
      ) : null}
    </article>
  );
}

const RouteCards = ({
  routes,
  activeRouteIndex = 0,
  onRouteSelect,
  onSave,
  savingRoute,
  alternativesAvailable = true,
  analysisMeta = {
    explanation: "",
    presetLabel: "Balanced",
    totalCandidates: 0,
  },
}) => {
  const [showAlternatives, setShowAlternatives] = useState(true);

  const visibleRoutes = useMemo(
    () =>
      routes
        .map((route, index) => ({ route, actualIndex: index }))
        .filter(
          ({ actualIndex }) =>
            actualIndex === 0 || (showAlternatives && alternativesAvailable),
        ),
    [routes, showAlternatives, alternativesAvailable],
  );

  if (!routes.length) {
    return (
      <div
        className="rounded-4xl border p-6 md:p-8 transition-all duration-300"
        style={{
          background: "rgba(16, 22, 26, 0.78)",
          borderColor: theme.card,
        }}
      >
        <div
          className="text-sm uppercase tracking-[0.22em]"
          style={{ color: theme.primary }}
        >
          Ranked route insights
        </div>
        <h3
          className="mt-3 text-2xl font-semibold"
          style={{ color: theme.text }}
        >
          Plan a route to see ranked results
        </h3>
        <p
          className="mt-3 max-w-2xl text-sm leading-6"
          style={{ color: theme.muted }}
        >
          Pick a preset like Fastest, Balanced, Eco, or Clean Air. The backend
          evaluates multiple candidates and returns the best ranked options.
        </p>
      </div>
    );
  }

  return (
    <section
      className="space-y-5 rounded-4xl border p-5 md:p-7 animate-in fade-in slide-in-from-bottom-2 transition-all duration-300"
      style={{
        background: "rgba(16, 22, 26, 0.78)",
        borderColor: "rgba(127, 187, 179, 0.16)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
      }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
              style={{
                background: badgePalette.recommended.bg,
                color: badgePalette.recommended.color,
              }}
            >
              {analysisMeta.presetLabel} preset
            </span>
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: theme.text,
              }}
            >
              {analysisMeta.totalCandidates || routes.length} candidates
              considered
            </span>
          </div>
          <h2
            className="mt-4 text-2xl font-semibold md:text-3xl"
            style={{ color: theme.text }}
          >
            Recommended routes
          </h2>
          <p
            className="mt-2 max-w-3xl text-sm leading-6"
            style={{ color: theme.muted }}
          >
            {analysisMeta.explanation ||
              "These routes are ranked according to your selected preset."}
          </p>
        </div>

        {routes.length > 1 ? (
          alternativesAvailable ? (
            <button
              type="button"
              onClick={() => setShowAlternatives((value) => !value)}
              className="rounded-2xl px-4 py-2.5 text-sm font-medium transition duration-200 hover:-translate-y-0.5"
              style={{
                background: theme.surface,
                border: `1px solid ${theme.card}`,
                color: theme.text,
              }}
            >
              {showAlternatives ? "Hide alternatives" : "Show alternatives"}
            </button>
          ) : (
            <span
              className="rounded-2xl px-4 py-2.5 text-sm"
              style={{
                background: "rgba(230, 152, 117, 0.14)",
                color: theme.warning,
              }}
            >
              Long trip: limited alternatives
            </span>
          )
        ) : null}
      </div>

      <div
        className="rounded-[30px] border p-3 md:p-4"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderColor: "rgba(127, 187, 179, 0.14)",
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:overflow-x-auto md:pb-2">
          {visibleRoutes.map(({ route, actualIndex }, index) => {
            return (
              <div
                key={`${route.id || actualIndex || index}-${route.source || ""}-${route.destination || ""}-${route.eta || ""}-${route.distance || ""}-${route.avgAqi || route.aqi || ""}`}
                className="md:min-w-[560px] md:flex-1"
              >
                <RouteCard
                  route={route}
                  index={actualIndex}
                  isActive={actualIndex === activeRouteIndex}
                  isRecommended={route.rank === 1}
                  onRouteSelect={onRouteSelect}
                  onSave={onSave}
                  savingRoute={savingRoute}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RouteCards;
