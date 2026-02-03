import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '../lib/supabase';
import { setAuth, logout } from '../store/authSlice';
import type { User } from '../store/authSlice';

export function AuthInit({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const user: User = {
          id: u.id,
          email: u.email ?? '',
          fullName: u.user_metadata?.full_name ?? u.email ?? '',
          role: u.user_metadata?.role ?? 'EMPLOYEE',
        };
        dispatch(setAuth({ token: session.access_token, user }));
      } else {
        dispatch(logout());
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) dispatch(logout());
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}
