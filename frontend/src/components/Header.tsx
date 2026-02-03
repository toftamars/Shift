import React from 'react';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface HeaderProps {
    startDate: Date;
    endDate: Date;
    onAddShift?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ startDate, onAddShift }) => {
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
                <button
                    type="button"
                    className="btn-premium"
                    aria-label="Vardiya ekle"
                    onClick={onAddShift}
                >
                    Ekle <Plus size={18} aria-hidden="true" />
                </button>
            </div>
        </header>
    );
};
