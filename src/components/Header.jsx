import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function Header({ onStatsClick, onAuthClick }) {
  const { user, signOut, supabaseConfigured } = useAuth();

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
    } else {
      onAuthClick();
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src="/logo-green.svg" alt="" className="logo" />
        <span className="site-title">keer's pomodoro</span>
      </div>
      <nav className="nav">
        <span
          className="nav-link clickable"
          onClick={onStatsClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onStatsClick()}
        >
          Stats
        </span>
        {supabaseConfigured && (
          <span
            className="nav-link clickable"
            onClick={handleAuthAction}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleAuthAction()}
          >
            {user ? 'Logout' : 'Login'}
          </span>
        )}
      </nav>
    </header>
  );
}

export default Header;
