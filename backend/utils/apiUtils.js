const TICKETS_API_URL = 'https://service-connect.free.beeceptor.com/tickets';

const FALLBACK_JOBS = [
  { id: 1, store_name: 'SURANGA CATERS- NEGAMBO', job_type: 'Hardware',     territory: 'Negombo', status: 'Pending', geo_lat: 7.2067, geo_lng: 79.8496 },
  { id: 2, store_name: 'GOLDI SANDS',             job_type: 'Power',        territory: 'Negombo', status: 'Pending', geo_lat: 7.2294, geo_lng: 79.8421 },
  { id: 3, store_name: 'DOLPHINE HOTEL',           job_type: 'Dispensing',   territory: 'Negombo', status: 'Pending', geo_lat: 7.2798, geo_lng: 79.8561 },
  { id: 4, store_name: 'DOLPHINE HOTEL',           job_type: 'Registration', territory: 'Negombo', status: 'Pending', geo_lat: 7.2812, geo_lng: 79.8574 },
];

const haversine = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => deg * (Math.PI / 180);
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Merge flat jobs into stops — jobs with the same store_name share one visit.
 * Uses insertion order so upstream sort (optimizeStops) determines visit sequence.
 */
const groupIntoStops = (jobs) => {
  const map = new Map();
  jobs.forEach((job) => {
    const key = job.store_name.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        stopId: `stop-${map.size + 1}`,
        store_name: job.store_name,
        territory: job.territory,
        geo_lat: job.geo_lat,
        geo_lng: job.geo_lng,
        jobs: [],
      });
    }
    map.get(key).jobs.push({
      id: job.id,
      job_type: job.job_type,
      status: job.status,
      territory: job.territory,
    });
  });
  return [...map.values()];
};

/**
 * Nearest-neighbour TSP on stops. Returns stops in optimised visit order
 * with straight-line distanceFromPrev (km) attached to each.
 */
const optimizeStops = (stops, start) => {
  let current = start;
  const remaining = [...stops];
  const ordered = [];

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = haversine(current.lat, current.lng, s.geo_lat, s.geo_lng);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push({ ...next, distanceFromPrev: parseFloat(bestDist.toFixed(2)) });
    current = { lat: next.geo_lat, lng: next.geo_lng };
  }
  return ordered;
};

module.exports = { TICKETS_API_URL, FALLBACK_JOBS, haversine, groupIntoStops, optimizeStops };
