import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Command, LayoutGrid, Users, Zap, Settings, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logout } from '../store/authSlice';

export const Sidebar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

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
            <button type="button" className="sidebar-icon active" aria-label="Planlama" style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>
                <LayoutGrid size={24} />
            </button>
            <button type="button" className="sidebar-icon" aria-label="Personel" style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>
                <Users size={24} />
            </button>
            <button type="button" className="sidebar-icon" aria-label="Vardiya türleri" style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>
                <Zap size={24} />
            </button>
            <div style={{ marginTop: 'auto' }}>
                <button type="button" className="sidebar-icon" aria-label="Ayarlar" style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>
                    <Settings size={24} />
                </button>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="sidebar-icon"
                    aria-label="Çıkış yap"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
                >
                    <LogOut size={24} aria-hidden="true" />
                </button>
            </div>
        </nav>
    );
};
