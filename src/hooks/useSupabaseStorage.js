import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabase) {
      loadFromSupabase();
    } else {
      const stored = localStorage.getItem('pomodoro-tasks');
      setTasks(stored ? JSON.parse(stored) : []);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const loadFromSupabase = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setTasks(data.map(t => ({ id: t.id, text: t.text, completed: t.completed })));
    }
    setLoading(false);
  };

  const addTask = async (text) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ text, completed: false })
        .select()
        .single();

      if (!error && data) {
        setTasks(prev => [...prev, { id: data.id, text: data.text, completed: data.completed }]);
      }
    } else {
      setTasks(prev => [...prev, { id: Date.now(), text, completed: false }]);
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (supabase) {
      await supabase.from('tasks').update({ completed: !task.completed }).eq('id', id);
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = async (id) => {
    if (supabase) {
      await supabase.from('tasks').delete().eq('id', id);
    }
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return { tasks, loading, addTask, toggleTask, deleteTask };
}

export function useLoginDates() {
  const [loginDates, setLoginDates] = useState([]);

  useEffect(() => {
    if (supabase) {
      loadFromSupabase();
    } else {
      const stored = localStorage.getItem('pomodoro-login-dates');
      setLoginDates(stored ? JSON.parse(stored) : []);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      localStorage.setItem('pomodoro-login-dates', JSON.stringify(loginDates));
    }
  }, [loginDates]);

  const loadFromSupabase = async () => {
    const { data, error } = await supabase
      .from('login_dates')
      .select('login_date')
      .order('login_date', { ascending: true });

    if (!error && data) {
      setLoginDates(data.map(d => d.login_date));
    }
  };

  const recordLogin = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    if (loginDates.includes(today)) return;

    if (supabase) {
      await supabase
        .from('login_dates')
        .upsert({ login_date: today }, { onConflict: 'login_date' });
    }
    setLoginDates(prev => [...prev, today]);
  }, [loginDates]);

  return { loginDates, recordLogin };
}

export function useFocusSessions() {
  const [sessions, setSessions] = useState([]);
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (supabase) {
      loadFromSupabase();
    } else {
      const stored = localStorage.getItem('pomodoro-focus-sessions');
      const all = stored ? JSON.parse(stored) : [];
      setSessions(all.filter(s => s.startedAt.startsWith(todayStr)));
    }
  }, []);

  const loadFromSupabase = async () => {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .gte('started_at', `${todayStr}T00:00:00`)
      .order('started_at', { ascending: true });

    if (!error && data) {
      setSessions(data.map(s => ({
        id: s.id,
        startedAt: s.started_at,
        endedAt: s.ended_at,
        durationSeconds: s.duration_seconds
      })));
    }
  };

  const addSession = useCallback(async (startedAt, endedAt) => {
    const durationSeconds = Math.round((new Date(endedAt) - new Date(startedAt)) / 1000);
    const newSession = {
      id: Date.now(),
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationSeconds
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({ started_at: startedAt.toISOString(), ended_at: endedAt.toISOString(), duration_seconds: durationSeconds })
        .select()
        .single();

      if (!error && data) {
        setSessions(prev => [...prev, {
          id: data.id,
          startedAt: data.started_at,
          endedAt: data.ended_at,
          durationSeconds: data.duration_seconds
        }]);
      }
    } else {
      const stored = localStorage.getItem('pomodoro-focus-sessions');
      const all = stored ? JSON.parse(stored) : [];
      localStorage.setItem('pomodoro-focus-sessions', JSON.stringify([...all, newSession]));
      setSessions(prev => [...prev, newSession]);
    }
  }, []);

  return { sessions, addSession };
}
