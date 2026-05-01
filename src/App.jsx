import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import SetupScreen from './components/SetupScreen';
import Timer from './components/Timer';
import TaskList from './components/TaskList';
import FreeTimer from './components/FreeTimer';
import Stats from './components/Stats';
import WorldClock from './components/WorldClock';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useLoginDates } from './hooks/useSupabaseStorage';

function App() {
  const [mode, setMode] = useLocalStorage('pomodoro-mode', 'structured');
  const [config, setConfig] = useLocalStorage('pomodoro-config', { sessions: 3, duration: 25 });
  const [timerActive, setTimerActive] = useLocalStorage('pomodoro-timer-active', false);

  // Restore to timer screen if timer was active
  const [screen, setScreen] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pomodoro-timer-active')) ? 'timer' : 'setup';
    } catch { return 'setup'; }
  });

  const [isFlashing, setIsFlashing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showClock, setShowClock] = useState(false);

  const { recordLogin } = useLoginDates();
  useEffect(() => { recordLogin(); }, [recordLogin]);

  const playNotification = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {}
  }, []);

  const flashScreen = useCallback(() => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);
  }, []);

  const handleStart = (selectedMode, sessions, duration) => {
    if (selectedMode === 'free') {
      setTimerActive(true);
      setScreen('timer');
    } else {
      setConfig({ sessions, duration });
      setTimerActive(true);
      setScreen('timer');
    }
  };

  // Logo click: go to setup but keep timer running (Timer stays mounted, PiP auto-opens)
  const handleHome = () => setScreen('setup');

  // Full reset: unmount timer (clears localStorage state), return to setup fresh
  const handleReset = () => {
    setTimerActive(false);
    setScreen('setup');
  };

  const handleSessionEnd = useCallback(() => {
    playNotification();
    flashScreen();
  }, [playNotification, flashScreen]);

  const handleAllComplete = useCallback(() => {
    playNotification();
    flashScreen();
  }, [playNotification, flashScreen]);

  const timerKey = `${config.sessions}-${config.duration}`;

  return (
    <div className={`app ${isFlashing ? 'flash' : ''}`}>
      <Header
        onHomeClick={handleHome}
        onStatsClick={() => setShowStats(true)}
        onClockClick={() => setShowClock(true)}
      />
      {showStats && <Stats onClose={() => setShowStats(false)} />}
      {showClock && <WorldClock onClose={() => setShowClock(false)} />}

      {screen === 'setup' && (
        <SetupScreen onStart={handleStart} mode={mode} onModeChange={setMode} />
      )}

      {/* Structured timer: stays mounted when going home so interval and PiP keep running */}
      {timerActive && mode === 'structured' && (
        <div className={`main-screen${screen !== 'timer' ? ' hidden' : ''}`}>
          <Timer
            key={timerKey}
            totalSessions={config.sessions}
            sessionDuration={config.duration}
            onSessionEnd={handleSessionEnd}
            onAllComplete={handleAllComplete}
            onReset={handleReset}
            hidden={screen !== 'timer'}
          />
          <TaskList />
        </div>
      )}

      {/* Free-flow timer: stays mounted when going home */}
      {timerActive && mode === 'free' && (
        <div className={screen !== 'timer' ? 'hidden' : ''}>
          <FreeTimer onReset={handleReset} />
        </div>
      )}
    </div>
  );
}

export default App;
