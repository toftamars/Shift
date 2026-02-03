'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { AuthInit } from '@/components/AuthInit';
import { VardiyaTurleriPage } from '@/app/pages/VardiyaTurleriPage';

export default function VardiyaTurleriRoute() {
    return (
        <AuthInit>
            <RequireAuth>
                <VardiyaTurleriPage />
            </RequireAuth>
        </AuthInit>
    );
}
