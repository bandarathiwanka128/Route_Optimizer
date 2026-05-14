import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';

const MAPS_API_KEY  = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
const HORANA_ORIGIN = { lat: 6.7148, lng: 80.0627 };
const containerStyle = { width: '100%', height: '100%' };

const makeIcon = (color) => ({
  path: window.google.maps.SymbolPath.CIRCLE,
  scale: 14,
  fillColor: color,
  fillOpacity: 1,
  strokeColor: '#FFFFFF',
  strokeWeight: 2.5,
});

const makeLabel = (text) => ({
  text: String(text),
  color: '#FFFFFF',
  fontSize: String(text).length > 1 ? '9px' : '12px',
  fontWeight: 'bold',
  fontFamily: 'Arial,sans-serif',
});

/* ── Route Summary Panel ───────────────────────────────── */
const RouteSummaryPanel = ({ route, legs, completedIds }) => {
  const isStopDone = (s) =>
    Array.isArray(s.jobs) && s.jobs.length > 0 && s.jobs.every((j) => completedIds.has(j.id));

  const legMap = {};
  legs.forEach((l) => { legMap[l.stopId] = l; });

  const totalDist = legs.reduce((sum, l) => {
    const km = parseFloat(l.distance?.replace(/[^0-9.]/g, '') || 0);
    return sum + km;
  }, 0);

  const totalMins = legs.reduce((sum, l) => {
    const txt = l.duration || '';
    const h = (txt.match(/(\d+)\s*hour/) || [])[1];
    const m = (txt.match(/(\d+)\s*min/)  || [])[1];
    return sum + (h ? parseInt(h) * 60 : 0) + (m ? parseInt(m) : 0);
  }, 0);

  const fmtTotal = (mins) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  };

  const nodes = [
    { key: 'start', label: 'S', name: 'Head Office', sub: 'Horana', type: 'start' },
    ...route.map((stop, i) => ({
      key: stop.stopId,
      label: isStopDone(stop) ? '✓' : i + 1,
      name: stop.store_name,
      sub: `${stop.territory || ''}${stop.jobs?.length > 1 ? ` · ${stop.jobs.length} jobs` : ''}`,
      type: isStopDone(stop) ? 'completed' : 'pending',
      leg:  legMap[stop.stopId],
    })),
  ];

  return (
    <div className="route-summary-panel">
      <div className="rsp-header">
        <span className="rsp-title">Route Summary</span>
        <div className="rsp-totals">
          {legs.length > 0 && (
            <>
              <div className="rsp-total-chip">
                <span>&#128663;</span>
                <span>{totalDist.toFixed(1)} km total</span>
              </div>
              {fmtTotal(totalMins) && (
                <div className="rsp-total-chip">
                  <span>&#9203;</span>
                  <span>{fmtTotal(totalMins)} total</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="rsp-timeline">
        {nodes.map((node, i) => (
          <React.Fragment key={node.key}>
            <div className="rsp-node">
              <div className={`rsp-node-circle ${node.type}`}>{node.label}</div>
              <span className="rsp-node-name">{node.name}</span>
              {node.sub && <span className="rsp-node-sub">{node.sub}</span>}
            </div>

            {i < nodes.length - 1 && (
              <div className="rsp-connector">
                <div className="rsp-connector-line">
                  <div className="rsp-line" />
                  <span className="rsp-arrow">&#9654;</span>
                </div>
                <div className="rsp-connector-label">
                  {nodes[i + 1].leg ? (
                    <>
                      <span className="rsp-dist">{nodes[i + 1].leg.distance}</span>
                      <span className="rsp-time">{nodes[i + 1].leg.duration}</span>
                    </>
                  ) : (
                    <span className="rsp-time" style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>
                  )}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/* ── MapView ─────────────────────────────────────────────── */
const MapView = ({ route, loading, error, completedIds, focusedStopId, onLegInfoUpdate, onMarkerClick }) => {
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: MAPS_API_KEY });

  const [directions, setDirections] = useState(null);
  const [dirError,   setDirError]   = useState(null);
  const [mapReady,   setMapReady]   = useState(false);
  const [legs,       setLegs]       = useState([]);

  const mapRef     = useRef(null);
  const dirSvcRef  = useRef(null);
  const markersRef = useRef({});
  const infoWinRef = useRef(null);

  const isStopDone = (s) =>
    Array.isArray(s.jobs) && s.jobs.length > 0 && s.jobs.every((j) => completedIds.has(j.id));

  const buildIWContent = (stop, index) => {
    const done    = isStopDone(stop);
    const pending = (stop.jobs ?? []).filter((j) => !completedIds.has(j.id)).length;
    const tags    = (stop.jobs ?? []).map((j) => {
      const jd = completedIds.has(j.id);
      return `<span style="font-size:0.63rem;padding:2px 7px;border-radius:7px;font-weight:600;`
        + `background:${jd ? '#EDF4EC' : '#FEF0E8'};color:${jd ? '#5A7A52' : '#C8501A'}">`
        + `${jd ? '✓ ' : ''}${j.job_type}</span>`;
    }).join('');
    return `<div class="iw">`
      + `<span class="iw-chip ${done ? 'iw-done' : 'iw-pending'}">${done ? '✓ Done' : `Stop ${index + 1}`}</span>`
      + `<p class="iw-title">${stop.store_name}</p>`
      + (stop.territory ? `<p class="iw-meta">${stop.territory}</p>` : '')
      + `<div class="iw-tags">${tags}</div>`
      + `<p class="iw-status ${done ? 'iw-status-done' : 'iw-status-pending'}">`
      + `● ${done ? 'All jobs completed' : `${pending} job${pending !== 1 ? 's' : ''} pending`}</p></div>`;
  };

  const syncMarkers = useCallback(() => {
    if (!mapRef.current) return;
    const G = window.google.maps;
    Object.values(markersRef.current).forEach((m) => m.setMap(null));
    markersRef.current = {};
    if (infoWinRef.current) { infoWinRef.current.close(); infoWinRef.current = null; }

    /* Horana START */
    const startM = new G.Marker({
      position: HORANA_ORIGIN,
      map: mapRef.current,
      icon:  makeIcon('#161E54'),
      label: makeLabel('S'),
      title: 'Head Office — Horana (START)',
      zIndex: 1000,
    });
    startM.addListener('click', () => {
      if (infoWinRef.current) infoWinRef.current.close();
      const iw = new G.InfoWindow({
        content: `<div class="iw"><span class="iw-chip iw-start">▶ START</span>`
          + `<p class="iw-title">Head Office — Horana</p>`
          + `<p class="iw-meta">Kalutara District · Western Province</p></div>`,
      });
      iw.open(mapRef.current, startM);
      infoWinRef.current = iw;
    });
    markersRef.current['start'] = startM;

    /* Stop markers */
    route.forEach((stop, index) => {
      const done  = isStopDone(stop);
      const color = done ? '#3E6E38' : '#F16D34';
      const lbl   = done ? '✓' : index + 1;
      const m = new G.Marker({
        position: { lat: stop.geo_lat, lng: stop.geo_lng },
        map: mapRef.current,
        icon:  makeIcon(color),
        label: makeLabel(lbl),
        title: `${done ? '✓' : `Stop ${index + 1}`}: ${stop.store_name}`,
        zIndex: done ? 5 : 100 - index,
      });
      m.addListener('click', () => {
        if (infoWinRef.current) infoWinRef.current.close();
        const iw = new G.InfoWindow({ content: buildIWContent(stop, index) });
        iw.open(mapRef.current, m);
        infoWinRef.current = iw;
        onMarkerClick(stop.stopId);
      });
      markersRef.current[stop.stopId] = m;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, completedIds, onMarkerClick]);

  const calculateRoute = useCallback((pendingStops) => {
    if (!dirSvcRef.current) return;
    if (pendingStops.length === 0) {
      setDirections(null);
      setLegs([]);
      onLegInfoUpdate([]);
      if (mapRef.current) mapRef.current.setCenter(HORANA_ORIGIN);
      return;
    }
    const destination = { lat: pendingStops.at(-1).geo_lat, lng: pendingStops.at(-1).geo_lng };
    const waypoints   = pendingStops.slice(0, -1).map((s) => ({
      location: new window.google.maps.LatLng(s.geo_lat, s.geo_lng),
      stopover: true,
    }));
    dirSvcRef.current.route(
      { origin: HORANA_ORIGIN, destination, waypoints,
        optimizeWaypoints: false,
        travelMode: window.google.maps.TravelMode.DRIVING,
        region: 'lk' },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          setDirError(null);
          if (mapRef.current) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(HORANA_ORIGIN);
            result.routes[0].legs.forEach((l) => {
              bounds.extend(l.start_location);
              bounds.extend(l.end_location);
            });
            mapRef.current.fitBounds(bounds, 60);
          }
          const legData = result.routes[0].legs.map((leg, i) => ({
            stopId:   pendingStops[i].stopId,
            distance: leg.distance.text,
            duration: leg.duration.text,
          }));
          setLegs(legData);
          onLegInfoUpdate(legData);
        } else {
          console.error('Directions failed:', status);
          setDirError(status);
          setDirections(null);
          setLegs([]);
          onLegInfoUpdate([]);
        }
      }
    );
  }, [onLegInfoUpdate]);

  const onMapLoad = useCallback((map) => {
    mapRef.current    = map;
    dirSvcRef.current = new window.google.maps.DirectionsService();
    setMapReady(true);
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    syncMarkers();
    calculateRoute(route.filter((s) => !isStopDone(s)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, syncMarkers, calculateRoute]);

  useEffect(() => {
    if (!mapRef.current || !focusedStopId) return;
    const stop = route.find((s) => s.stopId === focusedStopId);
    if (stop) {
      mapRef.current.panTo({ lat: stop.geo_lat, lng: stop.geo_lng });
      mapRef.current.setZoom(15);
    }
  }, [focusedStopId, route]);

  useEffect(() => () => {
    Object.values(markersRef.current).forEach((m) => m.setMap(null));
    if (infoWinRef.current) infoWinRef.current.close();
  }, []);

  if (!MAPS_API_KEY)        return <div className="map-placeholder"><p>Add Google Maps API key to <code>frontend/.env</code></p></div>;
  if (loading || !isLoaded) return <div className="map-placeholder">Loading&hellip;</div>;
  if (error || loadError)   return <div className="map-placeholder error">{error || 'Failed to load Google Maps'}</div>;

  return (
    <>
      <div className="map-wrapper">
        <GoogleMap
          mapContainerStyle={containerStyle}
          defaultCenter={HORANA_ORIGIN}
          defaultZoom={10}
          onLoad={onMapLoad}
          onClick={() => { if (infoWinRef.current) { infoWinRef.current.close(); infoWinRef.current = null; } }}
          options={{ streetViewControl: false, fullscreenControl: true }}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: { strokeColor: '#161E54', strokeWeight: 5, strokeOpacity: 0.85 },
              }}
            />
          )}
        </GoogleMap>

        {dirError && (
          <div className="dir-error-banner">
            &#9888; Directions API returned <b>{dirError}</b>. Enable <b>Directions API</b> in Google Cloud Console.
          </div>
        )}
      </div>

      <RouteSummaryPanel route={route} legs={legs} completedIds={completedIds} />
    </>
  );
};

export default MapView;
