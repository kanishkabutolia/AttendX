import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Subject, SubjectStats } from '../types';
import { COLOR_MAP } from '../utils/attendanceUtils';

interface SubjectCardProps {
  stats: SubjectStats;
  onEdit: (subject: Subject) => void;
  onDelete: (subjectId: string) => void;
  onOpenSimulator: (subject: Subject) => void;
  onMarkToday?: (subjectId: string, status: 'present' | 'absent') => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  stats,
  onEdit,
  onDelete,
  onOpenSimulator,
}) => {
  const { subject, totalConducted, presentCount, absentCount, percentage, isAboveTarget } = stats;
  const colorTheme = COLOR_MAP[subject.color] || COLOR_MAP.emerald;
  const isPerfect = absentCount === 0 || percentage >= 100;
  const isHighAbsence = percentage < 75;
  const lossFrom100 = Number((100 - percentage).toFixed(1));

  return (
    <div
      id={`subject-card-${subject.id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${colorTheme.badge}`}>
                {subject.code}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                100% Scale
              </span>
            </div>
            <h3 className="mt-1.5 text-base font-bold text-slate-900 line-clamp-1 dark:text-white" title={subject.name}>
              {subject.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              id={`edit-subject-${subject.id}`}
              onClick={() => onEdit(subject)}
              title="Edit Subject"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              id={`delete-subject-${subject.id}`}
              onClick={() => onDelete(subject.id)}
              title="Delete Subject"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Attendance Percentage Gauge vs 100 */}
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-3xl font-black tracking-tight ${
                  isPerfect
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isHighAbsence
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {percentage}%
              </span>
              <span className="text-xs font-semibold text-slate-400">/ 100%</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{presentCount}</span> attended of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{totalConducted}</span> total classes
            </p>
          </div>

          {/* Quick status pill */}
          <div className="text-right">
            {isPerfect ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                100% Full Record
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                {absentCount} {absentCount === 1 ? 'Class' : 'Classes'} Missed
              </span>
            )}
          </div>
        </div>

        {/* Visual Progress Bar out of 100% */}
        <div className="mt-3">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isPerfect
                  ? 'bg-emerald-500'
                  : isHighAbsence
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>0%</span>
            <span className="font-medium text-slate-500 dark:text-slate-400">
              {isPerfect ? '100% Full Attendance' : `-${lossFrom100}% from 100%`}
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">100%</span>
          </div>
        </div>

        {/* 100% COMPARISON & ABSENCE NOTICE (Overview) */}
        <div className="mt-4">
          {!isPerfect ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
              <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>Attendance Gap: {absentCount} missed {absentCount === 1 ? 'class' : 'classes'}</span>
              </div>
              <p className="mt-1 font-medium leading-relaxed">
                Currently at <span className="font-bold">{percentage}%</span> out of 100%. Attend upcoming lectures without absences to maintain the highest possible attendance rate.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Perfect 100% Attendance Record</span>
              </div>
              <p className="mt-1 font-medium leading-relaxed">
                You have attended all {totalConducted} classes conducted with 0 missed lectures!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Class Statistics Overview Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{presentCount} Attended</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>{absentCount} Missed</span>
            </span>
          </div>

          <button
            id={`calc-simulator-btn-${subject.id}`}
            onClick={() => onOpenSimulator(subject)}
            title="Open Attendance Calculator & Simulator"
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Calculator</span>
          </button>
        </div>
      </div>
    </div>
  );
};
