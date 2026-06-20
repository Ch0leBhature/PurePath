# PurePath

PurePath is a full-stack pollution-aware route planning application that helps users discover cleaner travel routes by combining route optimization with real-time Air Quality Index (AQI) analysis.

Instead of only optimizing for distance or travel time, PurePath evaluates environmental exposure along a route and recommends the healthiest available option.

---

## Features

### Pollution-Aware Routing

* Analyze routes based on air quality exposure.
* Calculate average AQI along a route using sampled route coordinates.
* Display AQI exposure categories:

  * Good
  * Fair
  * Moderate
  * Poor
  * Very Poor

### Multi-Route Comparison

* Generate multiple route alternatives using OpenRouteService.
* Compare routes using:

  * AQI Exposure
  * Distance
  * Estimated Travel Time
* Recommended route highlighted automatically.

### Interactive Mapping

* Built using Leaflet.
* Route visualization directly on the map.
* AQI-based route coloring.
* Clickable route selection.
  
### Route Management

* Save routes to user account.
* View saved routes.
* Delete saved routes.

## Tech Stack
* React
* React Router
* Axios
* Leaflet
* Tailwind CSS
* Node.js
* Express.js
* MongoDB
* OpenRouteService API
* OpenWeather Air Pollution API
* JWT



