import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, Building2, Zap, Settings, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logout } from '../store/authSlice';

const btnStyle: React.CSSProperties = { background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' };

export const Sidebar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isPlanner = location.pathname === '/';
    const isPersonel = location.pathname === '/personel';
    const isDepartmanlar = location.pathname === '/departmanlar';
    const isVardiyaTurleri = location.pathname === '/vardiya-turleri';
    const isAyarlar = location.pathname === '/ayarlar';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        dispatch(logout());
        navigate('/login', { replace: true });
    };

    return (
        <nav className="sidebar" aria-label="Ana menü">
            <button
                type="button"
                className={`sidebar-icon ${isPlanner ? 'active' : ''}`}
                aria-label="Planlama"
                style={btnStyle}
                onClick={() => {
                    if (isPlanner) {
                        document.querySelector('.content-grid-wrapper')?.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        navigate('/');
                    }
                }}
            >
                <LayoutGrid size={24} aria-hidden="true" />
            </button>
            <button
                type="button"
                className={`sidebar-icon ${isPersonel ? 'active' : ''}`}
                aria-label="Personel"
                style={btnStyle}
                onClick={() => navigate('/personel')}
            >
                <Users size={24} aria-hidden="true" />
            </button>
            <button
                type="button"
                className={`sidebar-icon ${isDepartmanlar ? 'active' : ''}`}
                aria-label="Departmanlar"
                style={btnStyle}
                onClick={() => navigate('/departmanlar')}
            >
                <Building2 size={24} aria-hidden="true" />
            </button>
            <button
                type="button"
                className={`sidebar-icon ${isVardiyaTurleri ? 'active' : ''}`}
                aria-label="Vardiya türleri"
                style={btnStyle}
                onClick={() => navigate('/vardiya-turleri')}
            >
                <Zap size={24} aria-hidden="true" />
            </button>
            <div style={{ marginTop: 'auto' }}>
                <button
                    type="button"
                    className={`sidebar-icon ${isAyarlar ? 'active' : ''}`}
                    aria-label="Ayarlar"
                    style={btnStyle}
                    onClick={() => navigate('/ayarlar')}
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
