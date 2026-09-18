import React, { useState } from 'react';
import { X, Plus, BookOpen, Check } from 'lucide-react';
import { Subject } from '../types';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    subject: Omit<Subject, 'id'>,
    editId?: string,
    initialAttendance?: { conducted: number; attended: number }
  ) => void;
  editingSubject?: Subject | null;
}

const COLOR_OPTIONS = [
  { id: 'emerald', name: 'Emerald', class: 'bg-emerald-500' },
  { id: 'indigo', name: 'Indigo', class: 'bg-indigo-500' },
  { id: 'blue', name: 'Blue', class: 'bg-blue-500' },
  { id: 'amber', name: 'Amber', class: 'bg-amber-500' },
  { id: 'rose', name: 'Rose', class: 'bg-rose-500' },
  { id: 'purple', name: 'Purple', class: 'bg-purple-500' },
  { id: 'cyan', name: 'Cyan', class: 'bg-cyan-500' },
];

const DAYS_OF_WEEK = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
];

const TARGET_PRESETS = [75, 80, 85, 90, 100];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSubject,
}) => {
  const [name, setName] = useState(editingSubject?.name || '');
  const [code, setCode] = useState(editingSubject?.code || '');
  const [color, setColor] = useState(editingSubject?.color || 'emerald');
  const [targetPercentage, setTargetPercentage] = useState(
    editingSubject?.targetPercentage ?? 85
  );
  const [scheduledDays, setScheduledDays] = useState<number[]>(
    editingSubject?.scheduledDays || [1, 2, 3, 4, 5]
  );
  const [credits, setCredits] = useState(editingSubject?.credits || 3);
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false);
  const [initialConducted, setInitialConducted] = useState<number>(0);
  const [initialAttended, setInitialAttended] = useState<number>(0);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    if (scheduledDays.includes(day)) {
      setScheduledDays(scheduledDays.filter((d) => d !== day));
    } else {
      setScheduledDays([...scheduledDays, day].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a course or subject name');
      return;
    }

    if (hasExistingAttendance && initialAttended > initialConducted) {
      setError('Attended classes cannot exceed total conducted classes');
      return;
    }

    onSave(
      {
        name: name.trim(),
        code: code.trim() || name.slice(0, 3).toUpperCase() + '-101',
        color,
        targetPercentage: Number(targetPercentage) || 85,
        credits: Number(credits) || 3,
        scheduledDays,
      },
      editingSubject?.id,
      !editingSubject && hasExistingAttendance && initialConducted > 0
        ? { conducted: Number(initialConducted), attended: Number(initialAttended) }
        : undefined
    );

    onClose();
  };

  return (
    <div
      id="add-subject-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="add-subject-modal-container"
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingSubject ? 'Edit Subject' : 'Add Subject'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your course schedule and attendance criteria
              </p>
            </div>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Subject / Course Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="subject-name-input"
              type="text"
              required
              placeholder="e.g. Mathematics, Operating Systems, Chemistry"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Course Code (Optional)
              </label>
              <input
                id="subject-code-input"
                type="text"
                placeholder="e.g. CS101, MATH201"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Target Attendance %
              </label>
              <div className="relative">
                <input
                  id="subject-target-input"
                  type="number"
                  min="50"
                  max="100"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="pointer-events-none absolute right-3 top-2.5 text-sm font-bold text-slate-400">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Quick Target Presets */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-medium text-slate-500">Quick Target:</span>
            <div className="flex items-center gap-1">
              {TARGET_PRESETS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTargetPercentage(t)}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                    targetPercentage === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {t}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Weekly Timetable Days
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map(({ day, label }) => {
                const isSelected = scheduledDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    id={`toggle-day-${day}-btn`}
                    onClick={() => toggleDay(day)}
                    className={`flex h-9 min-w-10 items-center justify-center rounded-xl px-2.5 text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Color Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  id={`color-opt-${opt.id}`}
                  onClick={() => setColor(opt.id)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform ${opt.class} ${
                    color === opt.id ? 'scale-110 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={opt.name}
                >
                  {color === opt.id && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Starting Mid-Semester Baseline option */}
          {!editingSubject && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={hasExistingAttendance}
                  onChange={(e) => setHasExistingAttendance(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Starting mid-semester? Enter classes held so far</span>
              </label>

              {hasExistingAttendance && (
                <div className="mt-3 grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Total Classes Held:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={initialConducted}
                      onChange={(e) => setInitialConducted(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      placeholder="e.g. 15"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Classes Attended:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={initialConducted}
                      value={initialAttended}
                      onChange={(e) => setInitialAttended(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      placeholder="e.g. 13"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              id="cancel-subject-btn"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-subject-btn"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {editingSubject ? 'Save Changes' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
