import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { useEffect, useRef } from "react";
import { getAqiColor } from "../utils/aqi";
import theme from "../utils/theme";

function Map({ routes = [], activeRouteIndex = 0, onRouteSelect }) {

  const activeRoute = routes[activeRouteIndex] || routes[0];
  const source = activeRoute?.coordinates?.[0];
  const destination = activeRoute?.coordinates?.[
    activeRoute?.coordinates?.length - 1
  ];
  const sourceIcon = L.divIcon({
      html: `
        <div style="
          width:18px;
          height:18px;
          background:#22c55e;
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 0 10px rgba(0,0,0,0.4);
        "></div>
      `,
      className: "",
      iconSize: [18, 18],
      iconAnchor: [12, 12],
  });

  const destinationIcon = L.divIcon({
    html: `
      <div style="
        width:18px;
        height:18px;
        background:#ef4444;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 10px rgba(0,0,0,0.4);
      "></div>
    `,
    className: "",
    iconSize: [18, 18],
    iconAnchor: [12, 12],
  });
  const defaultCenter = [28.6139, 77.2090];

  const polylineRefs = useRef([]);

  useEffect(() => {
    const activeLayer = polylineRefs.current[activeRouteIndex];
    try {
      activeLayer?.bringToFront?.();
    } catch (e) {}
  }, [activeRouteIndex]);

  function MapUpdater({ routes }) {
    const map = useMap();

    useEffect(() => {
      const coords = activeRoute?.coordinates;
      if (coords && Array.isArray(coords) && coords.length > 0) {
        try {
          if (coords.length === 1) {
            map.setView(coords[0], 12);
          } else {
            map.fitBounds(coords, { padding: [40, 40] });
          }
        } catch (e) {
          console.error("MapUpdater error", e);
        }
      } else {
        map.setView(defaultCenter, 12);
      }
    }, [routes, activeRouteIndex, map]);

    
    return null;
  }

  return (
    <div className="relative z-0 h-[520px] rounded-3xl overflow-visible" style={{ border: `1px solid ${theme.card}` }}>
      <MapContainer
        center={source || defaultCenter}
        zoom={12}
        className="h-full w-full"
      >
        <MapUpdater routes={routes} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {source && (
          <Marker position={source} icon={sourceIcon}>
            <Popup>Source</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={destination} icon={destinationIcon}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {routes.map((route, index) => {
          const isActive = index === activeRouteIndex;
          return (
            <Polyline
              key={index}
              ref={(el) => (polylineRefs.current[index] = el)}
              positions={route.coordinates}
              pathOptions={{
                color: getAqiColor(route.avgAqi),
                weight: isActive ? 8 : 4,
                opacity: isActive ? 0.95 : 0.45,
              }}
              eventHandlers={{
                click: (e) => {
                  // bring clicked polyline to front and notify parent
                  try {
                    e?.target?.bringToFront?.();
                  } catch (er) {}
                  onRouteSelect?.(index);
                },
              }}
            />
          );
        })}

      </MapContainer>

      {/* AQI Legend overlay (sibling to Leaflet map) */}
      <div
        className="absolute right-4 bottom-4 z-[1000] max-w-[180px] rounded-lg p-2 text-sm shadow-lg"
        style={{ pointerEvents: "auto", border: `1px solid ${theme.card}`, background: `${theme.background}E6`, color: theme.text }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: getAqiColor(1) }} />
            <span> Good</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: getAqiColor(2) }} />
            <span> Fair</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: getAqiColor(3) }} />
            <span> Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: getAqiColor(4) }} />
            <span> Poor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: getAqiColor(5) }} />
            <span> Very Poor</span>
          </div>
        </div>
      </div>
    </div>
    
  );
}

export default Map;

