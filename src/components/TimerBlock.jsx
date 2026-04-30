import React from 'react';

function TimerBlock({ sessionNumber, status, time, duration }) {
  const getClassName = () => {
    let className = 'timer-block';
    if (status === 'active') className += ' active';
    else if (status === 'completed') className += ' completed';
    else className += ' upcoming';
    return className;
  };

  const displayTime = status === 'active' ? time : `${duration}:00`;

  return (
    <div className={getClassName()}>
      <span className="timer-time">{displayTime}</span>
      <span className="session-label">session {sessionNumber}</span>
    </div>
  );
}

export default TimerBlock;
