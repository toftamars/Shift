import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Command, LayoutGrid, Users, Zap, Settings, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logout } from '../store/authSlice';

const btnStyle: React.CSSProperties = { background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' };

export const Sidebar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [hint, setHint] = useState<string | null>(null);

    const isPlanner = location.pathname === '/';

    const showHint = (msg: string) => {
        setHint(msg);
        setTimeout(() => setHint(null), 2500);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        dispatch(logout());
        navigate('/login', { replace: true });
    };

    return (
        <nav className="sidebar" aria-label="Ana menü">
            <div className="logo" aria-hidden="true">
                <Command size={24} />
            </div>
            <button
                type="button"
                className={`sidebar-icon ${isPlanner ? 'active' : ''}`}
                aria-label="Planlama"
                style={btnStyle}
                onClick={() => navigate('/')}
            >
                <LayoutGrid size={24} aria-hidden="true" />
            </button>
            <button
                type="button"
                className="sidebar-icon"
                aria-label="Personel"
                style={btnStyle}
                onClick={() => showHint('Personel yakında')}
            >
                <Users size={24} aria-hidden="true" />
            </button>
            <button
                type="button"
                className="sidebar-icon"
                aria-label="Vardiya türleri"
                style={btnStyle}
                onClick={() => showHint('Vardiya türleri yakında')}
            >
                <Zap size={24} aria-hidden="true" />
            </button>
            <div style={{ marginTop: 'auto', position: 'relative' }}>
                {hint && (
                    <div
                        role="status"
                        aria-live="polite"
                        style={{
                            position: 'absolute',
                            left: '100%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            marginLeft: 12,
                            padding: '6px 10px',
                            background: 'var(--panel)',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                            color: 'var(--text-dim)',
                            zIndex: 100,
                        }}
                    >
                        {hint}
                    </div>
                )}
                <button
                    type="button"
                    className="sidebar-icon"
                    aria-label="Ayarlar"
                    style={btnStyle}
                    onClick={() => showHint('Ayarlar yakında')}
                >
                    <Settings size={24} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="sidebar-icon"
                    aria-label="Çıkış yap"
                    style={btnStyle}
                >
                    <LogOut size={24} aria-hidden="true" />
                </button>
            </div>
        </nav>
    );
};
