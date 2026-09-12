import React from 'react';
import { X, AlertTriangle, Trash2, GraduationCap, BookOpen, CalendarCheck } from 'lucide-react';
import { SemesterData } from '../types';

interface DeleteSemesterModalProps {
  isOpen: boolean;
  semester: SemesterData | null;
  onClose: () => void;
  onConfirmDelete: (semesterId: string) => void;
  isOnlySemester: boolean;
}

export const DeleteSemesterModal: React.FC<DeleteSemesterModalProps> = ({
  isOpen,
  semester,
  onClose,
  onConfirmDelete,
  isOnlySemester,
}) => {
  if (!isOpen || !semester) return null;

  const subjectCount = semester.subjects?.length || 0;
  const recordCount = semester.records?.length || 0;

  return (
    <div
      id="delete-semester-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="delete-semester-modal"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isOnlySemester ? 'Cannot Delete Semester' : 'Delete Semester'}
              </h2>
              <p className="text-xs text-slate-500">
                {semester.name} (Sem {semester.number})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-5 space-y-3">
          {isOnlySemester ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              <p className="font-semibold text-sm mb-1">At least one semester is required</p>
              <p>
                <span className="font-bold">{semester.name}</span> is currently your only semester. You cannot delete it. If you want to start fresh, you can add another semester first, or use the <strong>Reset Data</strong> option in the top right menu to clear this semester’s subjects and attendance logs.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">{semester.name}</strong>? This action cannot be undone.
              </p>

              <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3.5 dark:border-rose-950 dark:bg-rose-950/30 text-xs text-rose-900 dark:text-rose-300 space-y-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px] text-rose-700 dark:text-rose-400">
                  Data that will be removed:
                </span>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span><strong>{subjectCount}</strong> {subjectCount === 1 ? 'course' : 'courses'} enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  <span><strong>{recordCount}</strong> attendance log records</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Teaching calendar dates &amp; holidays configuration</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            {isOnlySemester ? 'Close' : 'Cancel'}
          </button>
          {!isOnlySemester && (
            <button
              type="button"
              id="confirm-delete-semester-btn"
              onClick={() => onConfirmDelete(semester.id)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-xs transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Semester</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
