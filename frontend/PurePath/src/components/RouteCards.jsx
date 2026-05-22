import { useEffect, useState } from "react";

const RouteCards = ({ routes, onSave, savingRoute }) => {
  const [activeSaveIndex, setActiveSaveIndex] = useState(null);
  const [saveSource, setSaveSource] = useState("");
  const [saveDestination, setSaveDestination] = useState("");

  useEffect(() => {
    if (activeSaveIndex !== null && routes[activeSaveIndex]) {
      setSaveSource(routes[activeSaveIndex].src || routes[activeSaveIndex].source || "");
      setSaveDestination(routes[activeSaveIndex].dest || routes[activeSaveIndex].destination || "");
    }
  }, [activeSaveIndex, routes]);

  return (
    <div className="flex flex-col gap-4">

      {routes.map((route, index) => (
        <div
          key={index}
          className="bg-[#1b2225] border border-[#2d3437] rounded-2xl p-4 md:p-6"
        >

          <div
            className="w-[14px] h-[14px] rounded-full mb-4"
            style={{
              background: route.color,
            }}
          ></div>

          <h3 className="text-lg md:text-xl font-semibold mb-4">
            Live AQI : {route.src} - {route.dest}
          </h3>

          <p className="text-gray-300 mb-2 text-sm md:text-base">
            Open Weather Index: {route.aqi} / 5
          </p>

          <p className="text-gray-300 mb-2 text-sm md:text-base">
            ETA: {route.eta} minutes
          </p>
          <p className="text-gray-300 mb-2 text-sm md:text-base">
            DISTANCE: {route.distance}
          </p>
  
          <span className="text-gray-300 text-sm md:text-base">
            Exposure: {route.exposure}
          </span>

          {onSave && activeSaveIndex === index ? (
            <div className="mt-5 space-y-3 rounded-3xl border border-[#2d3437] bg-[#181f22] p-4">
              <p className="text-sm text-gray-400">Save this route with custom source/destination.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={saveSource}
                  onChange={(e) => setSaveSource(e.target.value)}
                  placeholder="Source"
                  className="w-full rounded-2xl border border-[#2d3437] bg-[#232a2d] px-4 py-3 text-white outline-none"
                />
                <input
                  type="text"
                  value={saveDestination}
                  onChange={(e) => setSaveDestination(e.target.value)}
                  placeholder="Destination"
                  className="w-full rounded-2xl border border-[#2d3437] bg-[#232a2d] px-4 py-3 text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSaveIndex(null)}
                  className="rounded-2xl border border-[#2d3437] bg-transparent px-5 py-3 text-sm font-semibold text-white hover:border-[#8ccf7e] transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onSave({ ...route, src: saveSource, dest: saveDestination })}
                  disabled={savingRoute || !saveSource || !saveDestination}
                  className="rounded-2xl bg-[#8ccf7e] px-5 py-3 text-sm font-semibold text-black transition disabled:opacity-50"
                >
                  {savingRoute ? "Saving..." : "Save Route"}
                </button>
              </div>
            </div>
          ) : onSave ? (
            <button
              type="button"
              onClick={() => setActiveSaveIndex(index)}
              className="mt-5 flex rounded-2xl bg-[#8ccf7e] px-5 py-3 text-sm font-semibold text-black transition"
            >
              Save route with source & destination
            </button>
          ) : null}

        </div>
      ))}

    </div>
  )
}

export default RouteCards
