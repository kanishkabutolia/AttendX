import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Printer,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Download,
  Check,
  X,
  Minus,
} from 'lucide-react';
import {
  Subject,
  AttendanceRecord,
  TeachingDay,
  SemesterSettings,
} from '../types';
import {
  computeMonthlyStats,
  getAvailableMonths,
  parseDate,
  formatDate,
  COLOR_MAP,
  MONTH_NAMES,
  DAY_NAMES,
} from '../utils/attendanceUtils';

interface MonthlyReportProps {
  subjects: Subject[];
  records: AttendanceRecord[];
  teachingDays: Record<string, TeachingDay>;
  semester: SemesterSettings;
  onSelectDateToMark: (date: string) => void;
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({
  subjects,
  records,
  teachingDays,
  semester,
  onSelectDateToMark,
}) => {
  const availableMonths = getAvailableMonths(semester.startDate, semester.endDate);
  
  // Default to September 2026 (or first available)
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(() => {
    const sepIndex = availableMonths.findIndex((m) => m.month === 8 && m.year === 2026); // September is month 8 (0-indexed)
    return sepIndex >= 0 ? sepIndex : 0;
  });

  const activeMonth = availableMonths[selectedMonthIndex] || availableMonths[0];

  const stats = computeMonthlyStats(
    activeMonth.year,
    activeMonth.month,
    subjects,
    records,
    teachingDays,
    semester.defaultTarget
  );

  // Generate calendar days for the active month
  const firstDayOfMonth = new Date(activeMonth.year, activeMonth.month, 1);
  const daysInMonth = new Date(activeMonth.year, activeMonth.month + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon, etc.

  const calendarCells = [];
  // Fill previous month trailing blanks
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${activeMonth.year}-${String(activeMonth.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push(dateStr);
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="monthly-report-section" className="space-y-6">
      {/* Month Navigation & Export Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              id="prev-month-btn"
              disabled={selectedMonthIndex === 0}
              onClick={() => setSelectedMonthIndex((prev) => Math.max(0, prev - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 sm:px-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white min-w-28 sm:min-w-36 text-center">
              {activeMonth.label}
            </span>
            <button
              id="next-month-btn"
              disabled={selectedMonthIndex === availableMonths.length - 1}
              onClick={() => setSelectedMonthIndex((prev) => Math.min(availableMonths.length - 1, prev + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <span className="text-xs font-medium text-slate-500">
            {stats.totalTeachingDays} Teaching Days in {MONTH_NAMES[activeMonth.month]}
          </span>
        </div>

        <button
          id="print-monthly-report-btn"
          onClick={handlePrint}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* High Level Month Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Percentage Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Monthly Attendance
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-black ${
                stats.overallPercentage >= 90
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {stats.overallPercentage}%
            </span>
            <span className="text-xs text-slate-400">vs 100% target</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            {stats.overallPercentage >= 100 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> 100% Perfect Record for {MONTH_NAMES[activeMonth.month]}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" /> {stats.totalAbsent} Missed Classes ({stats.overallPercentage}% / 100%)
              </span>
            )}
          </div>
        </div>

        {/* Classes Attended */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Attended Classes
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.totalPresent}
            </span>
            <span className="text-xs text-slate-400">of {stats.totalConducted} conducted</span>
          </div>
          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Present in lectures
          </p>
        </div>

        {/* Missed / Absent */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Missed Classes (Absences)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {stats.totalAbsent}
            </span>
            <span className="text-xs text-slate-400">absences logged</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {stats.totalAbsent === 0
              ? 'Zero absences this month! Perfect!'
              : `${stats.totalAbsent} ${stats.totalAbsent === 1 ? 'class' : 'classes'} missed in this month`}
          </p>
        </div>

        {/* Teaching Days Scheduled */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Teaching Calendar
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {stats.totalTeachingDays}
            </span>
            <span className="text-xs text-slate-400">working days</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Out of {daysInMonth} calendar days in {MONTH_NAMES[activeMonth.month]}
          </p>
        </div>
      </div>

      {/* Detailed Subject Monthly Breakdown Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Subject-wise Monthly Report ({activeMonth.label})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Individual course statistics, absence logs, and attendance rate compared to 100%
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-600 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-4 py-3.5">Conducted</th>
                <th className="px-4 py-3.5">Present</th>
                <th className="px-4 py-3.5">Absent</th>
                <th className="px-4 py-3.5">Monthly %</th>
                <th className="px-4 py-3.5">Attendance Status / 100%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.subjectBreakdowns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-500">
                    No subjects recorded for this month.
                  </td>
                </tr>
              ) : (
                stats.subjectBreakdowns.map((item) => {
                  const colorTheme = COLOR_MAP[item.subject.color] || COLOR_MAP.emerald;
                  const isSafe = item.percentage >= 90;

                  return (
                    <tr key={item.subject.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase ${colorTheme.badge}`}>
                            {item.subject.code}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">{item.subject.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {item.conducted}
                      </td>
                      <td className="px-4 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {item.present}
                      </td>
                      <td className="px-4 py-4 font-bold text-rose-600 dark:text-rose-400">
                        {item.absent}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-black ${
                              isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {item.percentage}%
                          </span>
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className={`h-full ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${Math.min(100, item.percentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {item.conducted === 0 ? (
                          <span className="text-xs text-slate-400">No classes held yet</span>
                        ) : item.absent === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" /> 100% Full Attendance
                          </span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                              {item.absent} {item.absent === 1 ? 'class' : 'classes'} missed
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {item.percentage}% out of 100%
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Monthly Attendance Calendar Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {MONTH_NAMES[activeMonth.month]} Calendar Grid
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any date to view or mark subject attendance for that specific day
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Present
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Absent
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-100 border border-blue-300 dark:bg-blue-950" /> Teaching Day
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-100 border border-slate-200 dark:bg-slate-800" /> Off / Holiday
            </span>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
          {DAY_NAMES.map((d) => (
            <div key={d}>
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid Days */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarCells.map((dateStr, idx) => {
            if (!dateStr) {
              return <div key={`empty-${idx}`} className="h-14 sm:h-20 rounded-xl bg-slate-50/40 dark:bg-slate-900/40" />;
            }

            const dNum = Number(dateStr.split('-')[2]);
            const tdInfo = teachingDays[dateStr];
            const isTeaching = tdInfo?.isTeachingDay ?? (parseDate(dateStr).getDay() !== 0 && parseDate(dateStr).getDay() !== 6);
            const dateRecords = records.filter((r) => r.date === dateStr);
            const pCount = dateRecords.filter((r) => r.status === 'present').length;
            const aCount = dateRecords.filter((r) => r.status === 'absent').length;

            return (
              <div
                key={dateStr}
                onClick={() => onSelectDateToMark(dateStr)}
                id={`cal-cell-${dateStr}`}
                className={`group relative flex h-14 sm:h-20 cursor-pointer flex-col justify-between rounded-lg sm:rounded-xl border p-1 sm:p-2 text-left transition-all hover:border-blue-500 hover:shadow-xs ${
                  isTeaching
                    ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                    : 'border-slate-100 bg-slate-50/80 dark:border-slate-800/60 dark:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] sm:text-xs font-bold ${isTeaching ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    {dNum}
                  </span>
                  {isTeaching ? (
                    <span className="hidden sm:inline rounded-xs bg-blue-50 px-1 text-[9px] font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                      Teach
                    </span>
                  ) : (
                    <span className="hidden sm:inline rounded-xs bg-slate-100 px-1 text-[9px] text-slate-400 dark:bg-slate-800">
                      Off
                    </span>
                  )}
                </div>

                {/* Badges for present / absent */}
                <div className="flex flex-wrap gap-0.5 sm:gap-1">
                  {pCount > 0 && (
                    <span className="inline-flex items-center rounded-md bg-emerald-100 px-1 sm:px-1.5 py-0.2 sm:py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {pCount}P
                    </span>
                  )}
                  {aCount > 0 && (
                    <span className="inline-flex items-center rounded-md bg-rose-100 px-1 sm:px-1.5 py-0.2 sm:py-0.5 text-[9px] sm:text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {aCount}A
                    </span>
                  )}
                  {pCount === 0 && aCount === 0 && isTeaching && (
                    <span className="hidden sm:inline text-[9px] text-slate-400 group-hover:text-blue-500">
                      Click
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
