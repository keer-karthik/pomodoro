import React from 'react';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h} h ${m} min`;
  if (h > 0) return `${h} h`;
  return `${m} min`;
}

function FocusSummary({ sessions, onClose }) {
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const count = sessions.length;

  return (
    <div className="break-overlay focus-summary-overlay">
      <div className="break-content focus-summary-content">
        <h2 className="focus-summary-title">today's focus</h2>
        <p className="focus-summary-stats">
          {count} {count === 1 ? 'session' : 'sessions'} · {formatDuration(totalSeconds)}
        </p>
      </div>
      <span
        className="break-continue clickable"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
      >
        begin again
      </span>
    </div>
  );
}

export default FocusSummary;
