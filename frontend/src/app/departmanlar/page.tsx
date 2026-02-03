'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { AuthInit } from '@/components/AuthInit';
import { DepartmanlarPage } from '@/app/pages/DepartmanlarPage';

export default function DepartmanlarRoute() {
    return (
        <AuthInit>
            <RequireAuth>
                <DepartmanlarPage />
            </RequireAuth>
        </AuthInit>
    );
}
