'use client';
import React from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface HeaderProps {
    startDate: Date;
    endDate: Date;
    children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ startDate, children }) => {
    return (
        <header>
            <div>
                <div className="mono" style={{ marginBottom: '8px' }}>Studio / Planning</div>
                <h1 className="studio-title">
                    SHIFT <span>STUDIO</span>
                </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                {children}
                <div style={{ textAlign: 'right' }}>
                    <div className="mono">Dikey Matris</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 300 }}>
                        {format(startDate, 'LLLL yyyy', { locale: tr })}
                    </div>
                </div>
            </div>
        </header>
    );
};
