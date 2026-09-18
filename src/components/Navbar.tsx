import React, { useState, useRef, useEffect } from 'react';
import {
  CalendarCheck,
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Calculator,
  Plus,
  GraduationCap,
  ChevronDown,
  Check,
  Trash2,
} from 'lucide-react';
import { SemesterData } from '../types';

export type NavTab = 'dashboard' | 'daily' | 'monthly' | 'planner' | 'simulator';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAddSubject: () => void;
  onResetData: () => void;
  overallPercentage: number;
  overallRecoveryNeeded: number;
  semesters: SemesterData[];
  activeSemesterId: string;
  onSelectSemester: (semId: string) => void;
  onOpenAddSemester: () => void;
  onDeleteSemester: (semId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddSubject,
  overallPercentage,
  semesters = [],
  activeSemesterId,
  onSelectSemester,
  onOpenAddSemester,
  onDeleteSemester,
}) => {
  const isPerfect = overallPercentage >= 100;
  const safeSemesters = Array.isArray(semesters) ? semesters : [];
  const activeSemester = safeSemesters.find((s) => s.id === activeSemesterId) || safeSemesters[0] || null;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: {
    id: NavTab;
    elementId: string;
    label: string;
    shortLabel: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'dashboard', elementId: 'nav-tab-dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily', elementId: 'nav-tab-daily', label: 'Mark Attendance', shortLabel: 'Mark', icon: CalendarCheck },
    { id: 'monthly', elementId: 'nav-tab-monthly', label: 'Monthly', shortLabel: 'Monthly', icon: BarChart3 },
    { id: 'planner', elementId: 'nav-tab-planner', label: 'Planner', shortLabel: 'Planner', icon: CalendarDays },
    { id: 'simulator', elementId: 'nav-tab-simulator', label: 'Calculator', shortLabel: 'Calc', icon: Calculator },
  ];

  return (
    <header
      id="app-navbar"
      className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand & Dropdown-Only Semester Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <CalendarCheck className="h-4 w-4" />
              </div>
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                AttendX
              </span>
            </div>

            {/* Semester Dropdown Selector ONLY (not individual buttons in navbar) */}
            <div className="relative pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800" ref={dropdownRef}>
              <button
                id="nav-semester-dropdown-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                title="Switch semester, add new semester, or delete semester"
                className="inline-flex items-center gap-1 sm:gap-2 rounded-xl bg-slate-100 px-2 sm:px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/80 dark:border-slate-700/60 shadow-2xs"
              >
                <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="font-bold max-w-[75px] xs:max-w-[110px] sm:max-w-[150px] truncate">
                  {activeSemester ? activeSemester.name : 'Select'}
                </span>
                <ChevronDown
                  className={`h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500 transition-transform duration-200 shrink-0 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown for selecting semesters and adding/deleting */}
              {isDropdownOpen && (
                <div
                  id="semester-dropdown-menu"
                  className="absolute left-0 mt-2 w-60 sm:w-64 rounded-2xl border border-slate-200 bg-white p-2 sm:p-2.5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Semesters ({safeSemesters.length})</span>
                    <span className="text-[10px] lowercase font-normal text-slate-400">click to switch</span>
                  </div>

                  {/* List of Semesters in Dropdown */}
                  <div className="mt-1 space-y-1 max-h-56 overflow-y-auto pr-0.5">
                    {safeSemesters.map((s) => {
                      const isCurrent = s.id === activeSemesterId;
                      const subCount = s.subjects?.length || 0;
                      return (
                        <div
                          key={s.id}
                          className={`group flex items-center justify-between rounded-xl p-1.5 transition-colors ${
                            isCurrent
                              ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/70 dark:text-blue-200 font-bold'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          <button
                            id={`dropdown-sem-select-${s.id}`}
                            onClick={() => {
                              onSelectSemester(s.id);
                              setIsDropdownOpen(false);
                            }}
                            className="flex flex-1 items-center gap-2.5 text-left text-xs min-w-0"
                          >
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                isCurrent
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <GraduationCap className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-semibold leading-tight truncate">{s.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {subCount} {subCount === 1 ? 'subject' : 'subjects'}
                              </span>
                            </div>
                          </button>

                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {isCurrent && (
                              <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                                Active
                              </span>
                            )}
                            <button
                              id={`dropdown-sem-delete-${s.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSemester(s.id);
                              }}
                              title={
                                safeSemesters.length <= 1
                                  ? 'Cannot delete the only semester'
                                  : `Delete ${s.name}`
                              }
                              disabled={safeSemesters.length <= 1}
                              className={`rounded-lg p-1.5 transition-colors ${
                                safeSemesters.length <= 1
                                  ? 'opacity-30 cursor-not-allowed text-slate-400'
                                  : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400'
                              }`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add New Semester Button (ONLY visible after dropdown is opened) */}
                  <div className="mt-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                    <button
                      id="nav-dropdown-add-sem-btn"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenAddSemester();
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors shadow-2xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add New Semester</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Clean Nav Tabs (Desktop) */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={item.elementId}
                  onClick={() => onTabChange(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Status & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Status Pill compared to 100% */}
            <div
              title={`Overall Semester Attendance: ${overallPercentage}% out of 100% full attendance`}
              className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-2.5 py-1 text-xs font-semibold shrink-0 ${
                isPerfect
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : overallPercentage >= 75
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${
                  isPerfect ? 'bg-emerald-500' : overallPercentage >= 75 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
                }`}
              />
              <span className="font-bold">{overallPercentage}%</span>
              <span className="hidden sm:inline text-[10px] opacity-70">/ 100%</span>
            </div>

            {/* Add Subject Primary CTA */}
            <button
              id="open-add-subject-btn"
              onClick={onOpenAddSubject}
              title="Add New Course / Subject"
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2 sm:px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-xs shrink-0"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline">Subject</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar (visible only on mobile) */}
        <nav aria-label="Mobile Navigation" className="flex md:hidden items-center justify-between gap-0.5 py-1.5 border-t border-slate-100 dark:border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? 'text-blue-600 font-bold bg-blue-50/60 dark:bg-blue-950/40 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="truncate max-w-[62px] text-center leading-tight mt-0.5">{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
