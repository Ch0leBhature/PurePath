import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";

function Map({ routes = [] }) {
  // Default source and destination if no routes
  const source = [22.5726, 88.3639];
  const destination = routes.length > 0 ? routes[0].coordinates[routes[0].coordinates.length - 1] : [22.5800, 88.3800];

  return (
    <div className="h-[520px] rounded-3xl overflow-hidden border border-[#2d3437]">
      <MapContainer
        center={source}
        zoom={20}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* SOURCE MARKER */}
        <Marker position={source}>
          <Popup>Source</Popup>
        </Marker>

        {/* DESTINATION MARKER */}
        <Marker position={destination}>
          <Popup>Destination</Popup>
        </Marker>

        {/* DYNAMIC ROUTES */}
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
