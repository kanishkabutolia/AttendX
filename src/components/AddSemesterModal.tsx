import React, { useState } from 'react';
import { X, GraduationCap, Calendar, Plus, Sparkles, BookOpen } from 'lucide-react';
import { SemesterData, Subject } from '../types';
import { generateTeachingDaysRange } from '../utils/attendanceUtils';

interface AddSemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSemester: (newSemester: SemesterData) => void;
  existingSemesters: SemesterData[];
  currentSubjects: Subject[];
}

export const AddSemesterModal: React.FC<AddSemesterModalProps> = ({
  isOpen,
  onClose,
  onAddSemester,
  existingSemesters,
  currentSubjects,
}) => {
  // Suggest next semester number (e.g. if 5 exists, suggest 6)
  const maxSemNumber = existingSemesters.reduce((max, s) => Math.max(max, s.number || 0), 5);
  const defaultNextNumber = maxSemNumber + 1;

  const [semNumber, setSemNumber] = useState<number>(defaultNextNumber);
  const [semName, setSemName] = useState<string>(`Semester ${defaultNextNumber}`);
  const [startDate, setStartDate] = useState<string>('2027-01-15');
  const [endDate, setEndDate] = useState<string>('2027-05-31');
  const [copySubjects, setCopySubjects] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNumber = Number(semNumber) || defaultNextNumber;
    const finalName = semName.trim() || `Semester ${finalNumber}`;
    const semId = `sem-${finalNumber}-${Date.now()}`;

    // Fresh subjects or copy subjects with new IDs and reset records
    const initialSubjects: Subject[] = copySubjects
      ? currentSubjects.map((s) => ({
          ...s,
          id: `subj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          targetPercentage: 100,
        }))
      : [];

    const teachingDays = generateTeachingDaysRange(startDate, endDate, [1, 2, 3, 4, 5]);

    const newSemester: SemesterData = {
      id: semId,
      number: finalNumber,
      name: finalName,
      startDate,
      endDate,
      subjects: initialSubjects,
      records: [], // Fresh attendance records!
      teachingDays,
      createdAt: Date.now(),
    };

    onAddSemester(newSemester);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div
        id="add-semester-modal"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add New Semester
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Start a fresh academic term while preserving your previous semester attendance.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Semester Number
              </label>
              <input
                type="number"
                min="1"
                max="12"
                required
                value={semNumber}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSemNumber(val);
                  setSemName(`Semester ${val}`);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Title
              </label>
              <input
                type="text"
                required
                value={semName}
                onChange={(e) => setSemName(e.target.value)}
                placeholder="e.g. Semester 6"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Option: Fresh vs Copy courses */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={copySubjects}
                onChange={(e) => setCopySubjects(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Preload course names from current semester
                </span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  {copySubjects
                    ? `Will copy ${currentSubjects.length} subjects with clean 0% attendance records.`
                    : 'Leaves subjects empty so you can add fresh new courses for this semester.'}
                </p>
              </div>
            </label>
          </div>

          <div className="rounded-xl bg-blue-50/70 p-3 text-xs text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
            <span className="font-bold">✨ Fast Switching:</span> Once created, you can switch back to any previous semester at any time by clicking the semester button in the top navigation bar.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-create-semester-btn"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Semester {semNumber}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
