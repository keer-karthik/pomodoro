import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useLoginTracker() {
  const [loginDates, setLoginDates] = useLocalStorage('pomodoro-login-dates', []);

  const getTodayString = useCallback(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  const recordLogin = useCallback(() => {
    const today = getTodayString();
    if (!loginDates.includes(today)) {
      setLoginDates([...loginDates, today]);
    }
  }, [loginDates, setLoginDates, getTodayString]);

  useEffect(() => {
    recordLogin();
  }, []);

  const getCalendarData = useCallback(() => {
    const weeks = 6;
    const days = weeks * 7;
    const calendar = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      calendar.push({
        date: dateString,
        active: loginDates.includes(dateString),
        dayOfWeek: date.getDay()
      });
    }

    return calendar;
  }, [loginDates]);

  return {
    loginDates,
    recordLogin,
    getCalendarData
  };
}
