import { useState, useMemo } from 'react';
import { startOfWeek, addDays, isSameDay } from 'date-fns';
import type { Employee, Shift } from '../types';

export const useShiftPlanner = (initialEmployees: Employee[], initialShifts: Shift[]) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [employees] = useState<Employee[]>(initialEmployees);
    const [shifts] = useState<Shift[]>(initialShifts);

    const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }, [currentDate]);

    const getShiftsForDay = (employeeId: string | number, day: Date) => {
        return shifts.filter(s => s.employeeId === employeeId && isSameDay(s.day, day));
    };

    return {
        currentDate,
        setCurrentDate,
        weekDays,
        employees,
        getShiftsForDay,
        startDate: weekDays[0],
        endDate: weekDays[6]
    };
};
