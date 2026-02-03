'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { AuthInit } from '@/components/AuthInit';
import PlannerPage from '@/app/pages/PlannerPage';

export default function HomePage() {
  return (
    <AuthInit>
      <RequireAuth>
        <PlannerPage />
      </RequireAuth>
    </AuthInit>
  );
}
