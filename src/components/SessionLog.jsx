import React from 'react';

function formatTimeLabel(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
}

function formatTotal(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h} h ${m} min`;
  if (h > 0) return `${h} h`;
  return `${m} min`;
}

function SessionLog({ sessions }) {
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);

  return (
    <div className="task-section session-log-section">
      <h2 className="task-header">today</h2>
      {sessions.length === 0 ? (
        <p className="session-log-empty">no sessions yet</p>
      ) : (
        <>
          <ul className="session-log-list">
            {sessions.map(s => (
              <li key={s.id} className="session-log-entry">
                <span className="session-log-range">
                  {formatTimeLabel(s.startedAt)} — {formatTimeLabel(s.endedAt)}
                </span>
                <span className="session-log-duration">· {formatDuration(s.durationSeconds)}</span>
              </li>
            ))}
          </ul>
          <p className="session-log-total">total · {formatTotal(totalSeconds)}</p>
        </>
      )}
    </div>
  );
}

export default SessionLog;
