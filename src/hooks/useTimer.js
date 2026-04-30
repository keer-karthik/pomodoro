import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(totalSessions, sessionDuration, onSessionEnd, onAllComplete) {
  const [currentSession, setCurrentSession] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(sessionDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const intervalRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const toggle = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const startNextSession = useCallback(() => {
    if (currentSession < totalSessions - 1) {
      setCurrentSession(curr => curr + 1);
      setTimeRemaining(sessionDuration * 60);
      setIsSessionComplete(false);
      setIsRunning(false);
    }
  }, [currentSession, totalSessions, sessionDuration]);

  useEffect(() => {
    setTimeRemaining(sessionDuration * 60);
  }, [sessionDuration]);

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
    currentSession,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isRunning,
    isComplete,
    isSessionComplete,
    start,
    pause,
    toggle,
    startNextSession
  };
}
