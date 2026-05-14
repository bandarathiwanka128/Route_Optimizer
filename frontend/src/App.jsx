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

          <div className="header-dispatch">
            <div className="dispatch-info">
              <span className="dispatch-title">Field Technician Dispatch</span>
              <span className="dispatch-sub">
                &#128205; Head Office, Horana &nbsp;&mdash;&nbsp;
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {!loading && summary && (
              <div className="header-targets">
                <span className="targets-label">Today&rsquo;s Targets</span>
                <div className="target-chips">
                  <div className="target-chip">
                    <span className="chip-icon">&#128205;</span>
                    <div className="chip-body">
                      <span className="chip-val">{route.length}</span>
                      <span className="chip-lbl">Stops</span>
                    </div>
                  </div>
                  <div className="target-chip">
                    <span className="chip-icon">&#128203;</span>
                    <div className="chip-body">
                      <span className="chip-val">{totalJobs}</span>
                      <span className="chip-lbl">Jobs</span>
                    </div>
                  </div>
                  <div className="target-chip">
                    <span className="chip-icon">&#128663;</span>
                    <div className="chip-body">
                      <span className="chip-val">{summary.totalDistanceKm}</span>
                      <span className="chip-lbl">km route</span>
                    </div>
                  </div>
                  <div className="target-chip accent">
                    <span className="chip-icon">&#9989;</span>
                    <div className="chip-body">
                      <span className="chip-val">{completedCount}/{totalJobs}</span>
                      <span className="chip-lbl">Done</span>
                    </div>
                  </div>
                  {summary.source === 'fallback' && (
                    <span className="source-badge">Demo data</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
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
