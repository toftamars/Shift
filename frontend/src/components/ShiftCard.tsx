'use client';
import React from 'react';
import type { Shift } from '../types';

interface ShiftCardProps {
    shift: Shift;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({ shift }) => {
    // shift types normally have colors, we'll pass it through or fetch it.
    // Assuming the shift object now has a color_code from the API.
    const backgroundColor = (shift as any).color_code || '#FFFFFF';
    const isDark = backgroundColor === '#F44336' || backgroundColor === '#3F51B5'; // Red or Dark Blue

    return (
        <div
            className="shift-card-simple"
            style={{
                backgroundColor: backgroundColor,
                color: isDark ? '#FFFFFF' : '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                fontWeight: 700,
                fontSize: '1rem',
                border: '1px solid rgba(0,0,0,0.1)'
            }}
        >
            {shift.name || shift.startTime?.slice(0, 5)}
        </div>
    );
};
