import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'pomodoro-freetimer-state';

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      let { elapsedSeconds, isRunning, startedAt, savedAt } = saved;
      if (isRunning) {
        const elapsed = Math.floor((Date.now() - savedAt) / 1000);
        elapsedSeconds = elapsedSeconds + elapsed;
      }
      return { elapsedSeconds, isRunning, startedAt: startedAt ? new Date(startedAt) : null };
    }
  } catch {}
  return null;
}

export function useFreeTimer() {
  const saved = loadSaved();
  const [elapsedSeconds, setElapsedSeconds] = useState(saved?.elapsedSeconds ?? 0);
  const [isRunning, setIsRunning] = useState(saved?.isRunning ?? false);
  const startedAtRef = useRef(saved?.startedAt ?? null);
  const intervalRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isRunning, clearTimer]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      elapsedSeconds,
      isRunning,
      startedAt: startedAtRef.current?.toISOString() ?? null,
      savedAt: Date.now()
    }));
  }, [elapsedSeconds, isRunning]);

  useEffect(() => {
    return () => localStorage.removeItem(STORAGE_KEY);
  }, []);

  const start = useCallback(() => {
    if (!startedAtRef.current) startedAtRef.current = new Date();
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => setIsRunning(false), []);

  const stop = useCallback(() => {
    setIsRunning(false);
    const endedAt = new Date();
    const startedAt = startedAtRef.current || endedAt;
    const result = { startedAt, endedAt, durationSeconds: elapsedSeconds };
    startedAtRef.current = null;
    setElapsedSeconds(0);
    localStorage.removeItem(STORAGE_KEY);
    return result;
  }, [elapsedSeconds]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    isRunning,
    hasStarted: startedAtRef.current !== null || elapsedSeconds > 0,
    start, pause, stop
  };
}
