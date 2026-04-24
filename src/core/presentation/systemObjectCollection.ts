import type { AppBootstrapData, AttendanceRecord, Faculty, Student, Subject, TimeLog } from '@/core/contracts/models';
import { getPayrollPeriod, resolvePeriodLabel } from '@/core/utils/payrollPeriod';
import { adminService } from '@/core/api/adminService';

export interface ExpenditureTrendPoint {
  id: string;
  rawDate: string;
  date: string;
  standardPay: number;
  overtimePay: number;
}

export interface GradePopulationPoint {
  name: string;
  population: number;
}

export interface SubjectCoveragePoint {
  subjectCode: string;
  subjectName: string;
  enrolledStudents: number;
  assignedFaculty: number;
}

export interface AttendanceStatusPoint {
  status: 'Present' | 'Absent';
  count: number;
}

export interface PayrollProjection {
  currentPeriodLabel: string;
  currentPeriodRange: { start: string; end: string };
  upcomingPayoutDay: number;
  upcomingPayoutProjection: number;
}

export interface SystemMasterSummary {
  totalFaculty: number;
  totalStudents: number;
  totalSubjects: number;
  totalTimeLogs: number;
  totalAttendanceRecords: number;
  totalHoursTracked: number;
  overtimeHoursTracked: number;
  totalPayrollSpend: number;
  averageHourlyRate: number;
  attendanceRatePercent: number;
}

export interface SystemModuleSlices {
  faculty: Faculty[];
  students: Student[];
  subjects: Subject[];
  records: {
    timeLogs: TimeLog[];
    attendance: AttendanceRecord[];
  };
  payroll: {
    entries: TimeLog[];
    projection: PayrollProjection;
  };
  dashboard: {
    kpis: SystemMasterSummary;
    recentTimeLogs: TimeLog[];
  };
}

export interface SystemVisualizations {
  expenditureTrend: ExpenditureTrendPoint[];
  populationPerGrade: GradePopulationPoint[];
  attendanceByStatus: AttendanceStatusPoint[];
  subjectCoverage: SubjectCoveragePoint[];
}

export interface SystemObjectCollection {
  generatedAt: string;
  master: SystemMasterSummary;
  slices: SystemModuleSlices;
  visualizations: SystemVisualizations;
}

const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const getPayoutDateFromPeriodLabel = (periodLabel: string) => {
  const [start = '', end = ''] = periodLabel.split('_to_');
  const startDate = parseIsoDate(start);
  const endDate = parseIsoDate(end);
  const payoutDay = startDate.getDate() === 26 ? 15 : 30;
  return new Date(endDate.getFullYear(), endDate.getMonth(), payoutDay);
};

const round2 = (value: number) => Number(value.toFixed(2));

const buildExpenditureTrend = (timeLogs: TimeLog[], referenceDate: Date): ExpenditureTrendPoint[] => {
  const currentMonth = referenceDate.getMonth();
  const currentYear = referenceDate.getFullYear();
  const expenditureByDate = new Map<string, { rawDate: string; date: string; standardPay: number; overtimePay: number }>();

  timeLogs.forEach((log) => {
    const periodLabel = resolvePeriodLabel(log.date, log.periodLabel);
    const payoutDate = getPayoutDateFromPeriodLabel(periodLabel);
    if (payoutDate.getMonth() !== currentMonth || payoutDate.getFullYear() !== currentYear) return;

    const rawDate = payoutDate.toISOString().split('T')[0];
    const formattedDate = payoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const hourlyRate = log.isOvertime ? log.hourlyRate * 1.5 : log.hourlyRate;
    const logCost = log.hours * hourlyRate;
    const existing = expenditureByDate.get(rawDate) ?? { rawDate, date: formattedDate, standardPay: 0, overtimePay: 0 };

    if (log.isOvertime) existing.overtimePay += logCost;
    else existing.standardPay += logCost;

    expenditureByDate.set(rawDate, existing);
  });

  return Array.from(expenditureByDate.values())
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
    .map((entry, index) => ({
      id: `trend-${index}`,
      ...entry,
      standardPay: round2(entry.standardPay),
      overtimePay: round2(entry.overtimePay),
    }));
};

const buildPopulationPerGrade = (students: Student[]): GradePopulationPoint[] =>
  ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((grade) => ({
    name: grade,
    population: students.filter((student) => student.gradeLevel === grade).length,
  }));

const buildSubjectCoverage = (subjects: Subject[], students: Student[]): SubjectCoveragePoint[] =>
  subjects.map((subject) => ({
    subjectCode: subject.code,
    subjectName: subject.name,
    enrolledStudents: students.filter((student) => student.subjects.includes(subject.code)).length,
    assignedFaculty: subject.facultyId ? 1 : 0,
  }));

const buildAttendanceByStatus = (attendance: AttendanceRecord[]): AttendanceStatusPoint[] => {
  const present = attendance.filter((record) => record.status === 'Present').length;
  const absent = attendance.length - present;
  return [
    { status: 'Present', count: present },
    { status: 'Absent', count: absent },
  ];
};

const buildMasterSummary = (data: AppBootstrapData): SystemMasterSummary => {
  const totalHoursTracked = data.timeLogs.reduce((sum, log) => sum + log.hours, 0);
  const overtimeHoursTracked = data.timeLogs.filter((log) => log.isOvertime).reduce((sum, log) => sum + log.hours, 0);
  const totalPayrollSpend = data.timeLogs.reduce((sum, log) => {
    const hourlyRate = log.isOvertime ? log.hourlyRate * 1.5 : log.hourlyRate;
    return sum + log.hours * hourlyRate;
  }, 0);
  const totalRate = data.faculty.reduce((sum, member) => sum + member.hourlyRate, 0);
  const presentCount = data.attendance.filter((record) => record.status === 'Present').length;
  const attendanceRatePercent = data.attendance.length > 0 ? (presentCount / data.attendance.length) * 100 : 0;

  return {
    totalFaculty: data.faculty.length,
    totalStudents: data.students.length,
    totalSubjects: data.subjects.length,
    totalTimeLogs: data.timeLogs.length,
    totalAttendanceRecords: data.attendance.length,
    totalHoursTracked: round2(totalHoursTracked),
    overtimeHoursTracked: round2(overtimeHoursTracked),
    totalPayrollSpend: round2(totalPayrollSpend),
    averageHourlyRate: data.faculty.length ? round2(totalRate / data.faculty.length) : 0,
    attendanceRatePercent: round2(attendanceRatePercent),
  };
};

const buildProjection = (timeLogs: TimeLog[], referenceDate: Date): PayrollProjection => {
  const currentPeriod = getPayrollPeriod(referenceDate);
  const currentDay = referenceDate.getDate();
  const upcomingPayoutDay = currentDay >= 11 && currentDay <= 25 ? 30 : 15;
  const upcomingPeriodLogs = timeLogs.filter((log) => resolvePeriodLabel(log.date, log.periodLabel) === currentPeriod.label);
  const upcomingPayoutProjection = upcomingPeriodLogs.reduce((sum, log) => {
    const hourlyRate = log.isOvertime ? log.hourlyRate * 1.5 : log.hourlyRate;
    return sum + log.hours * hourlyRate;
  }, 0);

  return {
    currentPeriodLabel: currentPeriod.label,
    currentPeriodRange: { start: currentPeriod.start, end: currentPeriod.end },
    upcomingPayoutDay,
    upcomingPayoutProjection: round2(upcomingPayoutProjection),
  };
};

export const buildSystemObjectCollection = (
  data: AppBootstrapData,
  options?: { referenceDate?: Date; generatedAt?: string }
): SystemObjectCollection => {
  const referenceDate = options?.referenceDate ?? new Date();
  const master = buildMasterSummary(data);
  const projection = buildProjection(data.timeLogs, referenceDate);
  const visualizations: SystemVisualizations = {
    expenditureTrend: buildExpenditureTrend(data.timeLogs, referenceDate),
    populationPerGrade: buildPopulationPerGrade(data.students),
    attendanceByStatus: buildAttendanceByStatus(data.attendance),
    subjectCoverage: buildSubjectCoverage(data.subjects, data.students),
  };

  return {
    generatedAt: options?.generatedAt ?? new Date().toISOString(),
    master,
    slices: {
      faculty: data.faculty,
      students: data.students,
      subjects: data.subjects,
      records: {
        timeLogs: data.timeLogs,
        attendance: data.attendance,
      },
      payroll: {
        entries: data.timeLogs,
        projection,
      },
      dashboard: {
        kpis: master,
        recentTimeLogs: data.timeLogs.slice(0, 5),
      },
    },
    visualizations,
  };
};

export const buildSystemObjectCollectionFromBootstrap = async (
  options?: { referenceDate?: Date; generatedAt?: string }
) => {
  const data = await adminService.getBootstrapData();
  return buildSystemObjectCollection(data, options);
};
