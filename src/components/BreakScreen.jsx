import React from 'react';

function BreakScreen({ sessionNumber, onContinue }) {
  return (
    <div className="break-overlay">
      <div className="break-content">
        <div className="break-timer">00:00</div>
        <span className="break-session-label">session {sessionNumber}</span>
        <p className="break-message">good job! take a break</p>
      </div>
      <span
        className="break-continue clickable"
        onClick={onContinue}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onContinue()}
      >
        ready to jump back in?
      </span>
    </div>
  );
}

export default BreakScreen;
