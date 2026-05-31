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
import { useEffect } from "react";

function Map({ routes = [] }) {

  const source = routes[0]?.coordinates?.[0];

  const destination =
    routes[0]?.coordinates?.[
      routes[0]?.coordinates?.length - 1
    ];

  const defaultCenter = [28.6139, 77.2090];

  function MapUpdater({ routes }) {
    const map = useMap();

    useEffect(() => {
      const coords = routes[0]?.coordinates;
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
    }, [routes, map]);

    return null;
  }

  return (
    <div className="relative z-0 h-[520px] rounded-3xl overflow-hidden border border-[#2d3437]">
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
          <Marker position={source}>
            <Popup>Source</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={destination}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {routes.map((route, index) => (
          <Polyline
            key={index}
            positions={route.coordinates}
            pathOptions={{
              color: route.color,
              weight: 8,
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;
