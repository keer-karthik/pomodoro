import React, { useState } from 'react';

function SetupScreen({ onStart, mode, onModeChange }) {
  const [sessions, setSessions] = useState(3);
  const [duration, setDuration] = useState(25);

  const handleStart = () => {
    if (mode === 'free') {
      onStart(mode);
    } else if (sessions > 0 && duration > 0) {
      onStart(mode, sessions, duration);
    }
  };

  return (
    <div className="setup-screen">
      <div className="mode-toggle">
        <span
          className={`mode-option clickable ${mode === 'structured' ? 'mode-active' : 'mode-inactive'}`}
          onClick={() => onModeChange('structured')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onModeChange('structured')}
        >
          structured
        </span>
        <span className="mode-separator">·</span>
        <span
          className={`mode-option clickable ${mode === 'free' ? 'mode-active' : 'mode-inactive'}`}
          onClick={() => onModeChange('free')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onModeChange('free')}
        >
          free flow
        </span>
      </div>

      <h1 className="page-title">focus time</h1>

      {mode === 'structured' && (
        <>
          <div className="setup-item">
            <div className="setup-question">
              <span>How many focus sessions?</span>
              <input
                type="number"
                className="setup-input"
                value={sessions}
                onChange={(e) => setSessions(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="10"
              />
            </div>
          </div>

          <div className="setup-item">
            <div className="setup-question">
              <span>How long is each session?</span>
              <input
                type="number"
                className="setup-input"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="120"
              />
              <span>minutes</span>
            </div>
          </div>
        </>
      )}

      <span
        className="begin-text clickable bold"
        onClick={handleStart}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
      >
        begin
      </span>
    </div>
  );
}

export default SetupScreen;
