const axios = require('axios');
const { normalizeJob } = require('../models/jobModel');
const { TICKETS_API_URL, FALLBACK_JOBS, haversine, groupIntoStops, optimizeStops } = require('../utils/apiUtils');

const HORANA_ORIGIN = { lat: 6.7148, lng: 80.0627, name: 'Head Office - Horana' };

const fetchJobsWithFallback = async () => {
  try {
    const response = await axios.get(TICKETS_API_URL, { timeout: 8000 });
    const raw = Array.isArray(response.data) ? response.data : response.data.data ?? [];
    const jobs = raw.map(normalizeJob).filter(Boolean);
    if (jobs.length > 0) return { jobs, source: 'live' };
    console.warn('Tickets API returned no jobs; using fallback data.');
  } catch (err) {
    const reason = err.response?.status ? `HTTP ${err.response.status}` : err.message;
    console.warn(`Tickets API unavailable (${reason}); using fallback data.`);
  }
  return { jobs: FALLBACK_JOBS.map(normalizeJob).filter(Boolean), source: 'fallback' };
};

const getOptimizedRoute = async (req, res) => {
  try {
    const { jobs, source } = await fetchJobsWithFallback();
    if (jobs.length === 0) {
      return res.json({ origin: HORANA_ORIGIN, route: [], totalJobs: 0, totalStops: 0, source });
    }

    // Merge jobs at the same store into single stops, then optimise visit order
    const stops    = groupIntoStops(jobs);
    const route    = optimizeStops(stops, HORANA_ORIGIN);

    const totalDistanceKm = parseFloat(
      route.reduce((sum, s) => sum + s.distanceFromPrev, 0).toFixed(2)
    );

    res.json({
      origin: HORANA_ORIGIN,
      route,
      totalJobs:        jobs.length,
      totalStops:       route.length,
      totalDistanceKm,
      source,
    });
  } catch (err) {
    console.error('Route optimization error:', err.message);
    res.status(500).json({ message: 'Error fetching jobs or optimizing route' });
  }
};

const getRawJobs = async (req, res) => {
  try {
    const { jobs, source } = await fetchJobsWithFallback();
    res.json({ jobs, totalJobs: jobs.length, source });
  } catch (err) {
    console.error('Fetch jobs error:', err.message);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
};

const completeJob = async (req, res) => {
  const { id } = req.params;
  let apiUpdated = false;
  for (const method of ['patch', 'put']) {
    if (apiUpdated) break;
    try {
      await axios[method](`${TICKETS_API_URL}/${id}`, { status: 'Completed' }, { timeout: 5000 });
      apiUpdated = true;
    } catch (_) { /* external API is read-only — ignore */ }
  }
  res.json({
    id,
    status: 'Completed',
    apiUpdated,
    message: apiUpdated ? 'Updated in external API' : 'Managed locally (external API is read-only)',
  });
};

module.exports = { getOptimizedRoute, getRawJobs, completeJob };
