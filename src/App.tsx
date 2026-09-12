import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  Plus,
  ArrowRight,
  Sparkles,
  BookOpen,
  Filter,
  CheckCheck,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';

import {
  Subject,
  AttendanceRecord,
  TeachingDay,
  SemesterSettings,
  SubjectStats,
  SemesterData,
} from './types';
import {
  computeSubjectStats,
  computeOverallStats,
  formatDate,
  parseDate,
  DEFAULT_SEMESTER,
  DEFAULT_SUBJECTS,
} from './utils/attendanceUtils';

import { Navbar, NavTab } from './components/Navbar';
import { SubjectCard } from './components/SubjectCard';
import { DailyAttendanceMarking } from './components/DailyAttendanceMarking';
import { MonthlyReport } from './components/MonthlyReport';
import { TeachingDaysPlanner } from './components/TeachingDaysPlanner';
import { RecoverySimulator } from './components/RecoverySimulator';
import { AddSubjectModal } from './components/AddSubjectModal';
import { AddSemesterModal } from './components/AddSemesterModal';
import { DeleteSemesterModal } from './components/DeleteSemesterModal';

const STORAGE_KEYS = {
  SEMESTERS: 'student_attendance_semesters_v2',
  ACTIVE_SEM: 'student_attendance_active_sem_v2',
  SUBJECTS: 'student_attendance_subjects_v1',
  RECORDS: 'student_attendance_records_v1',
  TEACHING_DAYS: 'student_attendance_teaching_days_v1',
  SEMESTER: 'student_attendance_semester_v1',
};

const createCleanSemester = (): SemesterData => ({
  id: 'sem-1',
  number: 1,
  name: 'Semester 1',
  startDate: '2026-08-01',
  endDate: '2026-12-31',
  subjects: [],
  records: [],
  teachingDays: {},
  createdAt: Date.now(),
});

const isDemoSubject = (s: Subject) =>
  ['subj-1', 'subj-2', 'subj-3', 'subj-4', 'subj-5'].includes(s.id) ||
  ['CS-301', 'CS-302', 'CS-303', 'CS-304', 'MATH-201'].includes(s.code);

const cleanSemesterData = (sem: SemesterData): SemesterData => {
  const isDemo =
    sem.id === 'sem-5' &&
    (!sem.subjects || sem.subjects.length === 0 || sem.subjects.every(isDemoSubject));

  if (isDemo) {
    return {
      ...sem,
      id: 'sem-1',
      number: 1,
      name: sem.name === 'Semester 5' ? 'Semester 1' : sem.name,
      subjects: [],
      records: [],
      teachingDays: {},
    };
  }

  const realSubjects = (sem.subjects || []).filter((s) => !isDemoSubject(s));
  const realSubjectIds = new Set(realSubjects.map((s) => s.id));
  const realRecords = (sem.records || []).filter((r) => realSubjectIds.has(r.subjectId));

  return {
    ...sem,
    subjects: realSubjects,
    records: realRecords,
  };
};

const getInitialSemesters = (): SemesterData[] => {
  try {
    // Purge legacy demo-only storage keys
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.TEACHING_DAYS);
    localStorage.removeItem(STORAGE_KEYS.SEMESTER);

    const saved = localStorage.getItem(STORAGE_KEYS.SEMESTERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = parsed.map(cleanSemesterData);
        localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(cleaned));
        return cleaned;
      }
    }
    const initial = [createCleanSemester()];
    localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(initial));
    return initial;
  } catch (e) {
    console.error(e);
    return [createCleanSemester()];
  }
};

export default function App() {
  const [semesters, setSemesters] = useState<SemesterData[]>(getInitialSemesters);
  const [activeSemesterId, setActiveSemesterId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SEM);
      if (saved && saved !== 'sem-5') return saved;
    } catch (e) {}
    return 'sem-1';
  });

  // Current active semester data
  const currentSemester =
    semesters.find((s) => s.id === activeSemesterId) || semesters[0] || getInitialSemesters()[0];

  const subjects = currentSemester.subjects || [];
  const records = currentSemester.records || [];
  const teachingDays = currentSemester.teachingDays || {};
  const semesterSettings: SemesterSettings = {
    name: currentSemester.name,
    startDate: currentSemester.startDate,
    endDate: currentSemester.endDate,
    defaultTarget: 100,
    regularWeeklyTeachingDays: [1, 2, 3, 4, 5],
  };

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [simulatorSubjectId, setSimulatorSubjectId] = useState<string | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddSemesterModalOpen, setIsAddSemesterModalOpen] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState<SemesterData | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [dashboardFilter, setDashboardFilter] = useState<'all' | 'hasAbsence' | 'perfect'>('all');
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);

  // Persist semesters and active semester
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(semesters));
    } catch (e) {
      console.error(e);
    }
  }, [semesters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SEM, activeSemesterId);
    } catch (e) {
      console.error(e);
    }
  }, [activeSemesterId]);

  // Helper to update current semester
  const updateCurrentSemester = (updater: (prev: SemesterData) => Partial<SemesterData>) => {
    setSemesters((prevSemesters) => {
      const targetId = currentSemester.id;
      return prevSemesters.map((sem) => {
        if (sem.id === targetId) {
          const updates = updater(sem);
          return { ...sem, ...updates };
        }
        return sem;
      });
    });
  };

  // Overall Statistics calculated on a 100% scale
  const overallStats = computeOverallStats(subjects, records, 100);
  const subjectStatsList: SubjectStats[] = subjects.map((subj) =>
    computeSubjectStats(subj, records, 100)
  );

  const subjectsWithAbsence = subjectStatsList.filter((s) => s.absentCount > 0);
  const subjectsPerfect = subjectStatsList.filter((s) => s.absentCount === 0);

  // Quick mark today
  const handleMarkToday = (subjectId: string, status: 'present' | 'absent') => {
    const todayStr = formatDate(new Date('2026-09-12'));
    handleUpdateRecord(todayStr, subjectId, status);
  };

  // Generic record update
  const handleUpdateRecord = (
    date: string,
    subjectId: string,
    status: 'present' | 'absent' | 'cancelled',
    note?: string
  ) => {
    updateCurrentSemester((sem) => {
      const currentRecords = sem.records || [];
      const existingIdx = currentRecords.findIndex((r) => r.date === date && r.subjectId === subjectId);
      let updated: AttendanceRecord[];
      if (existingIdx >= 0) {
        updated = [...currentRecords];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status,
          notes: note ?? updated[existingIdx].notes,
        };
      } else {
        updated = [
          ...currentRecords,
          {
            id: `rec-${date}-${subjectId}-${Date.now()}`,
            date,
            subjectId,
            status,
            notes: note,
          },
        ];
      }
      return { records: updated };
    });
  };

  const handleClearDateRecords = (date: string) => {
    updateCurrentSemester((sem) => ({
      records: (sem.records || []).filter((r) => r.date !== date),
    }));
  };

  const handleToggleTeachingDay = (date: string) => {
    updateCurrentSemester((sem) => {
      const currentTeaching = sem.teachingDays || {};
      const existing = currentTeaching[date];
      const isNowTeaching = existing ? !existing.isTeachingDay : false;
      return {
        teachingDays: {
          ...currentTeaching,
          [date]: {
            date,
            isTeachingDay: isNowTeaching,
            label: isNowTeaching ? 'Teaching Day' : 'Holiday / Off Day',
          },
        },
      };
    });
  };

  const handleSaveSubject = (subjectData: Omit<Subject, 'id'>, editId?: string) => {
    updateCurrentSemester((sem) => {
      const currentSubjs = sem.subjects || [];
      if (editId) {
        return {
          subjects: currentSubjs.map((s) =>
            s.id === editId ? { ...s, ...subjectData, targetPercentage: 100 } : s
          ),
        };
      } else {
        const newSubject: Subject = {
          ...subjectData,
          id: `subj-${Date.now()}`,
          targetPercentage: 100,
        };
        return { subjects: [...currentSubjs, newSubject] };
      }
    });
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (window.confirm('Are you sure you want to delete this subject and its records?')) {
      updateCurrentSemester((sem) => ({
        subjects: (sem.subjects || []).filter((s) => s.id !== subjectId),
        records: (sem.records || []).filter((r) => r.subjectId !== subjectId),
      }));
    }
  };

  const handleOpenSimulator = (subject: Subject) => {
    setSimulatorSubjectId(subject.id);
    setActiveTab('simulator');
  };

  const handleResetData = () => {
    if (window.confirm('Clear all subjects and attendance records for this semester?')) {
      updateCurrentSemester(() => ({
        subjects: [],
        records: [],
        teachingDays: {},
      }));
    }
  };

  const handleAddSemester = (newSemester: SemesterData) => {
    setSemesters((prev) => [...prev, newSemester]);
    setActiveSemesterId(newSemester.id);
    setIsAlertDismissed(false);
  };

  const handleOpenDeleteSemester = (semId: string) => {
    const targetSem = semesters.find((s) => s.id === semId);
    if (targetSem) {
      setSemesterToDelete(targetSem);
    }
  };

  const handleConfirmDeleteSemester = (semId: string) => {
    if (semesters.length <= 1) return;
    const remaining = semesters.filter((s) => s.id !== semId);
    setSemesters(remaining);
    if (activeSemesterId === semId) {
      setActiveSemesterId(remaining[0].id);
    }
    setSemesterToDelete(null);
    setIsAlertDismissed(false);
  };

  // Filtered subjects on dashboard
  const displayedSubjects =
    dashboardFilter === 'hasAbsence'
      ? subjectsWithAbsence
      : dashboardFilter === 'perfect'
      ? subjectsPerfect
      : subjectStatsList;

  const isFull100 = overallStats.absentCount === 0 && overallStats.totalConducted > 0;
  const totalConducted = overallStats.totalConducted;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddSubject={() => {
          setEditingSubject(null);
          setIsAddModalOpen(true);
        }}
        onResetData={handleResetData}
        overallPercentage={overallStats.percentage}
        overallRecoveryNeeded={overallStats.recoveryNeeded}
        semesters={semesters}
        activeSemesterId={activeSemesterId}
        onSelectSemester={(semId) => {
          setActiveSemesterId(semId);
          setIsAlertDismissed(false);
        }}
        onOpenAddSemester={() => setIsAddSemesterModalOpen(true)}
        onDeleteSemester={handleOpenDeleteSemester}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 w-full">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div id="dashboard-view" className="space-y-6">
            {/* ALERT AT THE VERY TOP OF THE DASHBOARD PAGE */}
            {!isAlertDismissed ? (
              isFull100 ? (
                <div
                  id="dashboard-top-alert"
                  className="rounded-2xl border border-emerald-300 bg-emerald-50/95 p-4 sm:p-5 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/50 transition-all animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-200">
                            100% Perfect Attendance Record &bull; {currentSemester.name}
                          </h2>
                          <span className="rounded-full bg-emerald-200/70 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100">
                            Scale 100%
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-emerald-800 dark:text-emerald-300">
                          Excellent! You have attended all <span className="font-bold">{overallStats.presentCount}</span> conducted classes with <span className="font-bold">0 absences</span> across all {subjects.length} enrolled subjects.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setActiveTab('daily')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                      >
                        <CalendarCheck className="h-3.5 w-3.5" />
                        <span>Mark Attendance</span>
                      </button>
                      <button
                        onClick={() => setIsAlertDismissed(true)}
                        className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-200/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                        title="Dismiss alert"
                      >
                        <span className="text-xs font-semibold">Dismiss</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : subjectsWithAbsence.length > 0 ? (
                <div
                  id="dashboard-top-alert"
                  className="rounded-2xl border border-rose-300 bg-rose-50/95 p-4 sm:p-5 shadow-sm dark:border-rose-900 dark:bg-rose-950/50 transition-all animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm sm:text-base font-black text-rose-950 dark:text-rose-100">
                              Attendance Alert &bull; {overallStats.percentage}% out of 100% Full Attendance
                            </h2>
                            <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-900 dark:bg-rose-900/80 dark:text-rose-200">
                              {overallStats.absentCount} Total Missed {overallStats.absentCount === 1 ? 'Class' : 'Classes'}
                            </span>
                            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs dark:bg-slate-800 dark:text-slate-300">
                              {currentSemester.name}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-rose-900 dark:text-rose-200">
                            You have missed lectures in <span className="font-bold">{subjectsWithAbsence.length}</span> {subjectsWithAbsence.length === 1 ? 'subject' : 'subjects'}. Compare your progress against a 100% attendance scale:
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSimulatorSubjectId(subjectsWithAbsence[0]?.subject.id);
                            setActiveTab('simulator');
                          }}
                          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors whitespace-nowrap"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Simulator</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setIsAlertDismissed(true)}
                          className="rounded-lg p-1.5 text-rose-700 hover:bg-rose-200/60 dark:text-rose-300 dark:hover:bg-rose-900/60"
                          title="Dismiss alert"
                        >
                          <span className="text-xs font-semibold">Dismiss</span>
                        </button>
                      </div>
                    </div>

                    {/* Breakdown Badges for Courses with Missed Classes */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200/80 dark:border-rose-900/60">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                        Affected Courses:
                      </span>
                      {subjectsWithAbsence.map((item) => (
                        <button
                          key={item.subject.id}
                          onClick={() => {
                            setSimulatorSubjectId(item.subject.id);
                            setActiveTab('simulator');
                          }}
                          title={`Click to simulate ${item.subject.name}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-rose-900 shadow-2xs hover:bg-rose-100 hover:shadow-xs dark:bg-slate-900 dark:text-rose-200 dark:hover:bg-slate-800 transition-all"
                        >
                          <span className="font-black text-rose-700 dark:text-rose-300">{item.subject.code}:</span>
                          <span>{item.percentage}%</span>
                          <span className="text-slate-400">/ 100%</span>
                          <span className="rounded bg-rose-100 px-1 py-0.2 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            {item.absentCount} missed
                          </span>
                        </button>
                      ))}

                      <button
                        onClick={() => {
                          setSimulatorSubjectId(subjectsWithAbsence[0]?.subject.id);
                          setActiveTab('simulator');
                        }}
                        className="sm:hidden inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs"
                      >
                        <span>Calculate Recovery</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : null
            ) : (
              <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                <span>
                  Attendance Alert hidden ({overallStats.percentage}% out of 100% in {currentSemester.name})
                </span>
                <button
                  onClick={() => setIsAlertDismissed(false)}
                  className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Show Alert
                </button>
              </div>
            )}

            {/* Top KPI Summary Banner (100% Scale) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Overall Percentage */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Overall Semester Attendance
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-black ${
                      isFull100
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : overallStats.percentage < 75
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {overallStats.percentage}%
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/ 100% scale</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  {isFull100 ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> 100% Full Attendance
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> -{(100 - overallStats.percentage).toFixed(1)}% from 100%
                    </span>
                  )}
                </div>
              </div>

              {/* Total Conducted */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Classes Attended
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {overallStats.presentCount}
                  </span>
                  <span className="text-xs text-slate-400">of {overallStats.totalConducted} classes</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Conducted lectures across {subjects.length} courses
                </p>
              </div>

              {/* Total Absences */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Missed Classes (Absences)
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${overallStats.absentCount === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {overallStats.absentCount}
                  </span>
                  <span className="text-xs text-slate-400">absences</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {overallStats.absentCount === 0
                    ? 'Clean record! No missed lectures.'
                    : `Absences across ${subjectsWithAbsence.length} courses`}
                </p>
              </div>

              {/* 100% Scale Status */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  100% Attendance Status
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  {isFull100 ? (
                    <>
                      <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                        100%
                      </span>
                      <span className="text-xs text-slate-400">Full Record</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
                        -{overallStats.absentCount}
                      </span>
                      <span className="text-xs text-slate-400">missed lectures</span>
                    </>
                  )}
                </div>
                <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  {isFull100
                    ? 'Zero absences! 100% record maintained.'
                    : `Attend upcoming classes without absences to maximize attendance.`}
                </p>
              </div>
            </div>

            {/* Subject Cards Section Header & Filter */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {currentSemester.name} Subjects &amp; 100% Tracking
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track course attendance percentages, absence counts, and progress compared against 100%.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <div className="flex items-center overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 w-full sm:w-auto">
                  <button
                    onClick={() => setDashboardFilter('all')}
                    className={`flex-1 sm:flex-none whitespace-nowrap rounded-lg px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all ${
                      dashboardFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    All ({subjectStatsList.length})
                  </button>
                  <button
                    onClick={() => setDashboardFilter('hasAbsence')}
                    className={`flex-1 sm:flex-none whitespace-nowrap rounded-lg px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all ${
                      dashboardFilter === 'hasAbsence'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <span className="hidden xs:inline">Missed Classes</span>
                    <span className="xs:hidden">Missed</span> ({subjectsWithAbsence.length})
                  </button>
                  <button
                    onClick={() => setDashboardFilter('perfect')}
                    className={`flex-1 sm:flex-none whitespace-nowrap rounded-lg px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all ${
                      dashboardFilter === 'perfect'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <span className="hidden xs:inline">100% Perfect</span>
                    <span className="xs:hidden">100%</span> ({subjectsPerfect.length})
                  </button>
                </div>

                <button
                  id="dashboard-add-subject-btn"
                  onClick={() => {
                    setEditingSubject(null);
                    setIsAddModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 shrink-0"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>Add Course</span>
                </button>
              </div>
            </div>

            {/* Subject Cards Grid */}
            {displayedSubjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 sm:p-14 text-center dark:border-slate-800">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-3 dark:bg-slate-800 dark:text-slate-400">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {dashboardFilter === 'hasAbsence'
                    ? 'Great news! No missed classes in any subject.'
                    : dashboardFilter === 'perfect'
                    ? 'No subjects currently at 100% attendance.'
                    : `No subjects added in ${currentSemester.name} yet.`}
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  {dashboardFilter === 'all'
                    ? 'Start tracking your lectures, calculating absences, and maintaining full 100% attendance by adding your courses.'
                    : 'Switch filters or add new courses to see them here.'}
                </p>
                {dashboardFilter === 'all' && (
                  <button
                    id="empty-state-add-course-btn"
                    onClick={() => {
                      setEditingSubject(null);
                      setIsAddModalOpen(true);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add First Course</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {displayedSubjects.map((stats) => (
                  <SubjectCard
                    key={stats.subject.id}
                    stats={stats}
                    onMarkToday={handleMarkToday}
                    onEdit={(subj) => {
                      setEditingSubject(subj);
                      setIsAddModalOpen(true);
                    }}
                    onDelete={handleDeleteSubject}
                    onOpenSimulator={handleOpenSimulator}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* DAILY ATTENDANCE TAB */}
        {activeTab === 'daily' && (
          <DailyAttendanceMarking
            subjects={subjects}
            records={records}
            teachingDays={teachingDays}
            onUpdateRecord={handleUpdateRecord}
            onClearDateRecords={handleClearDateRecords}
            onToggleTeachingDay={handleToggleTeachingDay}
          />
        )}

        {/* MONTHLY REPORT TAB */}
        {activeTab === 'monthly' && (
          <MonthlyReport
            subjects={subjects}
            records={records}
            teachingDays={teachingDays}
            semester={semesterSettings}
            onSelectDateToMark={() => {
              setActiveTab('daily');
            }}
          />
        )}

        {/* TEACHING DAYS PLANNER TAB */}
        {activeTab === 'planner' && (
          <TeachingDaysPlanner
            semester={semesterSettings}
            teachingDays={teachingDays}
            onUpdateTeachingDays={(newTeachingDays) => {
              updateCurrentSemester(() => ({ teachingDays: newTeachingDays }));
            }}
            onUpdateSemester={(newSettings) => {
              updateCurrentSemester(() => ({
                name: newSettings.name,
                startDate: newSettings.startDate,
                endDate: newSettings.endDate,
              }));
            }}
          />
        )}

        {/* RECOVERY & WHAT-IF SIMULATOR TAB */}
        {activeTab === 'simulator' && (
          <RecoverySimulator
            subjects={subjects}
            records={records}
            initialSelectedSubjectId={simulatorSubjectId}
          />
        )}
      </main>

      {/* Add / Edit Subject Modal */}
      <AddSubjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveSubject}
        editingSubject={editingSubject}
      />

      {/* Add New Semester Modal */}
      <AddSemesterModal
        isOpen={isAddSemesterModalOpen}
        onClose={() => setIsAddSemesterModalOpen(false)}
        onAddSemester={handleAddSemester}
        existingSemesters={semesters}
        currentSubjects={subjects}
      />

      {/* Delete Semester Confirmation Modal */}
      <DeleteSemesterModal
        isOpen={!!semesterToDelete}
        semester={semesterToDelete}
        onClose={() => setSemesterToDelete(null)}
        onConfirmDelete={handleConfirmDeleteSemester}
        isOnlySemester={semesters.length <= 1}
      />
    </div>
  );
}
