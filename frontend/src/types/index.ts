export interface Employee {
    id: string | number;
    name: string;
    role: string;
    avatar?: string;
}

export interface Shift {
    id: string | number;
    employeeId: string | number;
    day: Date;
    startTime: string;
    endTime: string;
    type?: string;
}

export interface ShiftPlannerState {
    currentDate: Date;
    employees: Employee[];
    shifts: Shift[];
}
