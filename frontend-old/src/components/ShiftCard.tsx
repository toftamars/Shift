import React from 'react';
import type { Shift } from '../types';

interface ShiftCardProps {
    shift: Shift;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({ shift }) => {
    return (
        <div className="shift-card">
            <div className="mono" style={{ fontSize: '8px' }}>Session</div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', marginTop: '4px' }}>
                {shift.startTime} — {shift.endTime}
            </div>
        </div>
    );
};
