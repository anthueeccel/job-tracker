import React, { useState } from 'react';
import { JobCategory, JobOpportunity } from '../types/job';
import { calculateFollowUps } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Code2,
  Users2,
  Layers,
  Table,
  List,
  Kanban,
  Calendar,
  BarChart3,
  Bell,
  Plus,
  Download,
  Search,
  SlidersHorizontal,
  Sparkles,
  Cloud,
  LogIn,
  LogOut,
  User as UserIcon,
  Loader2
} from 'lucide-react';

export type ViewMode = 'table' | 'kanban' | 'calendar' | 'analytics';

interface HeaderProps {
  currentCategory: JobCategory | 'All';
  onCategoryChange: (cat: JobCategory | 'All') => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  jobs: JobOpportunity[];
  onOpenNewJobModal: () => void;
  onOpenFollowUpModal: () => void;
  onOpenExportModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (st: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  jobs,
  onOpenNewJobModal,
  onOpenFollowUpModal,
  onOpenExportModal,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const techCount = jobs.filter((j) => j.category === 'JobsTech').length;
  const mgmCount = jobs.filter((j) => j.category === 'JobsMgm').length;
  const totalCount = jobs.length;

  const followUps = calculateFollowUps(jobs);
  const overdueCount = followUps.filter((f) => f.isOverdue).length;
  const todayCount = followUps.filter((f) => f.isToday).length;
  const totalFollowUpAlerts = overdueCount + todayCount;

  const { user, signIn, signOut, loading: authLoading, isCalendarConnected } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignInClick = async () => {
    try {
      setIsSigningIn(true);
      await signIn();
    } catch (err) {
      console.error('Sign in error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      {/* Top Banner with Brand and Global Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                JobTracker Pro
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> Active Pipeline
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Smart spreadsheet replacement for <span className="text-slate-200 font-medium">JobsTech</span> & <span className="text-slate-200 font-medium">JobsMgm</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* 1. New Opportunity Button - FIRST BUTTON ON THE LEFT */}
          <button
            onClick={onOpenNewJobModal}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </button>

          {/* 2. Follow-ups & Reminders Button */}
          <button
            onClick={onOpenFollowUpModal}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all shrink-0 ${
              totalFollowUpAlerts > 0
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 shadow-xs'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="View pending follow-ups and outreach reminders"
          >
            <Bell className={`w-4 h-4 ${totalFollowUpAlerts > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Follow-ups & Alerts</span>
            {totalFollowUpAlerts > 0 ? (
              <span className="flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {totalFollowUpAlerts}
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">{followUps.length}</span>
            )}
          </button>

          {/* 3. Export / Spreadsheet Button */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors shrink-0"
            title="Export to CSV spreadsheet or JSON backup"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Export / CSV</span>
          </button>

          {/* 4. User Profile & Cloud Status */}
          {user && (
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/80 rounded-lg px-2.5 py-1.5 shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-indigo-500/40 object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate leading-tight">
                  {user.displayName || user.email}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 leading-tight">
                  <Cloud className="w-2.5 h-2.5" /> Firebase Synced
                </span>
              </div>
            </div>
          )}

          {/* 5. Log Out / Disconnect Button - LAST BUTTON ON THE FAR RIGHT */}
          {user && (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/20 hover:text-white transition-all cursor-pointer shrink-0 ml-1"
              title="Log out and return to the login page"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Row: Category Tracks & View Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Category Tabs: JobsTech, JobsMgm, All */}
        <div className="flex items-center p-1 bg-slate-950/70 border border-slate-800/80 rounded-xl">
          <button
            onClick={() => onCategoryChange('JobsTech')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentCategory === 'JobsTech'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JobsTech</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                currentCategory === 'JobsTech'
                  ? 'bg-indigo-800/70 text-indigo-100'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {techCount}
            </span>
          </button>

          <button
            onClick={() => onCategoryChange('JobsMgm')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentCategory === 'JobsMgm'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>JobsMgm</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                currentCategory === 'JobsMgm'
                  ? 'bg-indigo-800/70 text-indigo-100'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {mgmCount}
            </span>
          </button>

          <button
            onClick={() => onCategoryChange('All')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentCategory === 'All'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Opportunities</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                currentCategory === 'All'
                  ? 'bg-indigo-800/70 text-indigo-100'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {totalCount}
            </span>
          </button>
        </div>

        {/* View Mode Toggle: Table, Kanban, Calendar, Analytics */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/70 border border-slate-800/80 rounded-xl">
          <button
            onClick={() => onViewModeChange('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-slate-800 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Enhanced spreadsheet list with stage progress (0/3)"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>

          <button
            onClick={() => onViewModeChange('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'kanban'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Interactive Kanban board organized by interview stage"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kanban</span>
          </button>

          <button
            onClick={() => onViewModeChange('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'calendar'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Interview timeline and Google Calendar sync"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Calendar & Sync</span>
          </button>

          <button
            onClick={() => onViewModeChange('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'analytics'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Conversion metrics and pipeline funnel"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Analytics</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-t border-slate-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[220px] max-w-md relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by company, position title, skills, or city..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/40"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500/80 text-xs"
          >
            <option value="all">All statuses</option>
            <option value="active">Active applications only</option>
            <option value="applied">Applied</option>
            <option value="screening">HR Screening</option>
            <option value="interviewing">Interviewing</option>
            <option value="tech_challenge">Technical Challenge</option>
            <option value="offer">Offer Received 🎉</option>
            <option value="standby">Awaiting Feedback</option>
            <option value="rejected">Not Selected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>
    </header>
  );
};
