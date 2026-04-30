import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && supabase) {
      loadFromSupabase();
    } else {
      const stored = localStorage.getItem('pomodoro-tasks');
      setTasks(stored ? JSON.parse(stored) : []);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks));
    }
  }, [tasks, user]);

  const loadFromSupabase = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setTasks(data.map(t => ({
        id: t.id,
        text: t.text,
        completed: t.completed
      })));
    }
    setLoading(false);
  };

  const addTask = async (text) => {
    const newTask = { id: Date.now(), text, completed: false };

    if (user && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ user_id: user.id, text, completed: false })
        .select()
        .single();

      if (!error && data) {
        setTasks(prev => [...prev, { id: data.id, text: data.text, completed: data.completed }]);
      }
    } else {
      setTasks(prev => [...prev, newTask]);
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (user && supabase) {
      await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', id);
    }

    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = async (id) => {
    if (user && supabase) {
      await supabase.from('tasks').delete().eq('id', id);
    }
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return { tasks, loading, addTask, toggleTask, deleteTask };
}

export function useLoginDates() {
  const { user } = useAuth();
  const [loginDates, setLoginDates] = useState([]);

  useEffect(() => {
    if (user && supabase) {
      loadFromSupabase();
    } else {
      const stored = localStorage.getItem('pomodoro-login-dates');
      setLoginDates(stored ? JSON.parse(stored) : []);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('pomodoro-login-dates', JSON.stringify(loginDates));
    }
  }, [loginDates, user]);

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

    if (user && supabase) {
      await supabase
        .from('login_dates')
        .upsert({ user_id: user.id, login_date: today }, { onConflict: 'user_id,login_date' });
    }

    setLoginDates(prev => [...prev, today]);
  }, [user, loginDates]);

  return { loginDates, recordLogin };
}
