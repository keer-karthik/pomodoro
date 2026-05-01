import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'pomodoro-timer-state';

function loadSaved(totalSessions, sessionDuration) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.totalSessions === totalSessions && saved.sessionDuration === sessionDuration) {
      let { timeRemaining, currentSession, isRunning, isComplete, isSessionComplete, savedAt } = saved;
      if (isRunning) {
        const elapsed = Math.floor((Date.now() - savedAt) / 1000);
        timeRemaining = Math.max(0, timeRemaining - elapsed);
        if (timeRemaining === 0) isRunning = false;
      }
      return { timeRemaining, currentSession, isRunning, isComplete, isSessionComplete };
    }
  } catch {}
  return null;
}

export function useTimer(totalSessions, sessionDuration, onSessionEnd, onAllComplete) {
  const [currentSession, setCurrentSession] = useState(
    () => loadSaved(totalSessions, sessionDuration)?.currentSession ?? 0
  );
  const [timeRemaining, setTimeRemaining] = useState(
    () => loadSaved(totalSessions, sessionDuration)?.timeRemaining ?? sessionDuration * 60
  );
  const [isRunning, setIsRunning] = useState(
    () => loadSaved(totalSessions, sessionDuration)?.isRunning ?? false
  );
  const [isComplete, setIsComplete] = useState(
    () => loadSaved(totalSessions, sessionDuration)?.isComplete ?? false
  );
  const [isSessionComplete, setIsSessionComplete] = useState(
    () => loadSaved(totalSessions, sessionDuration)?.isSessionComplete ?? false
  );
  const intervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      timeRemaining, currentSession, isRunning, isComplete, isSessionComplete,
      totalSessions, sessionDuration, savedAt: Date.now()
    }));
  }, [timeRemaining, currentSession, isRunning, isComplete, isSessionComplete, totalSessions, sessionDuration]);

  // Clear saved state on full unmount (reset), not on "go home" (Timer stays mounted)
  useEffect(() => {
    return () => localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => setIsRunning(prev => !prev), []);

  const startNextSession = useCallback(() => {
    if (currentSession < totalSessions - 1) {
      setCurrentSession(curr => curr + 1);
      setTimeRemaining(sessionDuration * 60);
      setIsSessionComplete(false);
      setIsRunning(false);
    }
  }, [currentSession, totalSessions, sessionDuration]);

  useEffect(() => {
    if (isRunning && !isComplete && !isSessionComplete) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (currentSession < totalSessions - 1) {
              onSessionEnd && onSessionEnd(currentSession);
              setIsSessionComplete(true);
              setIsRunning(false);
              return 0;
            } else {
              setIsComplete(true);
              setIsRunning(false);
              onAllComplete && onAllComplete();
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isRunning, isComplete, isSessionComplete, currentSession, totalSessions, sessionDuration, onSessionEnd, onAllComplete, clearTimer]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    currentSession, timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isRunning, isComplete, isSessionComplete,
    toggle, startNextSession
  };
}
