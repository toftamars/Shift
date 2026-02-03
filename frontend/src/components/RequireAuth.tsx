'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router, pathname]);

  if (!token) {
    return null;
  }

  return <>{children}</>;
}
