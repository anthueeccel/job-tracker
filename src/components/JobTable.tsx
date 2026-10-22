import React, { useState, useMemo, useRef, useEffect } from 'react';
import { JobOpportunity, JobStatus, STATUS_CONFIG } from '../types/job';
import { StageBadge } from './StageBadge';
import { getJobTimingInfo, formatStatusDateInfo } from '../services/timing';
import { createGoogleCalendarUrl } from '../services/calendar';
import {
  Building2,
  ExternalLink,
  MapPin,
  Calendar,
  Mail,
  Phone,
  FileText,
  StickyNote,
  Clock,
  ArrowUpRight,
  Trash2,
  Edit3,
  CalendarPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowRightLeft
} from 'lucide-react';

export type JobSortKey =
  | 'company'
  | 'stage_progress'
  | 'next_date'
  | 'status'
  | 'timing_urgency'
  | 'timing_date';

export type SortDirection = 'asc' | 'desc';

export type StageTierSortOption =
  | 'in_progress'
  | 'completed'
  | 'not_started'
  | 'high_to_low'
  | 'low_to_high';

export type StatusSortOption = JobStatus | 'pipeline_standard';

export type PageSize = 10 | 30 | 50 | 'all';

export const STAGE_TIER_LABELS: Record<StageTierSortOption, string> = {
  in_progress: 'In Progress (Active 1/3, 2/3)',
  completed: 'Completed (Finished 100%)',
  not_started: 'Not Started (0/3)',
  high_to_low: 'Most Progress (High → Low)',
  low_to_high: 'Least Progress (Low → High)'
};

/**
 * Secondary tie-breaker sort:
 * FOLLOW-UP / TIMING descending (newer to older dates).
 * Jobs with upcoming or recent timing dates come first, ordered from newest to oldest.
 */
export function compareTimingDescending(a: JobOpportunity, b: JobOpportunity): number {
  const tA = getJobTimingInfo(a);
  const tB = getJobTimingInfo(b);

  const dateA = tA.date || a.lastActivityDate?.slice(0, 10) || a.appliedDate?.slice(0, 10) || '';
  const dateB = tB.date || b.lastActivityDate?.slice(0, 10) || b.appliedDate?.slice(0, 10) || '';

  // Newer date first (descending: e.g. 2026-11-01 > 2026-10-25 > 2026-10-01)
  if (dateA && dateB) {
    const cmp = dateB.localeCompare(dateA);
    if (cmp !== 0) return cmp;
  } else if (dateA) {
    return -1; // a has date, b does not -> a comes first
  } else if (dateB) {
    return 1;  // b has date, a does not -> b comes first
  }

  // If timing dates are the same or neither exists, check notes latest timestamp
  const noteTimeA = a.notes?.length
    ? Math.max(...a.notes.map((n) => (n.createdAt ? new Date(n.createdAt).getTime() : 0)))
    : 0;
  const noteTimeB = b.notes?.length
    ? Math.max(...b.notes.map((n) => (n.createdAt ? new Date(n.createdAt).getTime() : 0)))
    : 0;
  if (noteTimeA !== noteTimeB) {
    return noteTimeB - noteTimeA;
  }

  return a.company.localeCompare(b.company);
}

interface JobTableProps {
  jobs: JobOpportunity[];
  onSelectJob: (job: JobOpportunity) => void;
  onEditJob: (job: JobOpportunity) => void;
  onDeleteJob: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: JobStatus) => void;
  onQuickAdvanceStage: (job: JobOpportunity) => void;
  onOpenFollowUpForJob: (job: JobOpportunity) => void;
}

export const JobTable: React.FC<JobTableProps> = ({
  jobs,
  onSelectJob,
  onEditJob,
  onDeleteJob,
  onUpdateStatus,
  onQuickAdvanceStage,
  onOpenFollowUpForJob
}) => {
  const [sortKey, setSortKey] = useState<JobSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Custom priority selection for Application Status and Stage Progress
  const [selectedStatusFirst, setSelectedStatusFirst] = useState<StatusSortOption>('interviewing');
  const [selectedStageTierFirst, setSelectedStageTierFirst] = useState<StageTierSortOption>('in_progress');

  // Pagination State: default is 10 items
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Horizontal scroll tracking and synchronized top/bottom controls
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);
  const [tableScrollWidth, setTableScrollWidth] = useState(1480);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!tableScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tableScrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleTopScroll = () => {
    if (isSyncingScroll.current) return;
    if (topScrollRef.current && tableScrollRef.current) {
      isSyncingScroll.current = true;
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
      checkScroll();
      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    }
  };

  const handleTableScroll = () => {
    if (isSyncingScroll.current) return;
    if (topScrollRef.current && tableScrollRef.current) {
      isSyncingScroll.current = true;
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
      checkScroll();
      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    } else {
      checkScroll();
    }
  };

  useEffect(() => {
    const updateWidthAndScroll = () => {
      if (tableScrollRef.current) {
        setTableScrollWidth(tableScrollRef.current.scrollWidth);
        checkScroll();
      }
    };
    updateWidthAndScroll();
    const timer = setTimeout(updateWidthAndScroll, 50);
    window.addEventListener('resize', updateWidthAndScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidthAndScroll);
    };
  }, [jobs, pageSize]);

  const scrollToBeginning = () => {
    tableScrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
    topScrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const scrollToLastColumn = () => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTo({
        left: tableScrollRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
    if (topScrollRef.current) {
      topScrollRef.current.scrollTo({
        left: topScrollRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleToggleSort = (key: JobSortKey) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        // Third click clears sorting back to default
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleResetSort = () => {
    setSortKey(null);
    setSortDirection('asc');
  };

  // Status progression orders
  const STATUS_PIPELINE_ASC: Record<JobStatus, number> = {
    applied: 1,
    screening: 2,
    interviewing: 3,
    tech_challenge: 4,
    offer: 5,
    standby: 6,
    rejected: 7,
    withdrawn: 8
  };

  const STATUS_PIPELINE_DESC: Record<JobStatus, number> = {
    offer: 1,
    tech_challenge: 2,
    interviewing: 3,
    screening: 4,
    applied: 5,
    standby: 6,
    rejected: 7,
    withdrawn: 8
  };

  const sortedJobs = useMemo(() => {
    if (!sortKey) return jobs;

    const list = [...jobs];

    return list.sort((a, b) => {
      let result = 0;

      switch (sortKey) {
        case 'stage_progress': {
          const totalA = a.stages?.length || 0;
          const compA = a.stages?.filter((s) => s.completed).length || 0;
          const ratioA = totalA > 0 ? compA / totalA : 0;
          const isInProgA = totalA > 0 && compA > 0 && compA < totalA;
          const isCompA = totalA > 0 && compA === totalA;
          const isNotStartedA = totalA === 0 || compA === 0;

          const totalB = b.stages?.length || 0;
          const compB = b.stages?.filter((s) => s.completed).length || 0;
          const ratioB = totalB > 0 ? compB / totalB : 0;
          const isInProgB = totalB > 0 && compB > 0 && compB < totalB;
          const isCompB = totalB > 0 && compB === totalB;
          const isNotStartedB = totalB === 0 || compB === 0;

          if (selectedStageTierFirst === 'in_progress') {
            // In progress (1/3, 2/3) first, completed second, not started third
            const tierA = isInProgA ? 1 : isCompA ? 2 : 3;
            const tierB = isInProgB ? 1 : isCompB ? 2 : 3;
            if (tierA !== tierB) {
              return tierA - tierB;
            }
            // Tie-breaker within group: FOLLOW-UP / TIMING descending (newer to older)
            return compareTimingDescending(a, b);
          }

          if (selectedStageTierFirst === 'completed') {
            // Completed (finished 100%) first, in progress second, not started third
            const tierA = isCompA ? 1 : isInProgA ? 2 : 3;
            const tierB = isCompB ? 1 : isInProgB ? 2 : 3;
            if (tierA !== tierB) {
              return tierA - tierB;
            }
            // Tie-breaker within group: FOLLOW-UP / TIMING descending (newer to older)
            return compareTimingDescending(a, b);
          }

          if (selectedStageTierFirst === 'not_started') {
            // Not started (0/3) first, in progress second, completed third
            const tierA = isNotStartedA ? 1 : isInProgA ? 2 : 3;
            const tierB = isNotStartedB ? 1 : isInProgB ? 2 : 3;
            if (tierA !== tierB) {
              return tierA - tierB;
            }
            // Tie-breaker within group: FOLLOW-UP / TIMING descending (newer to older)
            return compareTimingDescending(a, b);
          }

          if (selectedStageTierFirst === 'high_to_low') {
            if (ratioA !== ratioB) {
              return ratioB - ratioA;
            }
            if (compA !== compB) {
              return compB - compA;
            }
            return compareTimingDescending(a, b);
          }

          if (selectedStageTierFirst === 'low_to_high') {
            if (ratioA !== ratioB) {
              return ratioA - ratioB;
            }
            if (compA !== compB) {
              return compA - compB;
            }
            return compareTimingDescending(a, b);
          }

          return compareTimingDescending(a, b);
        }

        case 'status': {
          if (selectedStatusFirst !== 'pipeline_standard') {
            const isASelected = a.status === selectedStatusFirst;
            const isBSelected = b.status === selectedStatusFirst;

            // Prioritized status appears first
            if (isASelected && !isBSelected) return -1;
            if (!isASelected && isBSelected) return 1;

            if (isASelected && isBSelected) {
              // Both match the selected priority status:
              // SECOND SORT: FOLLOW-UP / TIMING descending (newer to older)
              return compareTimingDescending(a, b);
            }

            // Neither matches the prioritized status: sort remaining by pipeline progression
            const rankA = (sortDirection === 'asc' ? STATUS_PIPELINE_DESC : STATUS_PIPELINE_ASC)[a.status] ?? 99;
            const rankB = (sortDirection === 'asc' ? STATUS_PIPELINE_DESC : STATUS_PIPELINE_ASC)[b.status] ?? 99;
            if (rankA !== rankB) {
              return rankA - rankB;
            }
            // Same status: SECOND SORT: FOLLOW-UP / TIMING descending (newer to older)
            return compareTimingDescending(a, b);
          } else {
            // Standard pipeline ordering
            const rankA = (sortDirection === 'asc' ? STATUS_PIPELINE_ASC : STATUS_PIPELINE_DESC)[a.status] ?? 99;
            const rankB = (sortDirection === 'asc' ? STATUS_PIPELINE_ASC : STATUS_PIPELINE_DESC)[b.status] ?? 99;
            if (rankA !== rankB) {
              return rankA - rankB;
            }
            // SECOND SORT: FOLLOW-UP / TIMING descending (newer to older)
            return compareTimingDescending(a, b);
          }
        }

        case 'next_date': {
          const nextA = a.stages?.find((s) => !s.completed && s.date)?.date || '';
          const nextB = b.stages?.find((s) => !s.completed && s.date)?.date || '';
          if (nextA && nextB) {
            result = nextA.localeCompare(nextB);
          } else if (nextA) {
            result = -1; // Has upcoming date appears first
          } else if (nextB) {
            result = 1;
          } else {
            result = compareTimingDescending(a, b);
          }
          break;
        }

        case 'timing_urgency': {
          const tA = getJobTimingInfo(a);
          const tB = getJobTimingInfo(b);

          const getUrgencyTier = (info: typeof tA, job: JobOpportunity): number => {
            const isTerminal = job.status === 'rejected' || job.status === 'withdrawn' || job.status === 'offer';
            if (isTerminal) return 5;
            if (info.isOverdue) return 1;
            if (info.isToday) return 2;
            if (info.isFuture) return 3;
            if (info.date) return 4;
            return 6;
          };

          const tierA = getUrgencyTier(tA, a);
          const tierB = getUrgencyTier(tB, b);

          if (tierA !== tierB) {
            result = tierA - tierB;
          } else {
            if (tierA === 1) {
              // Most overdue first (more negative diffDays)
              result = tA.diffDays - tB.diffDays;
            } else if (tierA === 3) {
              // Soonest upcoming first (+1 before +5)
              result = tA.diffDays - tB.diffDays;
            } else if (tA.date && tB.date) {
              result = tB.date.localeCompare(tA.date);
            } else {
              result = compareTimingDescending(a, b);
            }
          }
          break;
        }

        case 'timing_date': {
          result = compareTimingDescending(a, b);
          break;
        }

        case 'company': {
          result = a.company.localeCompare(b.company, undefined, { sensitivity: 'base' });
          break;
        }

        default:
          result = 0;
      }

      return sortDirection === 'asc' ? result : -result;
    });
  }, [jobs, sortKey, sortDirection, selectedStatusFirst, selectedStageTierFirst]);

  // Pagination computations
  const totalItems = sortedJobs.length;
  const totalPages = pageSize === 'all' || totalItems === 0 ? 1 : Math.ceil(totalItems / pageSize);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePageSizeChange = (newSize: PageSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const paginatedJobs = useMemo(() => {
    if (pageSize === 'all' || totalItems <= pageSize) {
      return sortedJobs;
    }
    const start = (currentPage - 1) * pageSize;
    return sortedJobs.slice(start, start + pageSize);
  }, [sortedJobs, currentPage, pageSize, totalItems]);

  const startIndex = totalItems === 0 ? 0 : pageSize === 'all' ? 1 : (currentPage - 1) * pageSize + 1;
  const endIndex = pageSize === 'all' ? totalItems : Math.min(currentPage * pageSize, totalItems);

  const renderSortIcon = (key: JobSortKey) => {
    if (sortKey !== key) {
      return (
        <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60 group-hover/col:opacity-100 transition-opacity shrink-0" />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-400 shrink-0" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-400 shrink-0" />
    );
  };

  const getSortDescription = () => {
    if (!sortKey) return null;
    switch (sortKey) {
      case 'stage_progress': {
        const label = STAGE_TIER_LABELS[selectedStageTierFirst] || 'Custom';
        return `1st: Stage [${label}] ➔ 2nd: Follow-up Timing (Newer to Older)`;
      }
      case 'next_date':
        return sortDirection === 'asc' ? 'Next Interview Date (Soonest first)' : 'Next Interview Date (Furthest first)';
      case 'status': {
        const statusLabel = selectedStatusFirst === 'pipeline_standard'
          ? 'Standard Pipeline'
          : (STATUS_CONFIG[selectedStatusFirst]?.label || selectedStatusFirst);
        return `1st: Status [${statusLabel}] ➔ 2nd: Follow-up Timing (Newer to Older)`;
      }
      case 'timing_urgency':
        return sortDirection === 'asc' ? 'Follow-up Timing (Urgent & Overdue first)' : 'Follow-up Timing (Furthest future first)';
      case 'timing_date':
        return sortDirection === 'asc' ? 'Follow-up Date (Earliest to Latest)' : 'Follow-up Date (Latest to Earliest)';
      case 'company':
        return sortDirection === 'asc' ? 'Company (A to Z)' : 'Company (Z to A)';
      default:
        return null;
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto my-12">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No opportunities found</h3>
        <p className="text-sm text-slate-400 mb-6">
          There are no job applications matching your selected filters. Create a new opportunity or clear your search to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Quick Sorting Toolbar */}
      <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex flex-col gap-2.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-slate-400 flex-wrap">
            <span className="flex items-center gap-1 font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
              Sort by:
            </span>

            {/* 1. Stage Progress Pill */}
            <button
              onClick={() => handleToggleSort('stage_progress')}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                sortKey === 'stage_progress'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
              title="Sort by completed stage progress (Select which stage status comes first)"
            >
              <ListOrdered className="w-3 h-3 text-indigo-400" />
              <span>Stage Progress</span>
              {sortKey === 'stage_progress' && (
                <span className="text-[10px] font-mono bg-indigo-700/80 px-1 py-0.2 rounded">
                  {STAGE_TIER_LABELS[selectedStageTierFirst].split(' ')[0]}
                </span>
              )}
            </button>

            {/* 2. Next Interview Date Pill */}
            <button
              onClick={() => handleToggleSort('next_date')}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                sortKey === 'next_date'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
              title="Sort by upcoming scheduled interview date"
            >
              <Calendar className="w-3 h-3 text-indigo-400" />
              <span>Next Interview Date</span>
              {sortKey === 'next_date' && (
                <span className="text-[10px] font-mono bg-indigo-700/80 px-1 py-0.2 rounded">
                  {sortDirection === 'asc' ? 'Soonest first' : 'Furthest first'}
                </span>
              )}
            </button>

            {/* 3. Application Status Pill */}
            <button
              onClick={() => handleToggleSort('status')}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                sortKey === 'status'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
              title="Sort by application status (Select which status comes first)"
            >
              <span>Application Status</span>
              {sortKey === 'status' && (
                <span className="text-[10px] font-mono bg-indigo-700/80 px-1 py-0.2 rounded">
                  {selectedStatusFirst === 'pipeline_standard'
                    ? 'Pipeline'
                    : STATUS_CONFIG[selectedStatusFirst]?.label.split(' ')[0] || selectedStatusFirst}
                </span>
              )}
            </button>

            {/* 4. Follow-up / Timing Pill */}
            <button
              onClick={() => handleToggleSort('timing_urgency')}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                sortKey === 'timing_urgency'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
              title="Sort by follow-up timing urgency (Overdue & Due Today first)"
            >
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Follow-up / Timing</span>
              {sortKey === 'timing_urgency' && (
                <span className="text-[10px] font-mono bg-indigo-700/80 px-1 py-0.2 rounded">
                  {sortDirection === 'asc' ? 'Urgent & Overdue' : 'Furthest'}
                </span>
              )}
            </button>

            {/* 5. Company Name Pill */}
            <button
              onClick={() => handleToggleSort('company')}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                sortKey === 'company'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
              title="Sort alphabetically by company name"
            >
              <span>Company (A-Z)</span>
              {sortKey === 'company' && (
                <span className="text-[10px] font-mono bg-indigo-700/80 px-1 py-0.2 rounded">
                  {sortDirection === 'asc' ? 'A → Z' : 'Z → A'}
                </span>
              )}
            </button>
          </div>

          {/* Active Sort Label & Reset Button */}
          {sortKey && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Active: <strong className="text-indigo-300 font-semibold">{getSortDescription()}</strong>
              </span>
              <button
                onClick={handleResetSort}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
                title="Reset to default sorting order"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear sort</span>
              </button>
            </div>
          )}
        </div>

        {/* Priority Status Selector Sub-bar (when sorting by Application Status) */}
        {sortKey === 'status' && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 bg-slate-950/40 rounded-xl px-2.5 py-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                <span>Select status to show first:</span>
              </span>
              <select
                value={selectedStatusFirst}
                onChange={(e) => setSelectedStatusFirst(e.target.value as StatusSortOption)}
                className="bg-slate-900 border border-indigo-500/60 text-white text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium cursor-pointer"
              >
                <option value="interviewing">🟡 Interviewing (Active interviews)</option>
                <option value="offer">🎉 Offer Received</option>
                <option value="tech_challenge">🟣 Technical Challenge</option>
                <option value="screening">🔵 HR Screening</option>
                <option value="applied">🟦 Applied</option>
                <option value="standby">🕒 Awaiting Feedback (Standby)</option>
                <option value="rejected">🔴 Not Selected (Rejected)</option>
                <option value="withdrawn">⚪ Withdrawn</option>
                <option value="pipeline_standard">📊 Pipeline Order (Standard)</option>
              </select>

              {/* Quick toggle chips */}
              <div className="flex items-center gap-1">
                {(['interviewing', 'offer', 'tech_challenge', 'screening', 'applied'] as JobStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatusFirst(st)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      selectedStatusFirst === st
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {STATUS_CONFIG[st]?.label.split(' ')[0] || st}
                  </button>
                ))}
              </div>
            </div>

            {/* Crucial requirement: 2nd sort is ALWAYS Follow-up / Timing descending */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>2nd sort: <strong>Follow-up / Timing descending (newer to older)</strong></span>
            </div>
          </div>
        )}

        {/* Priority Stage Progress Selector Sub-bar (when sorting by Stage Progress) */}
        {sortKey === 'stage_progress' && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 bg-slate-950/40 rounded-xl px-2.5 py-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                <span>Select stage progress to show first:</span>
              </span>
              <select
                value={selectedStageTierFirst}
                onChange={(e) => setSelectedStageTierFirst(e.target.value as StageTierSortOption)}
                className="bg-slate-900 border border-indigo-500/60 text-white text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium cursor-pointer"
              >
                <option value="in_progress">🔄 In Progress (Active 1/3, 2/3 stages)</option>
                <option value="completed">✅ Completed (Finished 100% / Passed)</option>
                <option value="not_started">⏳ Not Started (0/3 stages)</option>
                <option value="high_to_low">📈 Most Progress (High → Low)</option>
                <option value="low_to_high">📉 Least Progress (Low → High)</option>
              </select>

              {/* Quick toggle chips */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedStageTierFirst('in_progress')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    selectedStageTierFirst === 'in_progress'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  In Progress (1/3)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStageTierFirst('completed')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    selectedStageTierFirst === 'completed'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  Completed (3/3)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStageTierFirst('not_started')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    selectedStageTierFirst === 'not_started'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  Not Started (0/3)
                </button>
              </div>
            </div>

            {/* Crucial requirement: 2nd sort is ALWAYS Follow-up / Timing descending */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>2nd sort: <strong>Follow-up / Timing descending (newer to older)</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Top Table Navigation & Pagination Header */}
      <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>List View</span>
          </div>

          <span className="text-slate-600">•</span>

          {/* Range summary */}
          <span className="text-slate-300 font-medium">
            {totalItems === 0
              ? '0 opportunities'
              : pageSize === 'all'
              ? `All ${totalItems} opportunities`
              : `Showing ${startIndex}–${endIndex} of ${totalItems}`}
          </span>

          <span className="text-slate-600 hidden sm:inline">•</span>

          {/* Page size selector pills: 10 (default), 30, 50, All */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px] mr-0.5">Show:</span>
            {([10, 30, 50, 'all'] as PageSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handlePageSizeChange(size)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  pageSize === size
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                }`}
              >
                {size === 'all' ? 'All' : size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Quick page jumper when paginated */}
          {pageSize !== 'all' && totalPages > 1 && (
            <div className="flex items-center gap-1 border-r border-slate-800 pr-2 mr-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`p-1 rounded text-xs transition-colors ${
                  currentPage === 1
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                }`}
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="text-[11px] text-slate-300 px-1 font-mono">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`p-1 rounded text-xs transition-colors ${
                  currentPage === totalPages
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                }`}
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Horizontal scroll jumps */}
          <button
            type="button"
            onClick={scrollToBeginning}
            disabled={!canScrollLeft}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
              canScrollLeft
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white cursor-pointer shadow-xs'
                : 'bg-slate-900/40 text-slate-600 border-slate-800/50 cursor-not-allowed opacity-60'
            }`}
            title="Scroll horizontally to start (Company & Position)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Start</span>
          </button>

          <button
            type="button"
            onClick={scrollToLastColumn}
            className="px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all bg-indigo-600/25 text-indigo-200 border-indigo-500/40 hover:bg-indigo-600/40 hover:text-white cursor-pointer shadow-xs"
            title="Scroll horizontally to end (Actions column)"
          >
            <span>End</span>
            <ChevronRight className="w-3.5 h-3.5 text-indigo-300" />
          </button>
        </div>
      </div>

      {/* Top Synchronized Horizontal Scroll Bar */}
      <div
        ref={topScrollRef}
        onScroll={handleTopScroll}
        className="overflow-x-auto table-horizontal-scrollbar bg-slate-950/90 border-b border-slate-800/70"
        title="Top horizontal scrollbar"
      >
        <div style={{ width: `${Math.max(1480, tableScrollWidth)}px`, height: '1px' }} />
      </div>

      <div
        ref={tableScrollRef}
        onScroll={handleTableScroll}
        className="overflow-x-auto table-horizontal-scrollbar scroll-smooth"
      >
        <table className="w-full min-w-[1480px] text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              {/* Column 1: Company & Position */}
              <th className="py-3.5 px-4 w-[280px]">
                <button
                  onClick={() => handleToggleSort('company')}
                  className="flex items-center gap-1.5 text-left font-semibold uppercase tracking-wider text-[11px] text-slate-300 hover:text-white transition-colors group/col"
                  title="Click to sort by Company (A-Z)"
                >
                  <span>Company & Position</span>
                  {renderSortIcon('company')}
                </button>
              </th>

              {/* Column 2: Stage Progress & Next Date */}
              <th
                className={`py-3.5 px-4 w-[250px] min-w-[230px] border-x transition-colors ${
                  sortKey === 'stage_progress' || sortKey === 'next_date'
                    ? 'bg-indigo-900/40 text-indigo-200 border-indigo-500/50'
                    : 'bg-indigo-950/20 text-indigo-300 border-indigo-900/30'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => handleToggleSort('stage_progress')}
                      className="flex items-center gap-1.5 text-left font-semibold uppercase tracking-wider text-[11px] hover:text-white transition-colors group/col"
                      title="Click to sort by Stage Progress"
                    >
                      <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block animate-ping" />
                      <span>Stage Progress</span>
                      {renderSortIcon('stage_progress')}
                    </button>
                    <button
                      onClick={() => handleToggleSort('next_date')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border transition-all ${
                        sortKey === 'next_date'
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                          : 'bg-indigo-950/80 text-indigo-300 border-indigo-800/80 hover:bg-indigo-900 hover:text-white'
                      }`}
                      title="Sort by next scheduled interview date"
                    >
                      <Calendar className="w-2.5 h-2.5" />
                      <span>Date</span>
                      {sortKey === 'next_date' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />
                      )}
                    </button>
                  </div>

                  {/* Header Sub-selector when Stage Progress is active */}
                  {sortKey === 'stage_progress' && (
                    <div className="flex items-center gap-1.5 pt-0.5" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] text-indigo-300/80 font-normal">1st:</span>
                      <select
                        value={selectedStageTierFirst}
                        onChange={(e) => setSelectedStageTierFirst(e.target.value as StageTierSortOption)}
                        className="bg-slate-900 text-[10px] text-white border border-indigo-500/50 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                        title="Choose which stage progress tier to show first (2nd sort will be Follow-up / Timing descending)"
                      >
                        <option value="in_progress">In Progress (1/3, 2/3)</option>
                        <option value="completed">Completed (100%)</option>
                        <option value="not_started">Not Started (0/3)</option>
                        <option value="high_to_low">High → Low %</option>
                        <option value="low_to_high">Low → High %</option>
                      </select>
                      <span className="text-[9px] text-cyan-300 font-mono ml-auto opacity-90" title="2nd sort is Follow-up / Timing descending (newer to older)">
                        ↳ 2nd: Timing
                      </span>
                    </div>
                  )}
                </div>
              </th>

              {/* Column 3: Application Status */}
              <th
                className={`py-3.5 px-4 w-[190px] transition-colors ${
                  sortKey === 'status' ? 'bg-slate-900/90 text-white' : ''
                }`}
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleToggleSort('status')}
                    className="flex items-center gap-1.5 text-left font-semibold uppercase tracking-wider text-[11px] text-slate-300 hover:text-white transition-colors group/col"
                    title="Click to sort by Application Pipeline Status"
                  >
                    <span>Status</span>
                    {renderSortIcon('status')}
                  </button>

                  {/* Header Sub-selector when Status is active */}
                  {sortKey === 'status' && (
                    <div className="flex items-center gap-1.5 pt-0.5" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] text-amber-300/80 font-normal">1st:</span>
                      <select
                        value={selectedStatusFirst}
                        onChange={(e) => setSelectedStatusFirst(e.target.value as StatusSortOption)}
                        className="bg-slate-900 text-[10px] text-white border border-amber-500/50 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                        title="Choose which status to show first (2nd sort will be Follow-up / Timing descending)"
                      >
                        <option value="interviewing">🟡 Interviewing</option>
                        <option value="offer">🎉 Offer Received</option>
                        <option value="tech_challenge">🟣 Tech Challenge</option>
                        <option value="screening">🔵 Screening</option>
                        <option value="applied">🟦 Applied</option>
                        <option value="standby">🕒 Awaiting Feedback</option>
                        <option value="rejected">🔴 Not Selected</option>
                        <option value="withdrawn">⚪ Withdrawn</option>
                        <option value="pipeline_standard">📊 Pipeline Order</option>
                      </select>
                      <span className="text-[9px] text-cyan-300 font-mono ml-auto opacity-90" title="2nd sort is Follow-up / Timing descending (newer to older)">
                        ↳ 2nd: Timing
                      </span>
                    </div>
                  )}
                </div>
              </th>

              {/* Column 4: Follow-up / Timing */}
              <th
                className={`py-3.5 px-4 w-[200px] transition-colors ${
                  sortKey === 'timing_urgency' || sortKey === 'timing_date' ? 'bg-slate-900/90 text-white' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => handleToggleSort('timing_urgency')}
                    className="flex items-center gap-1.5 text-left font-semibold uppercase tracking-wider text-[11px] text-slate-300 hover:text-white transition-colors group/col"
                    title="Click to sort by Follow-up Urgency (Overdue & Today first)"
                  >
                    <span>Follow-up / Timing</span>
                    {renderSortIcon('timing_urgency')}
                  </button>
                  <button
                    onClick={() => handleToggleSort('timing_date')}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border transition-all ${
                      sortKey === 'timing_date'
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                    title="Sort chronologically by timing date"
                  >
                    <Clock className="w-2.5 h-2.5" />
                    <span>Date</span>
                    {sortKey === 'timing_date' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />
                    )}
                  </button>
                </div>
              </th>

              <th className="py-3.5 px-4 w-[190px] min-w-[180px]">Recruiter Contact</th>
              <th className="py-3.5 px-4 w-[180px] min-w-[170px]">Tailored Resume</th>
              <th className="py-3.5 px-4 w-[140px] min-w-[130px]">Salary / Target</th>
              {/* Column 8: Actions (Sticky to Far-Right) */}
              <th className="py-3.5 px-4 w-[110px] min-w-[110px] text-right sticky right-0 bg-slate-950/95 backdrop-blur-xs border-l border-slate-800/90 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.6)] z-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedJobs.map((job) => {
              const statusCfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.applied;
              const timing = getJobTimingInfo(job);
              const mainContact = job.contacts[0];
              const mainResume = job.resumes[0];

              return (
                <tr
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  {/* Column 1: Company & Title */}
                  <td className="py-3 px-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-sm text-slate-200 shrink-0 shadow-xs group-hover:border-indigo-500/50 transition-colors">
                        {job.company.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {job.company}
                          </span>
                          {job.priority === 'dream_job' && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                              ⭐ Top
                            </span>
                          )}
                          {job.jobUrl && (
                            <a
                              href={job.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-500 hover:text-indigo-400 transition-colors"
                              title="Open original job posting"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-slate-300 font-medium text-xs truncate mt-0.5">
                          {job.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-semibold ${
                              job.category === 'JobsTech'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            }`}
                          >
                            {job.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 opacity-70" />
                            <span className="truncate max-w-[120px]">{job.location}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: STAGE PROGRESS (0/3, 1/3, 2/4) - Highlighted */}
                  <td className="py-3 px-4 bg-indigo-950/10 border-x border-indigo-900/20">
                    <div className="flex flex-col gap-1">
                      <StageBadge
                        stages={job.stages}
                        onQuickAdvance={() => onQuickAdvanceStage(job)}
                        showDetails={true}
                      />
                    </div>
                  </td>

                  {/* Column 3: Application Status */}
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-start gap-1">
                      <select
                        value={job.status}
                        onChange={(e) => onUpdateStatus(job.id, e.target.value as JobStatus)}
                        className={`text-xs font-medium rounded-lg px-2.5 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${statusCfg.badgeBg}`}
                      >
                        <option value="applied" className="bg-slate-900 text-blue-400">Applied</option>
                        <option value="screening" className="bg-slate-900 text-indigo-400">HR Screening</option>
                        <option value="interviewing" className="bg-slate-900 text-amber-400">Interviewing</option>
                        <option value="tech_challenge" className="bg-slate-900 text-purple-400">Technical Challenge</option>
                        <option value="offer" className="bg-slate-900 text-emerald-400">Offer Received 🎉</option>
                        <option value="standby" className="bg-slate-900 text-sky-400">Awaiting Feedback</option>
                        <option value="rejected" className="bg-slate-900 text-rose-400">Not Selected</option>
                        <option value="withdrawn" className="bg-slate-900 text-slate-400">Withdrawn</option>
                      </select>

                      {/* Date below the Status badge */}
                      {(() => {
                        const statusInfo = formatStatusDateInfo(job.statusDate || job.appliedDate);
                        return (
                          <div
                            className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono"
                            title={`Status "${statusCfg.label}" set on ${statusInfo.formattedDate} (${statusInfo.daysLabel})`}
                          >
                            <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="text-slate-300 font-medium">{statusInfo.formattedDate}</span>
                            <span
                              className={`text-[10px] px-1 py-0.2 rounded font-sans ${
                                statusInfo.isToday
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {statusInfo.daysLabel}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </td>

                  {/* Column 4: Follow-up & Timing */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFollowUpForJob(job);
                        }}
                        className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border ${timing.badge} hover:opacity-90 transition-opacity text-left min-w-[145px] max-w-[200px]`}
                        title={timing.tooltip}
                      >
                        {timing.source === 'future_stage' || timing.source === 'stage' ? (
                          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        ) : timing.source === 'note' ? (
                          <StickyNote className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-xs truncate leading-tight">
                            {timing.primaryText}
                          </span>
                          <span className="text-[10px] opacity-80 truncate leading-tight mt-0.5">
                            {timing.subText}
                          </span>
                        </div>
                        <ArrowUpRight className="w-3 h-3 opacity-60 ml-auto shrink-0" />
                      </button>

                      {/* Google Calendar Action in Follow-up / Timing column */}
                      {job.calendarEventLink ? (
                        <a
                          href={job.calendarEventLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors shrink-0"
                          title="Synced with Google Calendar - Click to view event in Google Calendar"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <a
                          href={timing.calendarUrl || createGoogleCalendarUrl(job)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors shrink-0"
                          title={`Add to Google Calendar (${timing.primaryText || job.company})`}
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Column 5: Recruiter Contact */}
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    {mainContact ? (
                      <div>
                        <div className="font-medium text-slate-200 truncate max-w-[150px]">
                          {mainContact.name}
                        </div>
                        {mainContact.role && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {mainContact.role}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {mainContact.email && (
                            <a
                              href={`mailto:${mainContact.email}`}
                              className="text-indigo-400 hover:text-indigo-300 p-1 rounded hover:bg-slate-800"
                              title={`Email ${mainContact.email}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {mainContact.phone && (
                            <a
                              href={`https://wa.me/${mainContact.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-slate-800"
                              title={`Chat with ${mainContact.phone} on WhatsApp`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectJob(job)}
                        className="text-[11px] text-slate-500 hover:text-indigo-400 transition-colors"
                      >
                        + Add recruiter
                      </button>
                    )}
                  </td>

                  {/* Column 6: Tailored Resume */}
                  <td className="py-3 px-4">
                    {mainResume ? (
                      <div className="flex items-center gap-1.5" title={mainResume.tailoredFocus || mainResume.fileName}>
                        <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-slate-300 font-medium truncate max-w-[140px]">
                            {mainResume.fileName}
                          </div>
                          {mainResume.versionLabel && (
                            <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                              {mainResume.versionLabel}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-600 italic">No CV attached</span>
                    )}
                  </td>

                  {/* Column 7: Target Compensation */}
                  <td className="py-3 px-4">
                    {job.salaryExpected ? (
                      <div className="text-slate-300 font-mono text-xs">
                        {job.salaryExpected}
                      </div>
                    ) : (
                      <span className="text-slate-600 text-[11px]">Negotiable</span>
                    )}
                  </td>

                  {/* Column 8: Actions (Sticky to Far-Right) */}
                  <td
                    className="py-3 px-4 text-right sticky right-0 bg-slate-900/95 group-hover:bg-slate-800/95 backdrop-blur-xs border-l border-slate-800/80 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.6)] z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditJob(job)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        title="Edit opportunity"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteJob(job.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete opportunity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Summary & Pagination Bar */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3 flex-wrap">
          <span>
            Showing <strong className="font-semibold text-slate-200">
              {totalItems === 0
                ? 0
                : pageSize === 'all'
                ? totalItems
                : `${startIndex}–${endIndex} of ${totalItems}`}
            </strong> opportunities
          </span>

          {/* Per page selector */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px]">Per page:</span>
            {([10, 30, 50, 'all'] as PageSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handlePageSizeChange(size)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  pageSize === size
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {size === 'all' ? 'All' : size}
              </button>
            ))}
          </div>

          {sortKey && (
            <span className="px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-800/40 text-[11px]">
              Sorted by {getSortDescription()}
            </span>
          )}
        </div>

        {/* Center: Pagination Controls */}
        {pageSize !== 'all' && totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border text-xs flex items-center transition-colors ${
                currentPage === 1
                  ? 'bg-slate-900/40 border-slate-800/60 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer'
              }`}
              title="First page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border text-xs flex items-center transition-colors ${
                currentPage === 1
                  ? 'bg-slate-900/40 border-slate-800/60 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer'
              }`}
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
                })
                .map((pageNum, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const showEllipsis = prevPage && pageNum - prevPage > 1;

                  return (
                    <React.Fragment key={pageNum}>
                      {showEllipsis && <span className="px-1 text-slate-600 font-mono">…</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white font-bold shadow-xs'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border text-xs flex items-center transition-colors ${
                currentPage === totalPages
                  ? 'bg-slate-900/40 border-slate-800/60 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer'
              }`}
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border text-xs flex items-center transition-colors ${
                currentPage === totalPages
                  ? 'bg-slate-900/40 border-slate-800/60 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer'
              }`}
              title="Last page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right: Scroll Start and End buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={scrollToBeginning}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            title="Scroll horizontally to start"
          >
            <ChevronLeft className="w-3 h-3" />
            <span>Start</span>
          </button>
          <button
            type="button"
            onClick={scrollToLastColumn}
            className="px-2.5 py-1 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            title="Scroll horizontally to end (Actions column)"
          >
            <span>End</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
