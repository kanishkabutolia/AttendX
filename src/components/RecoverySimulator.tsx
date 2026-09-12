import React, { useState } from 'react';
import {
  Sparkles,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Info,
} from 'lucide-react';
import { Subject, AttendanceRecord } from '../types';
import {
  computeSubjectStats,
  computeOverallStats,
  calculateRecovery,
  calculateMarginOfSafety,
  COLOR_MAP,
} from '../utils/attendanceUtils';

interface RecoverySimulatorProps {
  subjects: Subject[];
  records: AttendanceRecord[];
  initialSelectedSubjectId?: string;
}

export const RecoverySimulator: React.FC<RecoverySimulatorProps> = ({
  subjects,
  records,
  initialSelectedSubjectId,
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialSelectedSubjectId || 'overall');
  const [attendNext, setAttendNext] = useState<number>(5);
  const [missNext, setMissNext] = useState<number>(0);
  const [customTarget, setCustomTarget] = useState<number>(100);

  // Compute stats for current selection
  const isOverall = selectedId === 'overall';
  const selectedSubject = subjects.find((s) => s.id === selectedId);

  const currentStats = isOverall
    ? computeOverallStats(subjects, records, customTarget)
    : selectedSubject
    ? computeSubjectStats(selectedSubject, records, customTarget)
    : computeOverallStats(subjects, records, customTarget);

  const conducted = currentStats.totalConducted;
  const present = currentStats.presentCount;
  const absent = currentStats.absentCount;
  const currentPct = currentStats.percentage;
  const recoveryNeeded = currentStats.recoveryNeeded;
  const marginOfSafety = currentStats.marginOfSafety;

  // Compute simulated stats:
  // Student attends `attendNext` classes and misses `missNext` classes
  const simulatedConducted = conducted + attendNext + missNext;
  const simulatedPresent = present + attendNext;
  const simulatedAbsent = absent + missNext;
  const simulatedPct =
    simulatedConducted > 0
      ? Number(((simulatedPresent / simulatedConducted) * 100).toFixed(1))
      : 100;
  const simulatedIsSafe = simulatedPct >= customTarget;
  const pctDelta = Number((simulatedPct - currentPct).toFixed(1));

  return (
    <div id="recovery-simulator-section" className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50/50 p-4 sm:p-6 dark:border-blue-900/50 dark:from-blue-950/40 dark:to-indigo-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 shrink-0">
            <Calculator className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Attendance Recovery & What-If Simulator
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Analyze your attendance rate out of 100% and calculate exact future class projections.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Controls Column */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Select Course to Analyze
            </label>
            <select
              id="simulator-subject-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="overall">All Subjects Combined (Overall Attendance)</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Target Attendance Scale
            </label>
            <div className="flex items-center gap-2">
              {[75, 85, 95, 100].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCustomTarget(t)}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                    customTarget === t
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {t}%
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              What-If Projection
            </h4>

            {/* Attend Slider */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>Attend next upcoming classes:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">+{attendNext} classes</span>
              </div>
              <input
                id="attend-slider"
                type="range"
                min="0"
                max="30"
                value={attendNext}
                onChange={(e) => setAttendNext(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Miss Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>Miss / Skip next upcoming classes:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">+{missNext} classes</span>
              </div>
              <input
                id="miss-slider"
                type="range"
                min="0"
                max="20"
                value={missNext}
                onChange={(e) => setMissNext(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Results & Simulation Output */}
        <div className="space-y-5 lg:col-span-2">
          {/* Main 90% Target Analysis Box */}
          <div
            className={`rounded-2xl border p-4 sm:p-6 shadow-xs transition-all ${
              currentPct >= customTarget
                ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                : 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20'
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Current Status ({selectedSubject?.name || 'All Subjects'})
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    className={`text-3xl sm:text-4xl font-black ${
                      currentPct >= customTarget
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {currentPct}%
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500">
                    ({present} attended / {conducted} conducted)
                  </span>
                </div>
              </div>

              <div>
                {currentPct >= customTarget ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3.5 py-1.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Target {customTarget}% Met
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-100 px-3.5 py-1.5 text-xs font-extrabold text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Shortage: Missed {absent} {absent === 1 ? 'Class' : 'Classes'}
                  </span>
                )}
              </div>
            </div>

            {/* Highlighting the exact Recovery Requirement */}
            <div className="mt-4 sm:mt-5 rounded-xl bg-white/80 p-3.5 sm:p-4 backdrop-blur-xs border border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-800">
              {currentPct < customTarget ? (
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Required Action to Reach {customTarget}%:
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    You must attend the next{' '}
                    <span className="rounded-md bg-rose-600 px-2 py-0.5 font-black text-white">
                      {recoveryNeeded} consecutive {recoveryNeeded === 1 ? 'class' : 'classes'}
                    </span>{' '}
                    without missing any to pull your attendance back up to {customTarget}%.
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Attendance Cushion:
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {marginOfSafety > 0 ? (
                      <>
                        You can safely miss up to{' '}
                        <span className="rounded-md bg-emerald-600 px-2 py-0.5 font-black text-white">
                          {marginOfSafety} {marginOfSafety === 1 ? 'class' : 'classes'}
                        </span>{' '}
                        and still maintain at least {customTarget}% attendance.
                      </>
                    ) : (
                      <>You are at the exact threshold. Any absence will pull you below {customTarget}%.</>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Simulation Comparison Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Simulation Projection: +{attendNext} Present, +{missNext} Absent
            </h3>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              {/* Current */}
              <div>
                <span className="text-xs text-slate-400 font-medium">Current Percentage</span>
                <div className="text-2xl font-black text-slate-700 dark:text-slate-300">
                  {currentPct}%
                </div>
                <span className="text-xs text-slate-500">{present} / {conducted}</span>
              </div>

              <div className="flex items-center justify-center text-blue-500">
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 rotate-90 sm:rotate-0" />
              </div>

              {/* Projected */}
              <div>
                <span className="text-xs text-slate-400 font-medium">Projected Percentage</span>
                <div
                  className={`text-2xl sm:text-3xl font-black ${
                    simulatedIsSafe
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {simulatedPct}%
                </div>
                <span className="text-xs text-slate-500">
                  {simulatedPresent} / {simulatedConducted} ({pctDelta >= 0 ? `+${pctDelta}%` : `${pctDelta}%`})
                </span>
              </div>

              {/* Projected Outcome Badge */}
              <div className="sm:text-right">
                {simulatedIsSafe ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Target Achieved!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Still Below {customTarget}%
                  </span>
                )}
              </div>
            </div>

            {/* Step by Step Formula Card */}
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-200">
                <Info className="h-4 w-4 text-blue-500" />
                How the Recovery Formula Works:
              </div>
              <p className="mt-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                (Present + X) / (Conducted + X) ≥ {customTarget / 100} &nbsp;➔&nbsp; X ≥ ({customTarget / 100} × Conducted - Present) / (1 - {customTarget / 100})
              </p>
              <p className="mt-1">
                With your current figures ({present} attended out of {conducted}), solving for X yields{' '}
                <strong className="text-slate-900 dark:text-white">{recoveryNeeded} consecutive classes</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
