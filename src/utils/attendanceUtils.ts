import {
  Subject,
  AttendanceRecord,
  TeachingDay,
  SubjectStats,
  MonthlyStats,
  SemesterSettings,
} from '../types';

export function calculateRecovery(present: number, conducted: number, target: number = 100): number {
  if (conducted === 0) return 0;
  const currentPct = (present / conducted) * 100;
  if (currentPct >= target) return 0;
  // If target is 100%, each missed class permanently prevents 100%,
  // but we calculate classes needed to reach 99% or nearest high threshold
  const effectiveTarget = target >= 100 ? 99 : target;
  const t = effectiveTarget / 100;
  const numerator = t * conducted - present;
  const denominator = 1 - t;
  if (denominator <= 0) return 0;
  const needed = Math.ceil(numerator / denominator);
  return Math.max(0, needed);
}

export function calculateMarginOfSafety(present: number, conducted: number, target: number = 100): number {
  if (conducted === 0) return 0;
  if (target >= 100) {
    // For 100%, missing any class drops you below 100%
    return present === conducted ? 0 : 0;
  }
  const t = target / 100;
  const currentPct = (present / conducted) * 100;
  if (currentPct < target) return 0;
  const maxConducted = present / t;
  const safe = Math.floor(maxConducted - conducted);
  return Math.max(0, safe);
}

export function computeSubjectStats(
  subject: Subject,
  records: AttendanceRecord[],
  target: number = 100
): SubjectStats {
  const subjectRecords = records.filter((r) => r.subjectId === subject.id);
  const presentCount = subjectRecords.filter((r) => r.status === 'present').length;
  const absentCount = subjectRecords.filter((r) => r.status === 'absent').length;
  const cancelledCount = subjectRecords.filter((r) => r.status === 'cancelled').length;
  const totalConducted = presentCount + absentCount;

  const percentage = totalConducted > 0 ? (presentCount / totalConducted) * 100 : 100;
  const isAboveTarget = totalConducted === 0 || (target >= 100 ? absentCount === 0 : percentage >= target);
  const recoveryNeeded = calculateRecovery(presentCount, totalConducted, target);
  const marginOfSafety = calculateMarginOfSafety(presentCount, totalConducted, target);

  return {
    subject,
    totalConducted,
    presentCount,
    absentCount,
    cancelledCount,
    percentage: Number(percentage.toFixed(1)),
    isAboveTarget,
    recoveryNeeded,
    marginOfSafety,
  };
}

export function computeOverallStats(subjects: Subject[], records: AttendanceRecord[], target: number = 100) {
  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const cancelled = records.filter((r) => r.status === 'cancelled').length;
  const conducted = present + absent;
  const percentage = conducted > 0 ? (present / conducted) * 100 : 100;

  return {
    totalConducted: conducted,
    presentCount: present,
    absentCount: absent,
    cancelledCount: cancelled,
    percentage: Number(percentage.toFixed(1)),
    isAboveTarget: conducted === 0 || (target >= 100 ? absent === 0 : percentage >= target),
    recoveryNeeded: calculateRecovery(present, conducted, target),
    marginOfSafety: calculateMarginOfSafety(present, conducted, target),
  };
}

export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function generateTeachingDaysRange(
  startDateStr: string,
  endDateStr: string,
  activeDaysOfWeek: number[] = [1, 2, 3, 4, 5] // Mon-Fri
): Record<string, TeachingDay> {
  const result: Record<string, TeachingDay> = {};
  const current = parseDate(startDateStr);
  const end = parseDate(endDateStr);

  while (current <= end) {
    const dateStr = formatDate(current);
    const dayOfWeek = current.getDay();
    const isTeaching = activeDaysOfWeek.includes(dayOfWeek);

    result[dateStr] = {
      date: dateStr,
      isTeachingDay: isTeaching,
      label: isTeaching ? 'Regular Class Day' : dayOfWeek === 0 || dayOfWeek === 6 ? 'Weekend' : 'Off Day',
    };

    current.setDate(current.getDate() + 1);
  }

  return result;
}

export function getAvailableMonths(
  startDateStr: string,
  endDateStr: string
): { key: string; label: string; year: number; month: number }[] {
  const start = parseDate(startDateStr);
  const end = parseDate(endDateStr);
  const list: { key: string; label: string; year: number; month: number }[] = [];

  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cur <= last) {
    const y = cur.getFullYear();
    const m = cur.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    list.push({
      key,
      label: `${MONTH_NAMES[m]} ${y}`,
      year: y,
      month: m,
    });
    cur.setMonth(cur.getMonth() + 1);
  }

  return list;
}

export function computeMonthlyStats(
  year: number,
  monthIndex: number,
  subjects: Subject[],
  records: AttendanceRecord[],
  teachingDays: Record<string, TeachingDay>,
  target: number = 90
): MonthlyStats {
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  const monthName = `${MONTH_NAMES[monthIndex]} ${year}`;

  // Filter records for this month
  const monthRecords = records.filter((r) => r.date.startsWith(monthKey));

  // Count teaching days in this month
  const totalTeachingDays = (Object.values(teachingDays) as TeachingDay[]).filter(
    (td) => td.date.startsWith(monthKey) && td.isTeachingDay
  ).length;

  const totalPresent = monthRecords.filter((r) => r.status === 'present').length;
  const totalAbsent = monthRecords.filter((r) => r.status === 'absent').length;
  const totalCancelled = monthRecords.filter((r) => r.status === 'cancelled').length;
  const totalConducted = totalPresent + totalAbsent;
  const overallPercentage = totalConducted > 0 ? Number(((totalPresent / totalConducted) * 100).toFixed(1)) : 100;

  const subjectBreakdowns = subjects.map((subj) => {
    const sRecords = monthRecords.filter((r) => r.subjectId === subj.id);
    const pres = sRecords.filter((r) => r.status === 'present').length;
    const abs = sRecords.filter((r) => r.status === 'absent').length;
    const canc = sRecords.filter((r) => r.status === 'cancelled').length;
    const cond = pres + abs;
    const pct = cond > 0 ? Number(((pres / cond) * 100).toFixed(1)) : 100;
    const recovery = calculateRecovery(pres, cond, subj.targetPercentage || target);

    return {
      subject: subj,
      conducted: cond,
      present: pres,
      absent: abs,
      cancelled: canc,
      percentage: pct,
      recoveryNeeded: recovery,
    };
  });

  return {
    monthKey,
    monthName,
    year,
    monthIndex,
    totalTeachingDays,
    totalConducted,
    totalPresent,
    totalAbsent,
    totalCancelled,
    overallPercentage,
    subjectBreakdowns,
  };
}

// Initial Clean Semester Settings (Empty subjects & records by default)
export const DEFAULT_SEMESTER: SemesterSettings = {
  name: 'Semester 1',
  startDate: '2026-08-01',
  endDate: '2026-12-31',
  defaultTarget: 100,
  regularWeeklyTeachingDays: [1, 2, 3, 4, 5],
};

export const DEFAULT_SUBJECTS: Subject[] = [];

export function createSampleDemoData() {
  const subjects: Subject[] = [];
  const teachingDays: Record<string, TeachingDay> = {};
  const records: AttendanceRecord[] = [];

  return { subjects, teachingDays, records, semester: DEFAULT_SEMESTER };
}

export const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string; ring: string }> = {
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    ring: 'stroke-emerald-500',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    ring: 'stroke-indigo-500',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    ring: 'stroke-blue-500',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    ring: 'stroke-amber-500',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    ring: 'stroke-rose-500',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    ring: 'stroke-purple-500',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
    badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
    ring: 'stroke-cyan-500',
  },
};
