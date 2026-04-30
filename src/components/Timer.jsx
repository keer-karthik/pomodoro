import React, { useRef, useEffect, useCallback } from 'react';
import TimerBlock from './TimerBlock';
import BreakScreen from './BreakScreen';
import { useTimer } from '../hooks/useTimer';

function Timer({ totalSessions, sessionDuration, onSessionEnd, onAllComplete, onReset }) {
  const {
    currentSession,
    formattedTime,
    isRunning,
    isComplete,
    isSessionComplete,
    toggle,
    startNextSession
  } = useTimer(totalSessions, sessionDuration, onSessionEnd, onAllComplete);

  const pipWindowRef = useRef(null);
  const toggleRef = useRef(toggle);
  toggleRef.current = toggle;

  const pipSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  const openPip = useCallback(async () => {
    if (!pipSupported) return;

    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.close();
      pipWindowRef.current = null;
      return;
    }

    const pipWindow = await window.documentPictureInPicture.requestWindow({
      width: 300,
      height: 200
    });

    pipWindowRef.current = pipWindow;

    const style = pipWindow.document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
      body {
        margin: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #FDFBCA;
        color: #2D4721;
        font-family: 'EB Garamond', Georgia, serif;
        user-select: none;
      }
      .pip-time {
        font-size: 4rem;
        font-style: italic;
        line-height: 1;
      }
      .pip-session {
        font-size: 1rem;
        margin-top: 0.5rem;
        opacity: 0.7;
      }
      .pip-toggle {
        margin-top: 1rem;
        font-size: 1.25rem;
        color: #822349;
        cursor: pointer;
        border: none;
        background: none;
        font-family: inherit;
      }
      .pip-toggle:hover {
        text-decoration: underline;
        text-underline-offset: 4px;
      }
    `;
    pipWindow.document.head.appendChild(style);

    pipWindow.document.body.innerHTML = `
      <div class="pip-time" id="pip-time"></div>
      <div class="pip-session" id="pip-session"></div>
      <button class="pip-toggle" id="pip-toggle"></button>
    `;

    pipWindow.document.getElementById('pip-toggle').addEventListener('click', () => {
      toggleRef.current();
    });

    pipWindow.addEventListener('pagehide', () => {
      pipWindowRef.current = null;
    });
  }, [pipSupported]);

  // Sync timer state into PiP window
  useEffect(() => {
    const pip = pipWindowRef.current;
    if (!pip || pip.closed) return;

    const timeEl = pip.document.getElementById('pip-time');
    const sessionEl = pip.document.getElementById('pip-session');
    const toggleEl = pip.document.getElementById('pip-toggle');

    if (timeEl) timeEl.textContent = formattedTime;
    if (sessionEl) sessionEl.textContent = `session ${currentSession + 1} of ${totalSessions}`;
    if (toggleEl) toggleEl.textContent = isRunning ? 'pause' : 'start';
  }, [formattedTime, isRunning, currentSession, totalSessions]);

  // Close PiP on unmount (e.g., reset)
  useEffect(() => {
    return () => {
      if (pipWindowRef.current && !pipWindowRef.current.closed) {
        pipWindowRef.current.close();
      }
    };
  }, []);

  const getSessionStatus = (index) => {
    if (index < currentSession) return 'completed';
    if (index === currentSession) return 'active';
    return 'upcoming';
  };

  const formatDuration = (minutes) => {
    return minutes.toString().padStart(2, '0');
  };

  return (
    <>
      {isSessionComplete && !isComplete && (
        <BreakScreen
          sessionNumber={currentSession + 1}
          onContinue={startNextSession}
        />
      )}

      <div className="timer-section">
        <div className="timer-blocks">
          {Array.from({ length: totalSessions }, (_, index) => (
            <TimerBlock
              key={index}
              sessionNumber={index + 1}
              status={getSessionStatus(index)}
              time={formattedTime}
              duration={formatDuration(sessionDuration)}
            />
          ))}
        </div>

        {!isComplete && !isSessionComplete && (
          <div className="timer-controls">
            <span
              className="timer-control-text clickable"
              onClick={toggle}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggle()}
            >
              {isRunning ? 'pause' : 'start'}
            </span>
            {pipSupported && (
              <span
                className="timer-control-text pip-link clickable"
                onClick={openPip}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openPip()}
              >
                pip
              </span>
            )}
          </div>
        )}

        {isComplete && (
          <div className="timer-complete">
            <span
              className="clickable"
              onClick={onReset}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onReset()}
            >
              all sessions complete — start again?
            </span>
          </div>
        )}
      </div>
    </>
  );
}

export default Timer;
