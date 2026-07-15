import mongoose from "mongoose";

const routeSchema = new mongoose.Schema({
  source: String,
  destination: String,
  aqi: Number,
  exposure: String,
  eta: String,
  distance: String,
  coordinates: {
    type: [[Number]],
    default: undefined,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Route = mongoose.model("Route", routeSchema);

export default Route;
