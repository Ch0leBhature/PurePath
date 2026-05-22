import { useState } from "react";
import { getSuggestions } from "../services/autoCompleteService";

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
}) => {
  const [activeField, setActiveField] = useState("");

  const getSuggestionLabel = (place) => place?.properties?.label || place?.text || "";
    
  //used this function commomly for setting both source and destination
  const fetchSuggestions = async (query, setSuggestions) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setSuggestions(await getSuggestions(query));
  };

  const handleSourceChange = async (event) => {
    const value = event.target.value;
    setSource(value);
    await fetchSuggestions(value, setSourceSugg);
  };

  const handleDestinationChange = async (event) => {
    const value = event.target.value;
    setDestination(value);
    await fetchSuggestions(value, setDestinationSugg);
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
          <h1 className="text-3xl md:text-5xl font-bold text-white">Pollution Aware Routing</h1>
          <p className="text-gray-400 mt-2 md:mt-3 text-base md:text-lg">
            Find cleaner and safer travel routes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-[220px] lg:w-[220px]">
            <input
              type="text"
              placeholder="Source"
              className="bg-[#232a2d] border border-[#2d3437] text-white px-4 py-3 rounded-xl outline-none w-full"
              value={source}
              onChange={handleSourceChange}
              onFocus={() => setActiveField("source")}
              onBlur={() => setTimeout(() => setActiveField(""), 150)}
            />
            {renderSuggestions(sourceSugg, "source")}
          </div>

          <div className="relative w-full sm:w-[220px] lg:w-[220px]">
            <input
              type="text"
              placeholder="Destination"
              className="bg-[#232a2d] border border-[#2d3437] text-white px-4 py-3 rounded-xl outline-none w-full"
              value={destination}
              onChange={handleDestinationChange}
              onFocus={() => setActiveField("destination")}
              onBlur={() => setTimeout(() => setActiveField(""), 150)}
            />
            {renderSuggestions(destinationSugg, "destination")}
          </div>

          <button
            type="button"
            onClick={handleAnalyzeButton}
            disabled={loading}
            className="bg-[#8ccf7e] hover:bg-[#7bc56d] text-black font-semibold px-6 py-3 rounded-xl transition w-full sm:w-auto"
          >
            {loading ? "Analyzing..." : "Analyze Route"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
