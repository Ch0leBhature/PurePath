import { useState, useEffect } from "react";
import theme from "../utils/theme";
import { getSuggestions } from "../services/autoCompleteService";

const PRESETS = [
  {
    key: "fastest",
    label: "Fastest",
    icon: "⚡",
    note: "Prioritize ETA first",
  },
  {
    key: "balanced",
    label: "Balanced",
    icon: "⚖️",
    note: "Mix time, traffic, and AQI",
  },
  {
    key: "eco",
    label: "Eco",
    icon: "🌱",
    note: "Cleaner routes with fair ETA",
  },
  {
    key: "lowest_pollution",
    label: "Clean Air",
    icon: "💚",
    note: "Minimize pollution exposure",
  },
];

const Topbar = ({
  onMenuClick,
  source,
  setSource,
  destination,
  setDestination,
  handleAnalyzeButton,
  loading,
  setSourceSugg,
  setDestinationSugg,
  sourceSugg,
  destinationSugg,
  sourceError,
  destinationError,
  clearSourceError,
  clearDestinationError,
  preset,
  setPreset,
}) => {
  const [activeField, setActiveField] = useState("");
  const [transportMode, setTransportMode] = useState("driving-car");

  const activePreset =
    PRESETS.find((item) => item.key === preset) || PRESETS[1];
  const getSuggestionLabel = (place) =>
    place?.properties?.label || place?.text || "";

  const fetchSuggestions = async (query, setSuggestions) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const result = await getSuggestions(query);
    setSuggestions(result);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      fetchSuggestions(source, setSourceSugg);
    }, 350);

    return () => clearTimeout(timer);
  }, [source, setSourceSugg]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      fetchSuggestions(destination, setDestinationSugg);
    }, 350);

    return () => clearTimeout(timer);
  }, [destination, setDestinationSugg]);

  const handleSourceChange = (event) => {
    const value = event.target.value;
    setSource(value);
    if (value && clearSourceError) clearSourceError();
  };

  const handleDestinationChange = (event) => {
    const value = event.target.value;
    setDestination(value);
    if (value && clearDestinationError) clearDestinationError();
  };

  const selectSuggestion = (place, setter, clearSuggestions) => {
    setter(getSuggestionLabel(place));
    clearSuggestions([]);
  };

  const renderSuggestions = (suggestions, type) => {
    if (!suggestions.length) return null;

    const isActive = activeField === type;
    const setter = type === "source" ? setSource : setDestination;
    const clearSuggestions =
      type === "source" ? setSourceSugg : setDestinationSugg;

    return isActive ? (
      <div
        className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[160] max-h-64 overflow-auto rounded-[24px] border shadow-2xl"
        style={{
          background: "rgba(20,27,30,0.99)",
          borderColor: theme.card,
          boxShadow: "0 24px 50px rgba(0,0,0,0.36)",
        }}
      >
        {suggestions.map((place, index) => (
          <button
            type="button"
            key={`${getSuggestionLabel(place)}-${index}`}
            onMouseDown={() =>
              selectSuggestion(place, setter, clearSuggestions)
            }
            className="w-full px-4 py-3 text-left transition"
            style={{ color: theme.text }}
          >
            {getSuggestionLabel(place)}
          </button>
        ))}
      </div>
    ) : null;
  };

  return (
    <div className="mb-6 md:mb-8">
      <div className="mb-4 flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          className="text-2xl"
          style={{ color: theme.text }}
        >
          ☰
        </button>
      </div>

      <section
        className="relative overflow-visible rounded-[32px] border px-5 py-5 md:px-7 md:py-7"
        style={{
          background:
            "linear-gradient(145deg, rgba(24,34,38,0.96), rgba(16,22,26,0.92))",
          borderColor: theme.card,
          boxShadow: "0 18px 44px rgba(0,0,0,0.22)",
        }}
      >
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]"
              style={{
                background: "rgba(127,187,179,0.12)",
                color: theme.primary,
              }}
            >
              Preset-aware routing engine
            </div>
            <h1
              className="mt-4 text-3xl font-bold md:text-5xl"
              style={{ color: theme.text }}
            >
              Find the best route for how you want to travel.
            </h1>
            <p
              className="mt-3 max-w-xl text-sm leading-7 md:text-base"
              style={{ color: theme.muted }}
            >
              PurePath compares multiple route candidates, ranks them by your
              selected preset, and shows the strongest matches first.
            </p>
          </div>

          <div
            className="rounded-[24px] border px-4 py-4 md:px-5"
            style={{
              background: "rgba(20,27,30,0.72)",
              borderColor: theme.card,
            }}
          >
            <div
              className="text-xs uppercase tracking-[0.18em]"
              style={{ color: theme.muted }}
            >
              Active preset
            </div>
            <div
              className="mt-2 text-xl font-semibold"
              style={{ color: theme.text }}
            >
              {activePreset.icon} {activePreset.label}
            </div>
            <p className="mt-1 text-sm" style={{ color: theme.muted }}>
              {activePreset.note}
            </p>
          </div>
        </div>

        <div className="relative z-20 mt-6 grid gap-4 xl:grid-cols-[1.4fr_1.4fr_auto_auto] xl:items-start">
          <div
            className={`relative ${activeField === "source" ? "z-[140]" : "z-10"}`}
          >
            <label
              className="mb-2 block text-xs uppercase tracking-[0.18em]"
              style={{ color: theme.muted }}
            >
              Start
            </label>
            <input
              type="text"
              placeholder="Enter source"
              className="w-full rounded-[22px] px-4 py-3.5 outline-none transition duration-150"
              style={{
                background: theme.surface,
                border: `1px solid ${sourceError ? theme.danger : theme.card}`,
                color: theme.text,
              }}
              value={source}
              onChange={handleSourceChange}
              onFocus={() => setActiveField("source")}
              onBlur={() => setTimeout(() => setActiveField(""), 150)}
            />
            {sourceError ? (
              <p className="mt-2 text-sm" style={{ color: theme.danger }}>
                {sourceError}
              </p>
            ) : null}
            {renderSuggestions(sourceSugg, "source")}
          </div>

          <div
            className={`relative ${activeField === "destination" ? "z-[140]" : "z-10"}`}
          >
            <label
              className="mb-2 block text-xs uppercase tracking-[0.18em]"
              style={{ color: theme.muted }}
            >
              Destination
            </label>
            <input
              type="text"
              placeholder="Enter destination"
              className="w-full rounded-[22px] px-4 py-3.5 outline-none transition duration-150"
              style={{
                background: theme.surface,
                border: `1px solid ${destinationError ? theme.danger : theme.card}`,
                color: theme.text,
              }}
              value={destination}
              onChange={handleDestinationChange}
              onFocus={() => setActiveField("destination")}
              onBlur={() => setTimeout(() => setActiveField(""), 150)}
            />
            {destinationError ? (
              <p className="mt-2 text-sm" style={{ color: theme.danger }}>
                {destinationError}
              </p>
            ) : null}
            {renderSuggestions(destinationSugg, "destination")}
          </div>

          <div>
            <label
              className="mb-2 block text-xs uppercase tracking-[0.18em]"
              style={{ color: theme.muted }}
            >
              Mode
            </label>
            <div
              className="flex rounded-[22px] p-1"
              style={{
                background: theme.surface,
                border: `1px solid ${theme.card}`,
              }}
            >
              <button
                type="button"
                onClick={() => setTransportMode("driving-car")}
                className="rounded-[18px] px-4 py-3 text-sm font-medium transition"
                style={
                  transportMode === "driving-car"
                    ? { background: theme.primary, color: "#081012" }
                    : { color: theme.text }
                }
              >
                Driving
              </button>
              <button
                type="button"
                onClick={() => setTransportMode("foot-walking")}
                className="rounded-[18px] px-4 py-3 text-sm font-medium transition"
                style={
                  transportMode === "foot-walking"
                    ? { background: theme.primary, color: "#081012" }
                    : { color: theme.text }
                }
              >
                Walking
              </button>
            </div>
          </div>

          <div>
            <label
              className="mb-2 block text-xs uppercase tracking-[0.18em]"
              style={{ color: "transparent" }}
            >
              Action
            </label>
            <button
              type="button"
              onClick={() => handleAnalyzeButton(transportMode)}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-[22px] px-6 py-3.5 text-sm font-semibold transition duration-150 disabled:opacity-60 xl:min-w-[180px]"
              style={{
                background: theme.primary,
                color: "#081012",
                boxShadow: "0 12px 24px rgba(127,187,179,0.18)",
              }}
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              ) : null}
              {loading ? "Analyzing..." : "Analyze route"}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div
            className="mb-3 text-xs uppercase tracking-[0.18em]"
            style={{ color: theme.muted }}
          >
            Rank routes by preset
          </div>
          <div className="flex flex-wrap gap-3">
            {PRESETS.map((item) => {
              const isActive = preset === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPreset(item.key)}
                  className="rounded-full px-4 py-2.5 text-sm font-medium transition duration-150"
                  style={{
                    background: isActive
                      ? "rgba(127,187,179,0.18)"
                      : "rgba(255,255,255,0.04)",
                    color: isActive ? theme.primary : theme.text,
                    border: `1px solid ${isActive ? theme.primary : theme.card}`,
                  }}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Topbar;
