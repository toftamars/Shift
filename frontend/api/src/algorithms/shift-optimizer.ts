import { addDays, differenceInHours, isSameDay } from 'date-fns';

interface Employee {
  id: string;
  maxWeeklyHours: number;
  minRestHours: number;
  skills: string[];
  preferences?: Record<string, unknown>;
}

interface ShiftType {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  requiredSkills?: string[];
}

interface GeneratedShift {
  employeeId: string;
  shiftTypeId: string;
  date: Date;
  startTime: string;
  endTime: string;
  score: number;
}

interface OptimizationConfig {
  employees: Employee[];
  shiftTypes: ShiftType[];
  startDate: Date;
  endDate: Date;
  timeOffDates: Map<string, Date[]>;
  existingShifts: GeneratedShift[];
  minStaffPerShift?: number;
  maxStaffPerShift?: number;
}

interface Conflict {
  type: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  description: string;
  shiftId?: string;
}

interface OptimizationResult {
  success: boolean;
  score: number;
  shifts: GeneratedShift[];
  conflicts: Conflict[];
  statistics: {
    totalShifts: number;
    employeeUtilization: number;
    fairnessScore: number;
  };
}

/**
 * ANA OPTİMİZASYON SERVİSİ
 * Constraint Satisfaction Problem (CSP) + Simulated Annealing
 */
export class ShiftOptimizer {
  private config: OptimizationConfig;

  constructor(config: OptimizationConfig) {
    this.config = config;
  }

  async optimize(): Promise<OptimizationResult> {
    console.log('🚀 Vardiya optimizasyonu başlatılıyor...');

    let solution = this.generateInitialSolution();
    console.log(`✅ İlk çözüm oluşturuldu: ${solution.length} vardiya`);

    solution = this.improveSolution(solution, {
      maxIterations: 1000,
      initialTemperature: 100,
      coolingRate: 0.95,
    });
    console.log('✅ Çözüm iyileştirildi');

    const conflicts = this.detectConflicts(solution);
    console.log(`⚠️  ${conflicts.length} çakışma tespit edildi`);

    const score = this.calculateScore(solution);
    console.log(`📊 Optimizasyon skoru: ${score.toFixed(2)}/100`);

    return {
      success: conflicts.filter((c) => c.severity === 'CRITICAL').length === 0,
      score,
      shifts: solution,
      conflicts,
      statistics: this.calculateStatistics(solution),
    };
  }

  private generateInitialSolution(): GeneratedShift[] {
    const shifts: GeneratedShift[] = [];
    const dateRange = this.getDateRange();

    for (const date of dateRange) {
      for (const shiftType of this.config.shiftTypes) {
        const requiredStaff = this.config.minStaffPerShift || 1;
        const availableEmployees = this.getAvailableEmployees(date, shifts);
        const rankedEmployees = this.rankEmployees(availableEmployees, shiftType, date, shifts);
        const selectedEmployees = rankedEmployees.slice(0, requiredStaff);

        for (const employee of selectedEmployees) {
          shifts.push({
            employeeId: employee.id,
            shiftTypeId: shiftType.id,
            date,
            startTime: shiftType.startTime,
            endTime: shiftType.endTime,
            score: employee.score,
          });
        }
      }
    }

    return shifts;
  }

  private improveSolution(
    initialSolution: GeneratedShift[],
    options: { maxIterations: number; initialTemperature: number; coolingRate: number }
  ): GeneratedShift[] {
    let currentSolution = [...initialSolution];
    let currentScore = this.calculateScore(currentSolution);
    let bestSolution = [...currentSolution];
    let bestScore = currentScore;
    let temperature = options.initialTemperature;

    for (let i = 0; i < options.maxIterations; i++) {
      const neighborSolution = this.generateNeighbor(currentSolution);
      const neighborScore = this.calculateScore(neighborSolution);
      const delta = neighborScore - currentScore;

      if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
        currentSolution = neighborSolution;
        currentScore = neighborScore;

        if (currentScore > bestScore) {
          bestSolution = [...currentSolution];
          bestScore = currentScore;
        }
      }

      temperature *= options.coolingRate;
    }

    return bestSolution;
  }

  private generateNeighbor(solution: GeneratedShift[]): GeneratedShift[] {
    const neighbor = [...solution];
    const mutationType = Math.random();

    if (mutationType < 0.5 && neighbor.length >= 2) {
      const i = Math.floor(Math.random() * neighbor.length);
      const j = Math.floor(Math.random() * neighbor.length);
      [neighbor[i].employeeId, neighbor[j].employeeId] = [neighbor[j].employeeId, neighbor[i].employeeId];
    } else if (neighbor.length > 0) {
      const i = Math.floor(Math.random() * neighbor.length);
      const availableEmployees = this.config.employees.filter(
        (e) => !this.isOnTimeOff(e.id, neighbor[i].date)
      );
      if (availableEmployees.length > 0) {
        const randomEmployee = availableEmployees[Math.floor(Math.random() * availableEmployees.length)];
        neighbor[i].employeeId = randomEmployee.id;
      }
    }

    return neighbor;
  }

  private calculateScore(solution: GeneratedShift[]): number {
    let score = 100;

    const conflicts = this.detectConflicts(solution);
    score -= conflicts.filter((c) => c.severity === 'CRITICAL').length * 20;
    score -= conflicts.filter((c) => c.severity === 'ERROR').length * 10;
    score -= conflicts.filter((c) => c.severity === 'WARNING').length * 5;

    const fairnessScore = this.calculateFairnessScore(solution);
    score += fairnessScore * 0.3;

    const coverageScore = this.calculateCoverageScore(solution);
    score += coverageScore * 0.2;

    return Math.max(0, Math.min(100, score));
  }

  private calculateFairnessScore(solution: GeneratedShift[]): number {
    const shiftCounts = new Map<string, number>();

    for (const shift of solution) {
      shiftCounts.set(shift.employeeId, (shiftCounts.get(shift.employeeId) || 0) + 1);
    }

    const counts = Array.from(shiftCounts.values());
    if (counts.length === 0) return 0;

    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(0, 100 - stdDev * 10);
  }

  private calculateCoverageScore(solution: GeneratedShift[]): number {
    const requiredShiftCount =
      this.getDateRange().length * this.config.shiftTypes.length * (this.config.minStaffPerShift || 1);
    const actualShiftCount = solution.length;

    return (actualShiftCount / requiredShiftCount) * 100;
  }

  private detectConflicts(solution: GeneratedShift[]): Conflict[] {
    const conflicts: Conflict[] = [];

    for (const shift of solution) {
      const sameDay = solution.filter(
        (s) => s.employeeId === shift.employeeId && isSameDay(s.date, shift.date) && s !== shift
      );

      if (sameDay.length > 0) {
        conflicts.push({
          type: 'DOUBLE_BOOKING',
          severity: 'CRITICAL',
          description: `Personele aynı gün ${sameDay.length + 1} vardiya atanmış`,
        });
      }

      if (this.isOnTimeOff(shift.employeeId, shift.date)) {
        conflicts.push({
          type: 'CONFLICTS_WITH_TIME_OFF',
          severity: 'CRITICAL',
          description: 'Personelin izin günü ile çakışıyor',
        });
      }

      const previousShift = this.getPreviousShift(shift.employeeId, shift.date, solution);
      if (previousShift) {
        const employee = this.config.employees.find((e) => e.id === shift.employeeId);
        const restHours = this.calculateRestHours(previousShift, shift);

        if (employee && restHours < employee.minRestHours) {
          conflicts.push({
            type: 'INSUFFICIENT_REST',
            severity: 'ERROR',
            description: `Yetersiz dinlenme: ${restHours.toFixed(1)} saat (minimum ${employee.minRestHours} saat)`,
          });
        }
      }

      const weeklyHours = this.getWeeklyHours(shift.employeeId, shift.date, solution);
      const employee = this.config.employees.find((e) => e.id === shift.employeeId);

      if (employee && weeklyHours > employee.maxWeeklyHours) {
        conflicts.push({
          type: 'EXCESSIVE_HOURS',
          severity: 'WARNING',
          description: `Haftalık maksimum saat aşıldı: ${weeklyHours.toFixed(1)} saat (max ${employee.maxWeeklyHours})`,
        });
      }
    }

    return conflicts;
  }

  private getDateRange(): Date[] {
    const dates: Date[] = [];
    let currentDate = this.config.startDate;

    while (currentDate <= this.config.endDate) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }

    return dates;
  }

  private getAvailableEmployees(date: Date, shifts: GeneratedShift[]): Employee[] {
    return this.config.employees.filter((employee) => {
      if (this.isOnTimeOff(employee.id, date)) return false;
      const hasShift = shifts.some((s) => s.employeeId === employee.id && isSameDay(s.date, date));
      if (hasShift) return false;
      return true;
    });
  }

  private rankEmployees(
    employees: Employee[],
    shiftType: ShiftType,
    _date: Date,
    existingShifts: GeneratedShift[]
  ): (Employee & { score: number })[] {
    return employees
      .map((employee) => {
        let score = 100;
        const shiftCount = existingShifts.filter((s) => s.employeeId === employee.id).length;
        score -= shiftCount * 2;
        if (shiftType.requiredSkills && shiftType.requiredSkills.length > 0) {
          const matchingSkills = shiftType.requiredSkills.filter((skill) =>
            employee.skills.includes(skill)
          ).length;
          score += (matchingSkills / shiftType.requiredSkills.length) * 20;
        }
        return { ...employee, score };
      })
      .sort((a, b) => b.score - a.score);
  }

  private isOnTimeOff(employeeId: string, date: Date): boolean {
    const timeOffDates = this.config.timeOffDates.get(employeeId);
    if (!timeOffDates) return false;
    return timeOffDates.some((d) => isSameDay(d, date));
  }

  private getPreviousShift(
    employeeId: string,
    date: Date,
    shifts: GeneratedShift[]
  ): GeneratedShift | undefined {
    const employeeShifts = shifts
      .filter((s) => s.employeeId === employeeId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    const currentIndex = employeeShifts.findIndex((s) => isSameDay(s.date, date));
    return currentIndex > 0 ? employeeShifts[currentIndex - 1] : undefined;
  }

  private calculateRestHours(previousShift: GeneratedShift, currentShift: GeneratedShift): number {
    const prevEnd = new Date(previousShift.date.toDateString() + ' ' + previousShift.endTime);
    const currStart = new Date(currentShift.date.toDateString() + ' ' + currentShift.startTime);
    return differenceInHours(currStart, prevEnd);
  }

  private getWeeklyHours(employeeId: string, date: Date, shifts: GeneratedShift[]): number {
    const weekStart = addDays(date, -date.getDay() + 1);
    const weekEnd = addDays(weekStart, 6);

    return shifts
      .filter((s) => s.employeeId === employeeId && s.date >= weekStart && s.date <= weekEnd)
      .reduce((total, shift) => {
        const shiftType = this.config.shiftTypes.find((st) => st.id === shift.shiftTypeId);
        return total + (shiftType?.durationHours || 0);
      }, 0);
  }

  private calculateStatistics(solution: GeneratedShift[]) {
    return {
      totalShifts: solution.length,
      employeeUtilization: this.config.employees.length > 0
        ? (solution.length / this.config.employees.length) * 100
        : 0,
      fairnessScore: this.calculateFairnessScore(solution),
    };
  }
}
