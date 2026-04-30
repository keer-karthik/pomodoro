import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import SetupScreen from './components/SetupScreen';
import Timer from './components/Timer';
import TaskList from './components/TaskList';
import Stats from './components/Stats';
import AuthModal from './components/AuthModal';
import { useLoginDates } from './hooks/useSupabaseStorage';

function App() {
  const [screen, setScreen] = useState('setup');
  const [config, setConfig] = useState({ sessions: 3, duration: 25 });
  const [isFlashing, setIsFlashing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const audioRef = useRef(null);

  const { recordLogin } = useLoginDates();

  useEffect(() => {
    recordLogin();
  }, [recordLogin]);

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
    } catch (e) {
      console.log('Audio not supported');
    }
  }, []);

  const flashScreen = useCallback(() => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);
  }, []);

  const handleStart = (sessions, duration) => {
    setConfig({ sessions, duration });
    setScreen('timer');
  };

  const handleSessionEnd = useCallback(() => {
    playNotification();
    flashScreen();
  }, [playNotification, flashScreen]);

  const handleAllComplete = useCallback(() => {
    playNotification();
    flashScreen();
  }, [playNotification, flashScreen]);

  const handleReset = () => {
    setScreen('setup');
  };

  return (
    <div className={`app ${isFlashing ? 'flash' : ''}`}>
      <Header onStatsClick={() => setShowStats(true)} onAuthClick={() => setShowAuth(true)} />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showStats && <Stats onClose={() => setShowStats(false)} />}
      {screen === 'setup' ? (
        <SetupScreen onStart={handleStart} />
      ) : (
        <div className="main-screen">
          <Timer
            totalSessions={config.sessions}
            sessionDuration={config.duration}
            onSessionEnd={handleSessionEnd}
            onAllComplete={handleAllComplete}
            onReset={handleReset}
          />
          <TaskList />
        </div>
      )}
    </div>
  );
}

export default App;
