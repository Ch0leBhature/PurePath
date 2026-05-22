import mongoose from "mongoose";

const routeSchema = new mongoose.Schema({

  source: String,

  destination: String,

  aqi: Number,

  exposure: String,

  eta: String,

  distance: String,

});

const Route =mongoose.model("Route",routeSchema);

export default Route;

