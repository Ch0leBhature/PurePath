import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  routeId: String,
  avgAqi: Number,
  rawDuration: Number,
  rawDistance: Number,
  presetScore: Number,
  exposure: String,
}, { _id: false });

const routeAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  origin: { type: { type: String, default: 'Point' }, coordinates: { type: [Number], index: '2dsphere' } },
  destination: { type: { type: String, default: 'Point' }, coordinates: { type: [Number], index: '2dsphere' } },
  preset: String,
  candidates: [candidateSchema],
  chosenRouteId: String,
  saved: { type: Boolean, default: false },
}, { timestamps: true });

const RouteAnalysis = mongoose.model('RouteAnalysis', routeAnalysisSchema);

export default RouteAnalysis;
