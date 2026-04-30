import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const newUser = session?.user ?? null;

        if (_event === 'SIGNED_IN' && newUser) {
          await migrateLocalData(newUser.id);
        }

        setUser(newUser);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const migrateLocalData = async (userId) => {
    const localTasks = localStorage.getItem('pomodoro-tasks');
    if (localTasks) {
      const tasks = JSON.parse(localTasks);
      for (const task of tasks) {
        await supabase.from('tasks').insert({
          user_id: userId,
          text: task.text,
          completed: task.completed
        });
      }
      localStorage.removeItem('pomodoro-tasks');
    }

    const localDates = localStorage.getItem('pomodoro-login-dates');
    if (localDates) {
      const dates = JSON.parse(localDates);
      for (const date of dates) {
        await supabase.from('login_dates').upsert(
          { user_id: userId, login_date: date },
          { onConflict: 'user_id,login_date' }
        );
      }
      localStorage.removeItem('pomodoro-login-dates');
    }
  };

  const signUp = async (email, password) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signIn = async (email, password) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, supabaseConfigured: !!supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
