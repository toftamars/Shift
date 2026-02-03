'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { AuthInit } from '@/components/AuthInit';
import { AyarlarPage } from '@/app/pages/AyarlarPage';

export default function AyarlarRoute() {
    return (
        <AuthInit>
            <RequireAuth>
                <AyarlarPage />
            </RequireAuth>
        </AuthInit>
    );
}
