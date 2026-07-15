import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import wsClient from "../services/ws.client";
import apiClient from "../services/apiClient";
import { getAqiColor } from "../utils/aqi";
import theme from "../utils/theme";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const defaultCenter = [28.6139, 77.209];

function MapViewportSync({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates && Array.isArray(coordinates) && coordinates.length > 0) {
      try {
        if (coordinates.length === 1) {
          map.setView(coordinates[0], 12);
        } else {
          map.fitBounds(coordinates, { padding: [40, 40] });
        }
      } catch (error) {
        console.error("Map viewport sync error", error);
      }
    } else {
      map.setView(defaultCenter, 12);
    }
  }, [coordinates, map]);

  return null;
}

function Map({ routes = [], activeRouteIndex = 0, onRouteSelect }) {
  const activeRoute = routes[activeRouteIndex] || routes[0];
  const source = activeRoute?.coordinates?.[0];
  const destination =
    activeRoute?.coordinates?.[activeRoute?.coordinates?.length - 1];
  const polylineRefs = useRef([]);
  const [alerts, setAlerts] = useState([]);

  const sourceIcon = L.divIcon({
    html: `
      <div style="
        width:18px;
        height:18px;
        background:#34D399;
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
        background:#F87171;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 10px rgba(0,0,0,0.4);
      "></div>
    `,
    className: "",
    iconSize: [18, 18],
    iconAnchor: [12, 12],
  });

  useEffect(() => {
    const activeLayer = polylineRefs.current[activeRouteIndex];
    activeLayer?.bringToFront?.();
  }, [activeRouteIndex]);

  useEffect(() => {
    const active = routes[activeRouteIndex] || routes[0];
    if (!active || !active.coordinates) return;

    const sampleStep = Math.max(1, Math.floor(active.coordinates.length / 6));
    const coords = active.coordinates.filter((_, i) => i % sampleStep === 0);
    const subs = [];

    coords.forEach((c) => {
      const lat = Array.isArray(c) ? c[0] : c.lat;
      const lng = Array.isArray(c) ? c[1] : c.lng;
      const la = Number(lat).toFixed(4);
      const ln = Number(lng).toFixed(4);
      const channel = `aqi:channel:${la}:${ln}`;

      const handler = (msg) => {
        try {
          const parsed = typeof msg === "string" ? JSON.parse(msg) : msg;
          setAlerts((state) => [...state.slice(-9), { ...parsed, channel }]);
        } catch (error) {
          console.warn(error);
        }
      };

      wsClient.subscribeChannel(channel, handler);
      subs.push({ channel, handler });
      apiClient
        .post("/api/aqi/monitor", { lat: Number(la), lng: Number(ln) })
        .catch(() => {});
    });

    return () => {
      subs.forEach(({ channel, handler }) => {
        wsClient.unsubscribeChannel(channel, handler);
      });
    };
  }, [routes, activeRouteIndex]);

  return (
    <div
      className="relative z-0 h-130 overflow-visible rounded-4xl transition-all duration-300 md:h-140"
      style={{
        border: `1px solid ${theme.card}`,
        boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
        background: "rgba(16, 22, 26, 0.55)",
      }}
    >
      <MapContainer
        center={source || defaultCenter}
        zoom={12}
        className="h-full w-full"
      >
        <MapViewportSync coordinates={activeRoute?.coordinates} />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

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
              key={route.id || index}
              ref={(el) => {
                polylineRefs.current[index] = el;
              }}
              positions={route.coordinates}
              pathOptions={{
                color: getAqiColor(route.avgAqi),
                weight: isActive ? 8 : 4,
                opacity: isActive ? 0.95 : 0.45,
              }}
              eventHandlers={{
                click: (event) => {
                  event?.target?.bringToFront?.();
                  onRouteSelect?.(index);
                },
              }}
            />
          );
        })}

        <div className="absolute left-4 top-4 z-1000 flex flex-col gap-2">
          {alerts
            .slice()
            .reverse()
            .map((alert, index) => (
              <div
                key={index}
                className="rounded bg-white/90 p-2 text-xs shadow"
              >
                <div>
                  <b>AQI</b>: {alert.newAqi} (was {alert.prevAqi})
                </div>
                <div className="text-xs">
                  {new Date(alert.ts).toLocaleTimeString()}
                </div>
              </div>
            ))}
        </div>
      </MapContainer>

      <div
        className="absolute bottom-4 right-4 z-1000 max-w-45 rounded-lg p-2 text-sm shadow-lg"
        style={{
          pointerEvents: "auto",
          border: `1px solid ${theme.card}`,
          background: `${theme.background}E6`,
          color: theme.text,
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: getAqiColor(1) }}
            />
            <span> Good</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: getAqiColor(2) }}
            />
            <span> Fair</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: getAqiColor(3) }}
            />
            <span> Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: getAqiColor(4) }}
            />
            <span> Poor</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: getAqiColor(5) }}
            />
            <span> Very Poor</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Map;
