import { addDays, differenceInHours, isSameDay, parseISO } from 'date-fns';

interface Employee {
  id: string;
  maxWeeklyHours: number;
  minRestHours: number;
  skills: string[];
  preferences?: any;
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
  timeOffDates: Map<string, Date[]>; // employeeId -> dates
  existingShifts: GeneratedShift[];
  minStaffPerShift?: number;
  maxStaffPerShift?: number;
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

interface Conflict {
  type: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  description: string;
  shiftId?: string;
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

  /**
   * Ana optimizasyon fonksiyonu
   */
  async optimize(): Promise<OptimizationResult> {
    console.log('🚀 Vardiya optimizasyonu başlatılıyor...');

    // 1. İlk çözümü oluştur (Greedy Algorithm)
    let solution = this.generateInitialSolution();
    console.log(`✅ İlk çözüm oluşturuldu: ${solution.length} vardiya`);

    // 2. Çözümü iyileştir (Simulated Annealing)
    solution = this.improveSolution(solution, {
      maxIterations: 1000,
      initialTemperature: 100,
      coolingRate: 0.95,
    });
    console.log(`✅ Çözüm iyileştirildi`);

    // 3. Çakışmaları tespit et
    const conflicts = this.detectConflicts(solution);
    console.log(`⚠️  ${conflicts.length} çakışma tespit edildi`);

    // 4. Skoru hesapla
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

  /**
   * 1. İLK ÇÖZÜM OLUŞTURMA (Greedy Heuristic)
   */
  private generateInitialSolution(): GeneratedShift[] {
    const shifts: GeneratedShift[] = [];
    const dateRange = this.getDateRange();

    for (const date of dateRange) {
      for (const shiftType of this.config.shiftTypes) {
        // Her vardiya için gereken personel sayısı
        const requiredStaff = this.config.minStaffPerShift || 1;

        // Uygun personelleri bul
        const availableEmployees = this.getAvailableEmployees(date, shifts);

        // Puanlayarak en iyi personelleri seç
        const rankedEmployees = this.rankEmployees(availableEmployees, shiftType, date, shifts);

        // İlk N personeli seç
        const selectedEmployees = rankedEmployees.slice(0, requiredStaff);

        // Vardiya ata
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

  /**
   * 2. ÇÖZÜM İYİLEŞTİRME (Simulated Annealing)
   */
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
      // Komşu çözüm oluştur (rastgele değişiklik)
      const neighborSolution = this.generateNeighbor(currentSolution);
      const neighborScore = this.calculateScore(neighborSolution);

      // Skor farkını hesapla
      const delta = neighborScore - currentScore;

      // Kabul et mi?
      if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
        currentSolution = neighborSolution;
        currentScore = neighborScore;

        // En iyi çözümü güncelle
        if (currentScore > bestScore) {
          bestSolution = [...currentSolution];
          bestScore = currentScore;
        }
      }

      // Sıcaklığı düşür
      temperature *= options.coolingRate;
    }

    return bestSolution;
  }

  /**
   * Komşu çözüm üret (rastgele değişiklik)
   */
  private generateNeighbor(solution: GeneratedShift[]): GeneratedShift[] {
    const neighbor = [...solution];
    const mutationType = Math.random();

    if (mutationType < 0.5 && neighbor.length >= 2) {
      // İki vardiyayı takas et
      const i = Math.floor(Math.random() * neighbor.length);
      const j = Math.floor(Math.random() * neighbor.length);
      [neighbor[i].employeeId, neighbor[j].employeeId] = [neighbor[j].employeeId, neighbor[i].employeeId];
    } else if (neighbor.length > 0) {
      // Bir vardiyayı başka personele ata
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

  /**
   * 3. OPTİMİZASYON SKORU HESAPLAMA (0-100)
   */
  private calculateScore(solution: GeneratedShift[]): number {
    let score = 100;

    // 1. Kısıtlama İhlalleri (-puan)
    const conflicts = this.detectConflicts(solution);
    score -= conflicts.filter((c) => c.severity === 'CRITICAL').length * 20;
    score -= conflicts.filter((c) => c.severity === 'ERROR').length * 10;
    score -= conflicts.filter((c) => c.severity === 'WARNING').length * 5;

    // 2. Adil Dağılım (+puan)
    const fairnessScore = this.calculateFairnessScore(solution);
    score += fairnessScore * 0.3;

    // 3. Kapsama (Coverage) (+puan)
    const coverageScore = this.calculateCoverageScore(solution);
    score += coverageScore * 0.2;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Adalet skoru hesapla (vardiyaların eşit dağılımı)
   */
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

    // Standart sapma düşükse (adil dağılım) yüksek skor
    return Math.max(0, 100 - stdDev * 10);
  }

  /**
   * Kapsama skoru hesapla
   */
  private calculateCoverageScore(solution: GeneratedShift[]): number {
    const requiredShiftCount =
      this.getDateRange().length * this.config.shiftTypes.length * (this.config.minStaffPerShift || 1);
    const actualShiftCount = solution.length;

    return (actualShiftCount / requiredShiftCount) * 100;
  }

  /**
   * 4. ÇAKIŞMA TESPİTİ
   */
  private detectConflicts(solution: GeneratedShift[]): Conflict[] {
    const conflicts: Conflict[] = [];

    for (const shift of solution) {
      // 1. Aynı personele aynı gün birden fazla vardiya
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

      // 2. İzinli günde vardiya
      if (this.isOnTimeOff(shift.employeeId, shift.date)) {
        conflicts.push({
          type: 'CONFLICTS_WITH_TIME_OFF',
          severity: 'CRITICAL',
          description: 'Personelin izin günü ile çakışıyor',
        });
      }

      // 3. Dinlenme süresi kontrolü
      const previousShift = this.getPreviousShift(shift.employeeId, shift.date, solution);
      if (previousShift) {
        const employee = this.config.employees.find((e) => e.id === shift.employeeId);
        const restHours = this.calculateRestHours(previousShift, shift);

        if (employee && restHours < employee.minRestHours) {
          conflicts.push({
            type: 'INSUFFICIENT_REST',
            severity: 'ERROR',
            description: `Yetersiz dinlenme: ${restHours.toFixed(1)} saat (minimum ${
              employee.minRestHours
            } saat)`,
          });
        }
      }

      // 4. Haftalık maksimum saat kontrolü
      const weeklyHours = this.getWeeklyHours(shift.employeeId, shift.date, solution);
      const employee = this.config.employees.find((e) => e.id === shift.employeeId);

      if (employee && weeklyHours > employee.maxWeeklyHours) {
        conflicts.push({
          type: 'EXCESSIVE_HOURS',
          severity: 'WARNING',
          description: `Haftalık maksimum saat aşıldı: ${weeklyHours.toFixed(1)} saat (max ${
            employee.maxWeeklyHours
          })`,
        });
      }
    }

    return conflicts;
  }

  /**
   * YARDIMCI FONKSİYONLAR
   */

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
      // İzinde mi?
      if (this.isOnTimeOff(employee.id, date)) return false;

      // Aynı gün zaten vardiyası var mı?
      const hasShift = shifts.some((s) => s.employeeId === employee.id && isSameDay(s.date, date));
      if (hasShift) return false;

      return true;
    });
  }

  private rankEmployees(
    employees: Employee[],
    shiftType: ShiftType,
    date: Date,
    existingShifts: GeneratedShift[]
  ): (Employee & { score: number })[] {
    return employees
      .map((employee) => {
        let score = 100;

        // Vardiya sayısı dengesi (az vardiyası olana öncelik)
        const shiftCount = existingShifts.filter((s) => s.employeeId === employee.id).length;
        score -= shiftCount * 2;

        // Beceri eşleşmesi
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
    const weekStart = addDays(date, -date.getDay() + 1); // Pazartesi
    const weekEnd = addDays(weekStart, 6); // Pazar

    return shifts
      .filter(
        (s) =>
          s.employeeId === employeeId && s.date >= weekStart && s.date <= weekEnd
      )
      .reduce((total, shift) => {
        const shiftType = this.config.shiftTypes.find((st) => st.id === shift.shiftTypeId);
        return total + (shiftType?.durationHours || 0);
      }, 0);
  }

  private calculateStatistics(solution: GeneratedShift[]) {
    return {
      totalShifts: solution.length,
      employeeUtilization: (solution.length / this.config.employees.length) * 100,
      fairnessScore: this.calculateFairnessScore(solution),
    };
  }
}
