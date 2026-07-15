import RouteAnalysis from '../models/routeAnalysis.model.js';
import Route from '../models/route.model.js';

export async function summary(req, res) {
  try {
    const totalAnalyses = await RouteAnalysis.countDocuments();
    const savedRoutes = await Route.countDocuments();

    const agg = await RouteAnalysis.aggregate([
      { $unwind: '$candidates' },
      { $group: { _id: null, avgAQI: { $avg: '$candidates.avgAqi' }, avgETA: { $avg: '$candidates.rawDuration' }, avgDistance: { $avg: '$candidates.rawDistance' } } },
    ]);

    const avgAQI = agg?.[0]?.avgAQI ?? 0;
    const avgETA = Math.round((agg?.[0]?.avgETA ?? 0) / 60); // minutes
    const avgDistance = agg?.[0]?.avgDistance ?? 0;

    // weekly activity (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekly = await RouteAnalysis.countDocuments({ createdAt: { $gte: weekAgo } });

    return res.json({ totalAnalyses, savedRoutes, avgAQI: Math.round(avgAQI * 100) / 100, avgETA, avgDistance, weekly });
  } catch (e) {
    console.error('analytics summary error', e);
    return res.status(500).json({ error: 'server error' });
  }
}

export default { summary };
