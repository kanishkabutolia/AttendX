import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarCheck,
  CalendarX,
  Plus,
  RotateCcw,
  Sparkles,
  Check,
  Info,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sun,
  GraduationCap,
  Palmtree,
  PartyPopper,
} from 'lucide-react';
import { TeachingDay, SemesterSettings } from '../types';
import {
  formatDate,
  parseDate,
  generateTeachingDaysRange,
  MONTH_NAMES,
  DAY_NAMES,
} from '../utils/attendanceUtils';

interface TeachingDaysPlannerProps {
  semester: SemesterSettings;
  teachingDays: Record<string, TeachingDay>;
  onUpdateTeachingDays: (newDays: Record<string, TeachingDay>) => void;
  onUpdateSemester: (newSemester: SemesterSettings) => void;
}

const WEEKDAY_OPTIONS = [
  { day: 1, label: 'Monday' },
  { day: 2, label: 'Tuesday' },
  { day: 3, label: 'Wednesday' },
  { day: 4, label: 'Thursday' },
  { day: 5, label: 'Friday' },
  { day: 6, label: 'Saturday' },
  { day: 0, label: 'Sunday' },
];

type MarkingBrush = 'teaching' | 'weekend' | 'holiday' | 'cycle';

export const TeachingDaysPlanner: React.FC<TeachingDaysPlannerProps> = ({
  semester,
  teachingDays,
  onUpdateTeachingDays,
  onUpdateSemester,
}) => {
  const [termName, setTermName] = useState(semester.name);
  const [startDate, setStartDate] = useState(semester.startDate);
  const [numberOfMonths, setNumberOfMonths] = useState(4);
  const [activeDaysOfWeek, setActiveDaysOfWeek] = useState<number[]>(
    semester.regularWeeklyTeachingDays || [1, 2, 3, 4, 5]
  );
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Year and Month for the current planner view (defaults to current month)
  const [viewYear, setViewYear] = useState<number>(currentYear);
  const [viewMonth, setViewMonth] = useState<number>(currentMonth);
  const [markingBrush, setMarkingBrush] = useState<MarkingBrush>('cycle');

  // Month navigation: list of 8 months centered around current semester & upcoming
  const baseMonths: { year: number; month: number; key: string; label: string; isCurrent: boolean; isUpcoming: boolean }[] = [];
  for (let offset = -2; offset <= 6; offset++) {
    const d = new Date(currentYear, currentMonth + offset, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const isCurrent = y === currentYear && m === currentMonth;
    const isUpcoming = y > currentYear || (y === currentYear && m > currentMonth);
    baseMonths.push({
      year: y,
      month: m,
      key: `${y}-${String(m + 1).padStart(2, '0')}`,
      label: `${MONTH_NAMES[m]} ${y}`,
      isCurrent,
      isUpcoming,
    });
  }

  const currentMonthData = {
    year: viewYear,
    month: viewMonth,
    key: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`,
    label: `${MONTH_NAMES[viewMonth]} ${viewYear}`,
    isCurrent: viewYear === currentYear && viewMonth === currentMonth,
    isUpcoming: viewYear > currentYear || (viewYear === currentYear && viewMonth > currentMonth),
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleJumpToCurrentMonth = () => {
    setViewYear(2026);
    setViewMonth(8); // September 2026
  };

  // Compute stats
  const totalDays = Object.keys(teachingDays).length;
  const teachingCount = (Object.values(teachingDays) as TeachingDay[]).filter((d) => d.isTeachingDay).length;
  const offCount = totalDays - teachingCount;

  const toggleDayOfWeek = (d: number) => {
    if (activeDaysOfWeek.includes(d)) {
      setActiveDaysOfWeek(activeDaysOfWeek.filter((x) => x !== d));
    } else {
      setActiveDaysOfWeek([...activeDaysOfWeek, d].sort());
    }
  };

  const handleGenerateNMonths = () => {
    const start = parseDate(startDate);
    const end = new Date(start.getFullYear(), start.getMonth() + numberOfMonths, 0);
    const endDateStr = formatDate(end);

    const generated = generateTeachingDaysRange(startDate, endDateStr, activeDaysOfWeek);
    
    const updatedSemester: SemesterSettings = {
      ...semester,
      name: termName,
      startDate,
      endDate: endDateStr,
      regularWeeklyTeachingDays: activeDaysOfWeek,
    };

    onUpdateSemester(updatedSemester);
    onUpdateTeachingDays(generated);
  };

  // Calendar cells for currently selected month
  const firstDay = new Date(viewYear, viewMonth, 1);
  const numDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDayIdx = firstDay.getDay();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startDayIdx; i++) cells.push(null);
  for (let d = 1; d <= numDays; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push(dateStr);
  }

  // Handle clicking a specific calendar date
  const handleDateClick = (dateStr: string) => {
    const existing = teachingDays[dateStr];
    const dayOfWeek = parseDate(dateStr).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let newTeachingDay = true;
    let newLabel = 'Regular Class';

    if (markingBrush === 'teaching') {
      newTeachingDay = true;
      newLabel = 'Regular Class';
    } else if (markingBrush === 'weekend') {
      newTeachingDay = false;
      newLabel = 'Weekend Off';
    } else if (markingBrush === 'holiday') {
      newTeachingDay = false;
      newLabel = 'Institute Holiday';
    } else {
      // Cycle mode: Regular -> Weekend Off -> Holiday -> Regular
      const currentIsTeaching = existing ? existing.isTeachingDay : !isWeekend;
      const currentLabel = existing?.label?.toLowerCase() || '';

      if (currentIsTeaching) {
        newTeachingDay = false;
        newLabel = 'Weekend Off';
      } else if (currentLabel.includes('weekend')) {
        newTeachingDay = false;
        newLabel = 'Institute Holiday';
      } else {
        newTeachingDay = true;
        newLabel = 'Regular Class';
      }
    }

    const updated = {
      ...teachingDays,
      [dateStr]: {
        date: dateStr,
        isTeachingDay: newTeachingDay,
        label: newLabel,
      },
    };
    onUpdateTeachingDays(updated);
  };

  // Quick action: Mark all Saturdays and Sundays in this month as Weekend Off
  const handleSetMonthWeekendsOff = () => {
    const updated = { ...teachingDays };
    for (let d = 1; d <= numDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = parseDate(dateStr).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        updated[dateStr] = {
          date: dateStr,
          isTeachingDay: false,
          label: 'Weekend Off',
        };
      }
    }
    onUpdateTeachingDays(updated);
  };

  // Quick action: Mark all Monday-Friday in this month as Regular Class Days
  const handleSetMonthWeekdaysAsClass = () => {
    const updated = { ...teachingDays };
    for (let d = 1; d <= numDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = parseDate(dateStr).getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        updated[dateStr] = {
          date: dateStr,
          isTeachingDay: true,
          label: 'Regular Class',
        };
      }
    }
    onUpdateTeachingDays(updated);
  };

  // Quick action: Mark entire month as Off / Break
  const handleSetMonthAsOff = () => {
    const updated = { ...teachingDays };
    for (let d = 1; d <= numDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      updated[dateStr] = {
        date: dateStr,
        isTeachingDay: false,
        label: 'Semester Break / Off',
      };
    }
    onUpdateTeachingDays(updated);
  };

  return (
    <div id="teaching-days-planner-section" className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Academic Teaching Days &amp; Weekend Planner
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure regular class days, weekends, and holidays for the current and upcoming months.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <GraduationCap className="h-4 w-4" />
              <span>{teachingCount} Class Days</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <CalendarX className="h-4 w-4" />
              <span>{offCount} Off / Weekend Days</span>
            </div>
          </div>
        </div>

        {/* Semester Configuration */}
        <div className="mt-5 grid grid-cols-1 gap-3.5 rounded-xl bg-slate-50 p-4 border border-slate-100 sm:grid-cols-2 lg:grid-cols-4 dark:bg-slate-800/50 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Semester Name
            </label>
            <input
              type="text"
              value={termName}
              onChange={(e) => setTermName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Semester Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Duration (N Months)
            </label>
            <select
              value={numberOfMonths}
              onChange={(e) => setNumberOfMonths(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value={1}>1 Month</option>
              <option value={2}>2 Months</option>
              <option value={3}>3 Months</option>
              <option value={4}>4 Months (Standard)</option>
              <option value={5}>5 Months</option>
              <option value={6}>6 Months</option>
              <option value={10}>10 Months (Full Year)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              id="generate-n-months-schedule-btn"
              onClick={handleGenerateNMonths}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Apply Weekly Schedule
            </button>
          </div>
        </div>

        {/* Regular Weekly Teaching Days Checklist */}
        <div className="mt-3.5 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Default Weekly Class Days:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAY_OPTIONS.map(({ day, label }) => {
              const active = activeDaysOfWeek.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDayOfWeek(day)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {label.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Month Matrix & Interactive Calendar Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {/* Month Selector Bar */}
        <div className="flex flex-col gap-4 mb-5">
          {/* Top Navigator: Prev, Current Month, Next */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev Month</span>
              </button>

              <button
                onClick={handleJumpToCurrentMonth}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  currentMonthData.isCurrent
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Current Month (Sep 2026)
              </button>

              <button
                onClick={handleNextMonth}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <span>Next Month</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {currentMonthData.label}
              </span>
              {currentMonthData.isCurrent && (
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase">
                  Current
                </span>
              )}
              {currentMonthData.isUpcoming && (
                <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300 uppercase">
                  Upcoming
                </span>
              )}
            </div>
          </div>

          {/* Quick Month Strip (Current & Upcoming Months) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {baseMonths.map((m) => {
              const isSelected = viewYear === m.year && viewMonth === m.month;
              return (
                <button
                  key={m.key}
                  onClick={() => {
                    setViewYear(m.year);
                    setViewMonth(m.month);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {m.label.split(' ')[0]} {m.year}
                  {m.isCurrent && ' • Now'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Marking Mode Selector & Quick Month Bulk Actions */}
        <div className="mb-5 flex flex-col gap-3 rounded-xl bg-slate-50 p-3 sm:p-3.5 border border-slate-100 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-800/60 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mr-1 w-full sm:w-auto">
              Marking Mode:
            </span>
            <button
              type="button"
              onClick={() => setMarkingBrush('cycle')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                markingBrush === 'cycle'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              <RotateCcw className="h-3 w-3 shrink-0" />
              <span>Cycle</span>
            </button>
            <button
              type="button"
              onClick={() => setMarkingBrush('teaching')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                markingBrush === 'teaching'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-emerald-700 border border-emerald-200 dark:bg-slate-800 dark:text-emerald-400 dark:border-emerald-800'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              <span>Class</span>
            </button>
            <button
              type="button"
              onClick={() => setMarkingBrush('weekend')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                markingBrush === 'weekend'
                  ? 'bg-slate-700 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              <Palmtree className="h-3.5 w-3.5 shrink-0" />
              <span>Weekend</span>
            </button>
            <button
              type="button"
              onClick={() => setMarkingBrush('holiday')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                markingBrush === 'holiday'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-amber-700 border border-amber-200 dark:bg-slate-800 dark:text-amber-400 dark:border-amber-800'
              }`}
            >
              <PartyPopper className="h-3.5 w-3.5 shrink-0" />
              <span>Holiday</span>
            </button>
          </div>

          {/* Quick 1-click Month Bulk Helpers */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleSetMonthWeekendsOff}
              title="Set all Saturdays & Sundays this month as Weekend Off"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <Palmtree className="h-3 w-3 text-slate-500 shrink-0" />
              <span>Weekends Off</span>
            </button>
            <button
              onClick={handleSetMonthWeekdaysAsClass}
              title="Set Mon to Fri this month as Regular Class Days"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <GraduationCap className="h-3 w-3 text-emerald-600 shrink-0" />
              <span>Mon-Fri Class</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Class Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400 shrink-0" />
            <span>Weekend Off</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" />
            <span>Holiday / Off</span>
          </div>
        </div>

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[10px] sm:text-xs font-bold text-slate-400 uppercase py-2">
          {DAY_NAMES.map((d) => (
            <div key={d}>
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {cells.map((dateStr, idx) => {
            if (!dateStr) {
              return <div key={`empty-${idx}`} className="h-14 sm:h-16 rounded-lg sm:rounded-xl bg-slate-50/40 dark:bg-slate-900/40" />;
            }

            const dayNum = Number(dateStr.split('-')[2]);
            const dayOfWeek = parseDate(dateStr).getDay();
            const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;

            const td = teachingDays[dateStr];
            const isTeaching = td?.isTeachingDay ?? !isWeekendDay;
            const label = td?.label || (isTeaching ? 'Regular Class' : isWeekendDay ? 'Weekend Off' : 'Holiday Off');
            const isWeekendLabel = label.toLowerCase().includes('weekend');
            const isHolidayLabel = label.toLowerCase().includes('holiday') || label.toLowerCase().includes('break');

            return (
              <div
                key={dateStr}
                id={`toggle-cell-${dateStr}`}
                onClick={() => handleDateClick(dateStr)}
                className={`group flex h-14 sm:h-16 cursor-pointer flex-col justify-between rounded-lg sm:rounded-xl border p-1.5 sm:p-2 text-left transition-all hover:scale-102 hover:shadow-xs select-none ${
                  isTeaching
                    ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : isHolidayLabel
                    ? 'border-amber-300 bg-amber-50/80 text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200'
                    : 'border-slate-200 bg-slate-100/80 text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300'
                }`}
                title={`Click to toggle (${label})`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">{dayNum}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isTeaching
                        ? 'bg-emerald-500'
                        : isHolidayLabel
                        ? 'bg-amber-500'
                        : 'bg-slate-400 dark:bg-slate-500'
                    }`}
                  />
                </div>

                <div className="truncate text-[10px] font-semibold flex items-center gap-1">
                  {isTeaching ? (
                    <>
                      <GraduationCap className="h-3 w-3 shrink-0 text-emerald-600" />
                      <span className="truncate">Class</span>
                    </>
                  ) : isHolidayLabel ? (
                    <>
                      <PartyPopper className="h-3 w-3 shrink-0 text-amber-600" />
                      <span className="truncate">Holiday</span>
                    </>
                  ) : (
                    <>
                      <Palmtree className="h-3 w-3 shrink-0 text-slate-500" />
                      <span className="truncate">Weekend</span>
                    </>
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
