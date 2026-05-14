import React, { useState, useEffect, useCallback } from 'react';
import JobList from './components/JobList';
import MapView from './components/MapView';
import ErrorBoundary from './components/ErrorBoundary';
import apiService from './services/apiService';
import './App.css';

const App = () => {
  const [route,        setRoute]        = useState([]);
  const [summary,      setSummary]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [completedIds, setCompletedIds] = useState(new Set()); // individual job IDs
  const [focusedStopId, setFocusedStopId] = useState(null);
  const [legInfo,      setLegInfo]      = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getOptimizedRoute();
        setRoute(data.route ?? []);
        setSummary({
          totalJobs:       data.totalJobs,
          totalStops:      data.totalStops,
          totalDistanceKm: data.totalDistanceKm,
          source:          data.source,
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch optimized route');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCompleteJob = useCallback(async (jobId) => {
    apiService.completeJob(jobId).catch(() => {});
    setCompletedIds((prev) => new Set([...prev, jobId]));
  }, []);

  const handleFocusStop = useCallback((stopId) => {
    setFocusedStopId((prev) => (prev === stopId ? null : stopId));
  }, []);

  const handleLegUpdate = useCallback((legs) => {
    setLegInfo(legs);
  }, []);

  const totalJobs      = route.reduce((sum, s) => sum + (s.jobs?.length ?? 1), 0);
  const completedCount = completedIds.size;
  const pendingStops   = route.filter((s) => s.jobs?.some((j) => !completedIds.has(j.id)));

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-logo-block">
            <div className="header-logo-icon">
              {/* Sunquick sun icon */}
              <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="14" r="6" fill="white"/>
                {[0,45,90,135,180,225,270,315].map((deg, i) => {
                  const r = deg * Math.PI / 180;
                  const x1 = 14 + 8 * Math.cos(r), y1 = 14 + 8 * Math.sin(r);
                  const x2 = 14 + 12 * Math.cos(r), y2 = 14 + 12 * Math.sin(r);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="2.2" strokeLinecap="round"/>;
                })}
              </svg>
            </div>
            <div className="header-brand">
              <span className="header-company">Sunquick Lanka</span>
              <span className="header-appname">Route Optimizer</span>
            </div>
          </div>
          <div className="header-divider" />
          <p className="subtitle">
            Field Technician Dispatch &mdash; Starting from Head Office, Horana
          </p>
        </div>
        {!loading && summary && (
          <div className="summary-bar">
            <span>{pendingStops.length} stops pending</span>
            <span>{completedCount} / {totalJobs} jobs completed</span>
            <span>{summary.totalDistanceKm} km estimated</span>
            {summary.source === 'fallback' && <span className="source-badge">Demo data</span>}
          </div>
        )}
      </header>

      <main className="app-main">
        <section className="list-section">
          <JobList
            stops={route}
            loading={loading}
            error={error}
            completedIds={completedIds}
            focusedStopId={focusedStopId}
            legInfo={legInfo}
            onCompleteJob={handleCompleteJob}
            onFocusStop={handleFocusStop}
          />
        </section>

        <section className="map-section">
          <ErrorBoundary>
            <MapView
              route={route}
              loading={loading}
              error={error}
              completedIds={completedIds}
              focusedStopId={focusedStopId}
              onLegInfoUpdate={handleLegUpdate}
              onMarkerClick={handleFocusStop}
            />
          </ErrorBoundary>
        </section>
      </main>
    </div>
  );
};

export default App;
