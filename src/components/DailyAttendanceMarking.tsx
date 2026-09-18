import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  MinusCircle,
  CalendarCheck,
  CalendarX,
  CheckCheck,
  RotateCcw,
  History,
  Clock,
} from 'lucide-react';
import { Subject, AttendanceRecord, TeachingDay } from '../types';
import { formatDate, parseDate, COLOR_MAP } from '../utils/attendanceUtils';

interface DailyAttendanceMarkingProps {
  subjects: Subject[];
  records: AttendanceRecord[];
  teachingDays: Record<string, TeachingDay>;
  onUpdateRecord: (date: string, subjectId: string, status: 'present' | 'absent' | 'cancelled', note?: string) => void;
  onClearDateRecords: (date: string) => void;
  onToggleTeachingDay: (date: string) => void;
}

export const DailyAttendanceMarking: React.FC<DailyAttendanceMarkingProps> = ({
  subjects,
  records,
  teachingDays,
  onUpdateRecord,
  onClearDateRecords,
  onToggleTeachingDay,
}) => {
  const TODAY_STR = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_STR);

  const currentDateObj = parseDate(selectedDate);
  const dayInfo = teachingDays[selectedDate] || {
    date: selectedDate,
    isTeachingDay: currentDateObj.getDay() !== 0 && currentDateObj.getDay() !== 6,
    label: currentDateObj.getDay() === 0 || currentDateObj.getDay() === 6 ? 'Weekend Off' : 'Teaching Day',
  };

  const dayOfWeekIndex = currentDateObj.getDay();
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeekIndex];
  const formattedNiceDate = currentDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isToday = selectedDate === TODAY_STR;
  const isPastDay = selectedDate < TODAY_STR;

  const changeDateBy = (offset: number) => {
    const d = parseDate(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(formatDate(d));
  };

  const jumpToToday = () => {
    setSelectedDate(TODAY_STR);
  };

  // Generate list of recent past days for instant 1-tap jump
  const recentDaysList = [
    { offset: 0, label: 'Today' },
    { offset: -1, label: 'Yesterday' },
    { offset: -2, label: '2 Days Ago' },
    { offset: -3, label: '3 Days Ago' },
    { offset: -4, label: '4 Days Ago' },
    { offset: -5, label: '5 Days Ago' },
    { offset: -6, label: '6 Days Ago' },
  ].map((item) => {
    const d = parseDate(TODAY_STR);
    d.setDate(d.getDate() + item.offset);
    const dateKey = formatDate(d);
    const subLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayRecords = records.filter((r) => r.date === dateKey);
    const markedCount = dayRecords.length;
    const hasAbsence = dayRecords.some((r) => r.status === 'absent');
    const allPresent = markedCount > 0 && dayRecords.every((r) => r.status === 'present');
    return {
      ...item,
      subLabel,
      dateKey,
      markedCount,
      hasAbsence,
      allPresent,
    };
  });

  // Get current statuses for this date
  const recordsForDate = records.filter((r) => r.date === selectedDate);
  const getRecordForSubject = (subjectId: string) => recordsForDate.find((r) => r.subjectId === subjectId);

  const presentCount = recordsForDate.filter((r) => r.status === 'present').length;
  const absentCount = recordsForDate.filter((r) => r.status === 'absent').length;
  const cancelledCount = recordsForDate.filter((r) => r.status === 'cancelled').length;

  const markAllScheduledPresent = () => {
    subjects.forEach((subj) => {
      onUpdateRecord(selectedDate, subj.id, 'present');
    });
  };

  return (
    <div id="daily-attendance-marking-section" className="space-y-5">
      {/* Quick Recent Days Jump Bar (Previous Days Access) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider dark:text-white">
              Quick Day Selector (Go back &amp; mark missed classes)
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {isPastDay ? (
              <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Backdating previous day
              </span>
            ) : (
              'Showing today'
            )}
          </span>
        </div>

        {/* Scrollable / wrapped days strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {recentDaysList.map((item) => {
            const isSelected = selectedDate === item.dateKey;
            return (
              <button
                key={item.dateKey}
                onClick={() => setSelectedDate(item.dateKey)}
                className={`flex flex-col items-center justify-center min-w-[90px] px-3 py-2 rounded-xl text-xs transition-all border ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-bold ring-2 ring-blue-600/20 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500'
                    : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold">{item.label}</span>
                <span className="text-[11px] opacity-75">{item.subLabel}</span>
                <div className="mt-1 flex items-center gap-1">
                  {item.markedCount === 0 ? (
                    <span className="text-[10px] text-slate-400">Unmarked</span>
                  ) : item.hasAbsence ? (
                    <span className="inline-flex items-center text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1" />
                      Missed
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                      Present
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Navigation & Calendar Picker */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          {/* Previous / Today / Next buttons */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              id="prev-day-btn"
              onClick={() => changeDateBy(-1)}
              className="flex h-8 items-center gap-1 px-2 sm:px-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-xs dark:text-slate-300 dark:hover:bg-slate-700"
              title="Go back to previous day"
            >
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Previous Day</span>
              <span className="sm:hidden">Prev</span>
            </button>
            <button
              id="jump-today-btn"
              onClick={jumpToToday}
              className={`px-2.5 sm:px-3 text-xs font-bold transition-colors ${
                isToday
                  ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                  : 'text-slate-600 hover:text-blue-600 dark:text-slate-300'
              }`}
            >
              Today
            </button>
            <button
              id="next-day-btn"
              onClick={() => changeDateBy(1)}
              className="flex h-8 items-center gap-1 px-2 sm:px-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-xs dark:text-slate-300 dark:hover:bg-slate-700"
              title="Go to next day"
            >
              <span className="hidden sm:inline">Next Day</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </button>
          </div>

          {/* Explicit Date Picker */}
          <div className="flex items-center gap-2">
            <input
              id="daily-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            {formattedNiceDate}
          </div>
        </div>

        {/* Teaching day toggle badge */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-teaching-day-status-btn"
            onClick={() => onToggleTeachingDay(selectedDate)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              dayInfo.isTeachingDay
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
            }`}
          >
            {dayInfo.isTeachingDay ? (
              <>
                <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
                Teaching Day ({dayInfo.label || 'Regular'})
              </>
            ) : (
              <>
                <CalendarX className="h-3.5 w-3.5 text-amber-600" />
                Off / Holiday ({dayInfo.label || 'Off Day'})
              </>
            )}
            <span className="ml-1 text-[10px] underline opacity-70">Click to switch</span>
          </button>
        </div>
      </div>

      {/* Backdating Notice if marking a past day */}
      {isPastDay && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 flex items-start gap-2.5">
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Marking Past Attendance:</span> You are logging classes for{' '}
            <strong className="underline">{formattedNiceDate}</strong>. If you missed marking yesterday or an earlier class, record your attendance here. Your overall 90% statistics and recovery counts will recalculate automatically.
          </div>
        </div>
      )}

      {/* Daily Summary & Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>
            Marked on {isToday ? 'Today' : formattedNiceDate.split(',')[0]}:{' '}
            <strong className="text-slate-900 dark:text-white">{presentCount + absentCount}</strong> of {subjects.length}
          </span>
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {presentCount} Present
          </span>
          <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            {absentCount} Absent
          </span>
          {cancelledCount > 0 && (
            <span className="flex items-center gap-1 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              {cancelledCount} Cancelled
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="mark-all-present-btn"
            onClick={markAllScheduledPresent}
            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Mark All Present</span>
          </button>
          <button
            id="clear-daily-records-btn"
            onClick={() => onClearDateRecords(selectedDate)}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 shrink-0"
            title="Reset marks for this day"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Subjects Attendance Marking Cards */}
      <div className="space-y-3">
        {subjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <p className="text-sm text-slate-500">No subjects listed yet. Click &quot;Add Subject&quot; to begin!</p>
          </div>
        ) : (
          subjects.map((subject) => {
            const currentRecord = getRecordForSubject(subject.id);
            const status = currentRecord?.status;
            const isDayScheduled = subject.scheduledDays?.includes(dayOfWeekIndex);
            const colorTheme = COLOR_MAP[subject.color] || COLOR_MAP.emerald;

            return (
              <div
                key={subject.id}
                id={`attendance-row-${subject.id}`}
                className={`flex flex-col gap-3 rounded-2xl border p-3.5 sm:p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                  status === 'present'
                    ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                    : status === 'absent'
                    ? 'border-rose-200 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-950/20'
                    : status === 'cancelled'
                    ? 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                {/* Subject Info */}
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-1.5 rounded-full shrink-0 ${colorTheme.border.replace('border', 'bg')}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">{subject.code}</span>
                      {isDayScheduled && (
                        <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          Scheduled Today ({dayName.slice(0, 3)})
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{subject.name}</h4>
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
                  <button
                    type="button"
                    id={`mark-present-${subject.id}`}
                    onClick={() => onUpdateRecord(selectedDate, subject.id, 'present')}
                    className={`inline-flex items-center justify-center gap-1 rounded-xl px-2.5 sm:px-4 py-2 text-xs font-bold transition-all ${
                      status === 'present'
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-950/50'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span>Present</span>
                  </button>

                  <button
                    type="button"
                    id={`mark-absent-${subject.id}`}
                    onClick={() => onUpdateRecord(selectedDate, subject.id, 'absent')}
                    className={`inline-flex items-center justify-center gap-1 rounded-xl px-2.5 sm:px-4 py-2 text-xs font-bold transition-all ${
                      status === 'absent'
                        ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/30'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/50'
                    }`}
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span>Absent</span>
                  </button>

                  <button
                    type="button"
                    id={`mark-cancelled-${subject.id}`}
                    onClick={() => onUpdateRecord(selectedDate, subject.id, 'cancelled', 'No lecture held')}
                    title="Class cancelled or faculty on leave (Does not penalize %)"
                    className={`inline-flex items-center justify-center gap-1 rounded-xl px-2 sm:px-3 py-2 text-xs font-medium transition-all ${
                      status === 'cancelled'
                        ? 'bg-slate-700 text-white dark:bg-slate-600'
                        : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <MinusCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>No Class</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
