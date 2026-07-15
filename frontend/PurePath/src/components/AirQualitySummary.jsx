import theme from "../utils/theme";

const pollutantMeta = {
  aqi: {
    label: "AQI",
    color: "#7fbbb3",
    unit: "",
    safe: 2,
    chartMax: 5,
    maxLabel: "5",
  },
  pm2_5: {
    label: "PM2.5",
    color: "#f87171",
    unit: "μg/m³",
    safe: 15,
    chartMax: 60,
  },
  pm10: {
    label: "PM10",
    color: "#fb923c",
    unit: "μg/m³",
    safe: 45,
    chartMax: 120,
  },
  no2: {
    label: "NO₂",
    color: "#facc15",
    unit: "μg/m³",
    safe: 25,
    chartMax: 100,
  },
  o3: {
    label: "O₃",
    color: "#34d399",
    unit: "μg/m³",
    safe: 100,
    chartMax: 180,
  },
  so2: {
    label: "SO₂",
    color: "#60a5fa",
    unit: "μg/m³",
    safe: 40,
    chartMax: 80,
  },
  co: {
    label: "CO",
    color: "#a78bfa",
    unit: "μg/m³",
    safe: 4000,
    chartMax: 6000,
  },
};

function formatValue(key, value) {
  const meta = pollutantMeta[key];
  if (!meta) return String(value);
  const numericValue = Number(value || 0).toFixed(2);
  if (key === "aqi") {
    return `${numericValue} / ${meta.maxLabel}`;
  }
  return `${numericValue} ${meta.unit}`;
}

function formatSafe(meta, key) {
  if (key === "aqi") {
    return `Safe ≤ ${meta.safe} / ${meta.maxLabel}`;
  }
  return `Safe ≤ ${meta.safe} ${meta.unit}`;
}

function formatMax(meta, key) {
  if (key === "aqi") {
    return `Chart max ${meta.chartMax} / ${meta.maxLabel}`;
  }
  return `Chart max ${meta.chartMax} ${meta.unit}`;
}

function PollutantCard({ pollutantKey, value }) {
  const meta = pollutantMeta[pollutantKey];
  if (!meta || !Number.isFinite(Number(value))) return null;

  const numericValue = Number(value);
  const barPercent = Math.max(
    Math.min((numericValue / meta.chartMax) * 100, 100),
    4,
  );
  const safePercent = Math.min((meta.safe / meta.chartMax) * 100, 100);
  const overLimit = numericValue > meta.safe;

  return (
    <article
      className="rounded-3xl border p-4 transition-all duration-300 hover:-translate-y-0.5 md:min-w-[250px] md:flex-1"
      style={{
        background:
          "linear-gradient(180deg, rgba(24,34,38,0.96), rgba(15,22,25,0.92))",
        borderColor: "rgba(127, 187, 179, 0.16)",
        boxShadow: "0 12px 28px rgba(0,0,0,0.16)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: theme.muted }}
          >
            {meta.label}
          </div>
          <div
            className="mt-2 text-lg font-semibold"
            style={{ color: overLimit ? theme.danger : theme.text }}
          >
            {formatValue(pollutantKey, numericValue)}
          </div>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{
            background: overLimit
              ? "rgba(230,126,128,0.12)"
              : "rgba(127,187,179,0.12)",
            color: overLimit ? theme.danger : theme.primary,
          }}
        >
          {overLimit ? "Above safe" : "Within safe"}
        </span>
      </div>

      <div
        className="mt-4 relative h-2.5 overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${barPercent}%`,
            background: overLimit ? theme.danger : meta.color,
          }}
        />
        <div
          className="absolute inset-y-0 border-r-2 border-dashed"
          style={{
            left: `${safePercent}%`,
            borderColor: "rgba(255,255,255,0.35)",
          }}
        />
      </div>

      <div
        className="mt-4 flex items-center justify-between gap-3 text-xs"
        style={{ color: theme.muted }}
      >
        <span>{formatSafe(meta, pollutantKey)}</span>
        <span>{formatMax(meta, pollutantKey)}</span>
      </div>
    </article>
  );
}

function AirQualitySummary({ routes = [] }) {
  const recommended = routes[0];

  const entries = recommended
    ? [
        ["aqi", recommended.avgAqi ?? recommended.aqi ?? 0],
        ...Object.entries(recommended.pollutants || {}).filter(
          ([key, value]) => pollutantMeta[key] && Number(value) > 0,
        ),
      ]
    : [];

  return (
    <section
      className="rounded-4xl border p-5 md:p-6 transition-all duration-300"
      style={{
        background: "rgba(16, 22, 26, 0.76)",
        borderColor: theme.card,
        boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
      }}
    >
      <div>
        <div
          className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] inline-flex"
          style={{ background: "rgba(127,187,179,0.12)", color: theme.primary }}
        >
          Air quality summary
        </div>
        <h3
          className="mt-4 text-2xl font-semibold"
          style={{ color: theme.text }}
        >
          AQI and pollutant levels
        </h3>
        <p className="mt-2 text-sm leading-6" style={{ color: theme.muted }}>
          Showing the recommended route against safe and chart maximum values.
        </p>
      </div>

      {entries.length ? (
        <div
          className="mt-6 flex flex-col gap-4 md:flex-row md:overflow-x-auto md:pb-2"
          style={{ scrollbarWidth: "thin" }}
        >
          {entries.map(([key, value]) => (
            <PollutantCard key={key} pollutantKey={key} value={value} />
          ))}
        </div>
      ) : (
        <div
          className="mt-6 rounded-3xl border p-5 text-sm"
          style={{ borderColor: theme.card, color: theme.muted }}
        >
          Pollutant data is unavailable for the current route.
        </div>
      )}
    </section>
  );
}

export default AirQualitySummary;
