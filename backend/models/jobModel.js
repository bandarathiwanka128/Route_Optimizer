/**
 * Validates and normalises a raw job object from the external API.
 * Returns null if the job lacks required coordinate fields.
 */
const normalizeJob = (raw) => {
  const lat = parseFloat(raw.geo_lat);
  const lng = parseFloat(raw.geo_lng);

  if (isNaN(lat) || isNaN(lng)) return null;

  return {
    id: raw.id ?? raw.ticket_id ?? null,
    store_name: raw.store_name ?? 'Unknown',
    job_type: raw.job_type ?? raw.type ?? 'N/A',
    territory: raw.territory ?? '',
    status: raw.status ?? '',
    geo_lat: lat,
    geo_lng: lng,
  };
};

module.exports = { normalizeJob };
