import React, { useState } from 'react';

const JobList = ({
  stops,
  loading,
  error,
  completedIds,
  focusedStopId,
  legInfo,
  onCompleteJob,
  onFocusStop,
}) => {
  const [confirmJobId, setConfirmJobId] = useState(null);

  if (loading) return <div className="status-msg">Loading jobs&hellip;</div>;
  if (error)   return <div className="status-msg error">Error: {error}</div>;
  if (!stops || stops.length === 0) return <div className="status-msg">No jobs found.</div>;

  const isStopDone    = (s) => Array.isArray(s.jobs) && s.jobs.length > 0 && s.jobs.every((j) => completedIds.has(j.id));
  const isStopPartial = (s) => Array.isArray(s.jobs) && s.jobs.some((j) => completedIds.has(j.id)) && !isStopDone(s);

  const pendingStops   = stops.filter((s) => !isStopDone(s));
  const completedStops = stops.filter((s) =>  isStopDone(s));

  const totalJobs     = stops.reduce((sum, s) => sum + s.jobs.length, 0);
  const completedJobs = completedIds.size;

  const getLeg = (stopId) => legInfo.find((l) => l.stopId === stopId);

  const renderStop = (stop, displayIndex) => {
    const done    = isStopDone(stop);
    const partial = isStopPartial(stop);
    const focused = focusedStopId === stop.stopId;
    const leg     = getLeg(stop.stopId);

    return (
      <div
        key={stop.stopId}
        className={`job-card ${done ? 'done' : 'pending'} ${partial ? 'partial' : ''} ${focused ? 'focused' : ''}`}
        onClick={() => !done && onFocusStop(stop.stopId)}
      >
        {/* ── Card header ── */}
        <div className="job-card-header">
          <span className={`stop-badge ${done ? 'badge-done' : 'badge-pending'}`}>
            {done ? '✓' : displayIndex}
          </span>
          <div className="job-title-area">
            <span className="job-name">{stop.store_name}</span>
            {stop.territory && <span className="job-territory">{stop.territory}</span>}
            {done    && <span className="completed-label">All Jobs Done</span>}
            {partial && <span className="partial-label">In Progress</span>}
          </div>
          <span className="job-count-chip">{stop.jobs.length} job{stop.jobs.length > 1 ? 's' : ''}</span>
        </div>

        {/* ── Per-job rows ── */}
        <div className="job-rows">
          {stop.jobs.map((job) => {
            const jobDone = completedIds.has(job.id);

            if (confirmJobId === job.id) {
              return (
                <div key={job.id} className="job-row confirming" onClick={(e) => e.stopPropagation()}>
                  <p className="confirm-question">Complete <strong>{job.job_type}</strong>?</p>
                  <div className="confirm-row">
                    <button
                      className="btn-yes"
                      onClick={() => { onCompleteJob(job.id); setConfirmJobId(null); }}
                    >✓ Yes, Complete</button>
                    <button
                      className="btn-no"
                      onClick={() => setConfirmJobId(null)}
                    >Cancel</button>
                  </div>
                </div>
              );
            }

            return (
              <div key={job.id} className={`job-row ${jobDone ? 'job-row-done' : ''}`}>
                <div className="job-row-info">
                  <span className={`job-type-tag ${jobDone ? 'tag-done' : ''}`}>{job.job_type}</span>
                  {jobDone && <span className="job-done-badge">✓ Done</span>}
                  {!jobDone && job.status && (
                    <span className="job-status-text">{job.status}</span>
                  )}
                </div>
                {!jobDone && (
                  <button
                    className="btn-complete-small"
                    onClick={(e) => { e.stopPropagation(); setConfirmJobId(job.id); }}
                  >
                    Complete
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Distance / time from Directions API ── */}
        {leg && !done && (
          <div className="leg-info">
            <span>&#128663; {leg.distance}</span>
            <span>&#9203; {leg.duration}</span>
          </div>
        )}

        {/* ── Go to map ── */}
        {!done && (
          <div className="job-actions">
            <button
              className="btn-goto"
              onClick={(e) => { e.stopPropagation(); onFocusStop(stop.stopId); }}
            >
              Go to map &#8594;
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="job-list">
      <div className="job-list-header">
        <h2>Visit Order</h2>
        <span className="job-counts">
          {pendingStops.length} stops &bull; {completedJobs}/{totalJobs} jobs
        </span>
      </div>

      <div className="origin-chip">
        <span className="origin-dot" />
        Head Office &mdash; Horana
      </div>

      {pendingStops.length > 0 && (
        <div className="job-section">
          <h3 className="section-label pending-label">&#128308; Pending Stops</h3>
          {pendingStops.map((stop, i) => renderStop(stop, i + 1))}
        </div>
      )}

      {completedStops.length > 0 && (
        <div className="job-section">
          <h3 className="section-label done-label">&#128993; Completed</h3>
          {completedStops.map((stop, i) => renderStop(stop, i + 1))}
        </div>
      )}
    </div>
  );
};

export default JobList;
