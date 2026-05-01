import React from 'react';

function Header({ onStatsClick }) {
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
      </nav>
    </header>
  );
}

export default Header;
