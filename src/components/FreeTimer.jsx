import React, { useState } from 'react';
import SessionLog from './SessionLog';
import FocusSummary from './FocusSummary';
import { useFreeTimer } from '../hooks/useFreeTimer';
import { useFocusSessions } from '../hooks/useSupabaseStorage';

function FreeTimer({ onReset }) {
  const { formattedTime, isRunning, hasStarted, start, pause, stop } = useFreeTimer();
  const { sessions, addSession } = useFocusSessions();
  const [showSummary, setShowSummary] = useState(false);

  const handleStop = async () => {
    const { startedAt, endedAt } = stop();
    if (endedAt - startedAt > 1000) {
      await addSession(startedAt, endedAt);
    }
  };

  const handleEndFocus = async () => {
    if (isRunning || hasStarted) {
      await handleStop();
    }
    setShowSummary(true);
  };

  const handleSummaryClose = () => {
    setShowSummary(false);
    onReset();
  };

  return (
    <>
      {showSummary && (
        <FocusSummary sessions={sessions} onClose={handleSummaryClose} />
      )}

      <div className="main-screen">
        <div className="timer-section">
          <div className="free-timer-elapsed timer-block active">
            <span className="timer-time">{formattedTime}</span>
          </div>

          <div className="timer-controls">
            {!isRunning ? (
              <span
                className="timer-control-text clickable"
                onClick={start}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && start()}
              >
                {hasStarted ? 'resume' : 'start'}
              </span>
            ) : (
              <span
                className="timer-control-text clickable"
                onClick={pause}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && pause()}
              >
                pause
              </span>
            )}

            {hasStarted && (
              <span
                className="timer-control-text clickable"
                onClick={handleStop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleStop()}
              >
                stop session
              </span>
            )}
          </div>

          <div className="free-timer-end">
            <span
              className="timer-control-text clickable"
              onClick={handleEndFocus}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleEndFocus()}
            >
              end focus
            </span>
          </div>
        </div>

        <SessionLog sessions={sessions} />
      </div>
    </>
  );
}

export default FreeTimer;
