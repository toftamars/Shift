import React from 'react';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface HeaderProps {
    startDate: Date;
    endDate: Date;
}

export const Header: React.FC<HeaderProps> = ({ startDate }) => {
    return (
        <header>
            <div>
                <div className="mono" style={{ marginBottom: '8px' }}>Studio / Planning</div>
                <h1 className="studio-title">
                    SHIFT <span>STUDIO</span>
                </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <div style={{ textAlign: 'right' }}>
                    <div className="mono">Dikey Matris</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 300 }}>
                        {format(startDate, 'LLLL yyyy', { locale: tr })}
                    </div>
                </div>
                <button className="btn-premium">
                    Ekle <Plus size={18} />
                </button>
            </div>
        </header>
    );
};
