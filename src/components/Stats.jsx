import React from 'react';
import { useLoginDates } from '../hooks/useSupabaseStorage';

function Stats({ onClose }) {
  const { loginDates } = useLoginDates();

  const getMonthData = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const calendar = [];

    // Add empty cells for days before the 1st
    for (let i = 0; i < startDayOfWeek; i++) {
      calendar.push({ date: null, active: false, dayNum: null });
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      calendar.push({
        date: dateString,
        active: loginDates.includes(dateString),
        dayNum: day
      });
    }

    // Fill remaining cells to complete the last week
    const remainingCells = 7 - (calendar.length % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        calendar.push({ date: null, active: false, dayNum: null });
      }
    }

    return calendar;
  };

  const getMonthName = () => {
    const today = new Date();
    return today.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const calendar = getMonthData();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const weeks = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }

  return (
    <div className="stats-overlay">
      <div className="stats-panel">
        <div className="stats-header">
          <h2 className="stats-title">Stats</h2>
          <span
            className="stats-close clickable"
            onClick={onClose}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClose()}
          >
            &gt;
          </span>
        </div>
        <div className="stats-month">{getMonthName()}</div>
        <div className="stats-calendar">
          <div className="stats-week stats-day-labels">
            {dayLabels.map((label) => (
              <div key={label} className="stats-day-label">{label}</div>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="stats-week">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`stats-day ${day.active ? 'active' : ''} ${day.date === null ? 'empty' : ''}`}
                  title={day.date || ''}
                >
                  {day.dayNum}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Stats;