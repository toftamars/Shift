'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { AuthInit } from '@/components/AuthInit';
import { PersonelPage } from '@/app/pages/PersonelPage';

export default function PersonelRoute() {
    return (
        <AuthInit>
            <RequireAuth>
                <PersonelPage />
            </RequireAuth>
        </AuthInit>
    );
}
