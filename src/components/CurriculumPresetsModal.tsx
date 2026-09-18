import React from 'react';
import {
  X,
  Sparkles,
  Code,
  Cpu,
  Wrench,
  Briefcase,
  HeartPulse,
  Check,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { CURRICULA_PRESETS, CurriculumPreset } from '../data/curriculaPresets';

interface CurriculumPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (presetId: string) => void;
  onResetToClean: () => void;
  currentSubjectCount: number;
}

export const CurriculumPresetsModal: React.FC<CurriculumPresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onResetToClean,
  currentSubjectCount,
}) => {
  if (!isOpen) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="h-5 w-5 text-emerald-500" />;
      case 'Cpu':
        return <Cpu className="h-5 w-5 text-indigo-500" />;
      case 'Wrench':
        return <Wrench className="h-5 w-5 text-rose-500" />;
      case 'Briefcase':
        return <Briefcase className="h-5 w-5 text-amber-500" />;
      case 'HeartPulse':
        return <HeartPulse className="h-5 w-5 text-pink-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div
        id="curriculum-presets-modal"
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-100 p-1.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Curriculum &amp; Course Presets
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Instantly populate standard courses, timetable schedules, and realistic semester attendance with zero manual typing.
            </p>
          </div>
          <button
            id="close-presets-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Presets List */}
        <div className="mt-5 space-y-3">
          {CURRICULA_PRESETS.map((preset: CurriculumPreset) => (
            <div
              key={preset.id}
              id={`preset-card-${preset.id}`}
              className="group rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/30 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2.5 shadow-xs border border-slate-100 dark:bg-slate-900 dark:border-slate-800 shrink-0">
                    {renderIcon(preset.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {preset.name}
                      </h3>
                      <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        {preset.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {preset.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {preset.subjects.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center rounded-md bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700"
                        >
                          {s.code}: {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  id={`apply-preset-${preset.id}-btn`}
                  onClick={() => {
                    onSelectPreset(preset.id);
                    onClose();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all shrink-0 sm:self-center"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Apply Preset</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            id="preset-reset-clean-btn"
            onClick={() => {
              if (window.confirm('Clear all courses and start with a completely empty semester?')) {
                onResetToClean();
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to completely blank semester</span>
          </button>

          <button
            id="close-presets-bottom-btn"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
