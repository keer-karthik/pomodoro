import React, { useState, useEffect } from 'react';

const ZONES = [
  { label: 'Los Angeles', tz: 'America/Los_Angeles' },
  { label: 'New York', tz: 'America/New_York' },
  { label: 'India', tz: 'Asia/Kolkata' },
  { label: 'Amsterdam', tz: 'Europe/Amsterdam' },
  { label: 'Singapore', tz: 'Asia/Singapore' },
];

const WMO = {
  0: 'clear sky', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'foggy', 48: 'foggy', 51: 'light drizzle', 53: 'drizzle', 55: 'heavy drizzle',
  61: 'light rain', 63: 'rain', 65: 'heavy rain',
  71: 'light snow', 73: 'snow', 75: 'heavy snow',
  80: 'light showers', 81: 'showers', 82: 'heavy showers',
  95: 'thunderstorm',
};

function formatZone(tz, now) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true
  }).format(now).toLowerCase();
}

function WorldClock({ onClose }) {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=37.3688&longitude=-122.0363&current=temperature_2m,weather_code&temperature_unit=fahrenheit')
      .then(r => r.json())
      .then(data => {
        const temp = Math.round(data.current.temperature_2m);
        const desc = WMO[data.current.weather_code] ?? 'cloudy';
        setWeather({ temp, desc });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="stats-overlay">
      <div className="stats-panel">
        <div className="stats-header">
          <h2 className="stats-title">World Clock</h2>
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

        {weather && (
          <div className="world-clock-weather">
            <div className="world-clock-location">Sunnyvale, CA</div>
            <div>{weather.temp}° · {weather.desc}</div>
          </div>
        )}

        <div className="world-clock-rows">
          {ZONES.map(({ label, tz }) => (
            <div key={tz} className="world-clock-row">
              <span className="world-clock-time">{formatZone(tz, now)}</span>
              <span className="world-clock-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorldClock;
