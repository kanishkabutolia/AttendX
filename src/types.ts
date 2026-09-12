export type AttendanceStatus = 'present' | 'absent' | 'cancelled';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // Tailwind color theme identifier (e.g., 'emerald', 'indigo', 'blue', 'amber', 'rose', 'purple')
  targetPercentage: number; // e.g. 100
  credits?: number;
  scheduledDays?: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  status: AttendanceStatus;
  notes?: string;
  timestamp?: number;
}

export interface TeachingDay {
  date: string; // YYYY-MM-DD
  isTeachingDay: boolean;
  label?: string; // e.g., 'Regular Class', 'Holiday', 'Exam Day', 'Semester Break'
}

export interface SemesterSettings {
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  defaultTarget: number; // default 100
  regularWeeklyTeachingDays: number[]; // e.g., [1, 2, 3, 4, 5] (Mon-Fri)
}

export interface SemesterData {
  id: string; // e.g., 'sem-5', 'sem-6'
  number: number; // e.g., 5, 6
  name: string; // e.g., 'Semester 5', 'Semester 6'
  startDate: string;
  endDate: string;
  subjects: Subject[];
  records: AttendanceRecord[];
  teachingDays: Record<string, TeachingDay>;
  createdAt?: number;
}

export interface SubjectStats {
  subject: Subject;
  totalConducted: number; // present + absent
  presentCount: number;
  absentCount: number;
  cancelledCount: number;
  percentage: number;
  isAboveTarget: boolean;
  recoveryNeeded: number; // Consecutive future classes needed to hit target %
  marginOfSafety: number; // Classes can be missed before falling below target %
}

export interface MonthlyStats {
  monthKey: string; // YYYY-MM
  monthName: string;
  year: number;
  monthIndex: number; // 0-11
  totalTeachingDays: number;
  totalConducted: number;
  totalPresent: number;
  totalAbsent: number;
  totalCancelled: number;
  overallPercentage: number;
  subjectBreakdowns: {
    subject: Subject;
    conducted: number;
    present: number;
    absent: number;
    cancelled: number;
    percentage: number;
    recoveryNeeded: number;
  }[];
}
