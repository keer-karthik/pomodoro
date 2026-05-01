import React from 'react';

function Header({ onHomeClick, onStatsClick, onClockClick }) {
  return (
    <header className="header">
      <div className="header-left">
        <span
          className="clickable"
          onClick={onHomeClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onHomeClick()}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <img src="/logo-green.svg" alt="home" className="logo" />
          <span className="site-title">keer's pomodoro</span>
        </span>
      </div>
      <nav className="nav">
        <span
          className="nav-link clickable"
          onClick={onClockClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onClockClick()}
        >
          Clock
        </span>
        <span
          className="nav-link clickable"
          onClick={onStatsClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onStatsClick()}
        >
          Stats
        </span>
      </nav>
    </header>
  );
}

export default Header;
