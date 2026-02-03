'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { supabase } from '@/lib/supabase';
import { setAuth } from '@/store/authSlice';
import type { User } from '@/store/authSlice';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) throw authError;
            if (!data.session?.user) throw new Error('Oturum açılamadı');

            const u = data.session.user;
            const user: User = {
                id: u.id,
                email: u.email ?? '',
                fullName: u.user_metadata?.full_name ?? u.email ?? '',
                role: u.user_metadata?.role ?? 'EMPLOYEE',
            };
            dispatch(setAuth({ token: data.session.access_token, user }));
            router.push('/');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Giriş başarısız';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            padding: 20,
        }}>
            <form onSubmit={handleSubmit} style={{
                width: '100%',
                maxWidth: 360,
                padding: 32,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
                <h1 style={{ margin: '0 0 24px', color: '#fff', fontSize: '1.5rem', textAlign: 'center' }}>
                    Vardiya Planlama
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textAlign: 'center', marginBottom: 24 }}>
                    Giriş yapın
                </p>
                {error ? (
                    <div
                        id="login-error"
                        role="alert"
                        aria-live="polite"
                        style={{
                            padding: '10px 12px',
                            marginBottom: 16,
                            background: 'rgba(239,68,68,0.2)',
                            color: '#fca5a5',
                            borderRadius: 8,
                            fontSize: '0.875rem',
                        }}
                    >
                        {error}
                    </div>
                ) : null}
                <label htmlFor="login-email" style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                    E-posta
                </label>
                <input
                    id="login-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    spellCheck={false}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'login-error' : undefined}
                    style={{
                        width: '100%',
                        padding: '12px 14px',
                        marginBottom: 16,
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                    }}
                />
                <label htmlFor="login-password" style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                    Şifre
                </label>
                <input
                    id="login-password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    aria-invalid={!!error}
                    style={{
                        width: '100%',
                        padding: '12px 14px',
                        marginBottom: 24,
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                    }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    aria-busy={loading}
                    aria-label={loading ? 'Giriş yapılıyor' : 'Giriş yap'}
                    style={{
                        width: '100%',
                        padding: 14,
                        border: 'none',
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                    }}
                >
                    {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
                </button>
            </form>
        </div>
    );
}
