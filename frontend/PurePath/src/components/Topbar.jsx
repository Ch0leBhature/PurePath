import { useState, useEffect } from "react";
import theme from "../utils/theme";
// import { getSuggestions } from "../services/autoCompleteService";

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
}) => {
  const [activeField, setActiveField] = useState("");
  const [transportMode, setTransportMode] = useState("driving-car");

  const getSuggestionLabel = (place) => place?.properties?.label || place?.text || "";
    
  // Autocomplete is disabled temporarily because nomitium was blocking the requests.
  //const fetchSuggestions = async (query, setSuggestions) => {
  //  if (!query || query.length < 3) {
  //    setSuggestions([]);
  //    return;
  //  }
  //
  //  const result = await getSuggestions(query);
  //  setSuggestions(result);
  //};

  //useEffect(() => {
  //  const timer = setTimeout(async () => {
  //    fetchSuggestions(source, setSourceSugg);
  //  }, 350);
  //
  //  return () => {
  //    clearTimeout(timer);
  //  };
  //}, [source]);
  
  //useEffect(() => {
  //  const timer = setTimeout(async () => {
  //    fetchSuggestions(destination, setDestinationSugg);
  //  }, 350);
  //
  //  return () => {
  //    clearTimeout(timer);
  //  };
  //}, [destination]);

  const handleSourceChange = async (event) => {
    const value = event.target.value;
    setSource(value);
    if (value && clearSourceError) clearSourceError();
  };

  const handleDestinationChange = async (event) => {
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
    const clearSuggestions = type === "source" ? setSourceSugg : setDestinationSugg;

    return (
      isActive && (
        <div className="absolute z-60 mt-1 max-h-64 w-full overflow-auto rounded-2xl border border-[#2d3437] bg-[#141b1e] shadow-xl">
          {suggestions.map((place, index) => (
            <button
              type="button"
              key={`${getSuggestionLabel(place)}-${index}`}
              onMouseDown={() => selectSuggestion(place, setter, clearSuggestions)}
              className="w-full text-left px-4 py-3 hover:bg-[#1f292d] transition"
            >
              {getSuggestionLabel(place)}
            </button>
          ))}
        </div>
      )
    );
  };

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex justify-between items-center mb-4 md:hidden">
        <button type="button" onClick={onMenuClick} className="text-white text-2xl">
          ☰
        </button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold" style={{ color: theme.text }}>Pollution Aware Routing</h1>
          <p className="mt-2 md:mt-3 text-base md:text-lg" style={{ color: theme.muted }}>
            Find cleaner and safer travel routes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-[220px] lg:w-[220px]">
            <input
              type="text"
              placeholder="Source"
              className="px-4 py-3 rounded-xl outline-none w-full transition duration-150"
              style={{ background: theme.surface, border: `1px solid ${theme.card}`, color: theme.text }}
              value={source}
              onChange={handleSourceChange}
              onFocus={() => setActiveField("source")}
              onBlur={() => setTimeout(() => setActiveField(""), 150)}
            />
            {sourceError && (
              <p className="mt-1 text-sm" style={{ color: theme.danger }}>{sourceError}</p>
            )}
            {renderSuggestions(sourceSugg, "source")}
          </div>

          <div className="relative w-full sm:w-[220px] lg:w-[220px]">
            <input
              type="text"
              placeholder="Destination"
              className="px-4 py-3 rounded-xl outline-none w-full transition duration-150"
              style={{ background: theme.surface, border: `1px solid ${theme.card}`, color: theme.text }}
              value={destination}
              onChange={handleDestinationChange}
              onFocus={() => setActiveField("destination")}
              onBlur={() => setTimeout(() => setActiveField(""), 150)}
            />
            {destinationError && (
              <p className="mt-1 text-sm" style={{ color: theme.danger }}>{destinationError}</p>
            )}
            {renderSuggestions(destinationSugg, "destination")}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl p-1" style={{ background: theme.surface, border: `1px solid ${theme.card}` }}>
              <button
                type="button"
                onClick={() => setTransportMode("driving-car")}
                className={`px-3 py-2 rounded-lg text-sm font-medium`}
                style={transportMode === "driving-car" ? { background: theme.primary, color: '#000' } : { color: theme.text }}
              >
                Driving
              </button>
              <button
                type="button"
                onClick={() => setTransportMode("foot-walking")}
                className={`px-3 py-2 rounded-lg text-sm font-medium`}
                style={transportMode === "foot-walking" ? { background: theme.primary, color: '#000' } : { color: theme.text }}
              >
                Walking
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleAnalyzeButton(transportMode)}
              disabled={loading}
              className="bg-[#7fbbb3] hover:bg-[#6fb0a8] text-black font-semibold px-6 py-3 rounded-xl transition duration-150 w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="loader-border inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                "Analyze Route"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
