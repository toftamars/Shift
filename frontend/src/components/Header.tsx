import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface HeaderProps {
    startDate: Date;
    endDate: Date;
}

export const Header: React.FC<HeaderProps> = ({ startDate }) => {
    const [addHint, setAddHint] = useState(false);

    const handleAddClick = () => {
        setAddHint(true);
        setTimeout(() => setAddHint(false), 3000);
    };

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
                {addHint && (
                    <span role="status" aria-live="polite" style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                        Vardiya ekleme yakında
                    </span>
                )}
                <button
                    type="button"
                    className="btn-premium"
                    aria-label="Vardiya ekle"
                    onClick={handleAddClick}
                >
                    Ekle <Plus size={18} aria-hidden="true" />
                </button>
            </div>
        </header>
    );
};
