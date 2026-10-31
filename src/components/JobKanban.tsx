import React, { useMemo } from 'react';
import { JobOpportunity, JobStatus } from '../types/job';
import { StageBadge } from './StageBadge';
import { getJobTimingInfo, formatStatusDateInfo } from '../services/timing';
import { FileText, Mail, Calendar, Clock, StickyNote, Kanban } from 'lucide-react';
import confetti from 'canvas-confetti';

interface JobKanbanProps {
  jobs: JobOpportunity[];
  onSelectJob: (job: JobOpportunity) => void;
  onUpdateStatus: (id: string, newStatus: JobStatus) => void;
  onQuickAdvanceStage: (job: JobOpportunity) => void;
  onOpenFollowUpForJob: (job: JobOpportunity) => void;
  showRejected?: boolean;
  onToggleShowRejected?: (show: boolean) => void;
  rejectedCount?: number;
}

const BASE_KANBAN_COLUMNS: { status: JobStatus; title: string; color: string }[] = [
  { status: 'applied', title: 'Applied', color: 'border-blue-500/40 text-blue-400' },
  { status: 'screening', title: 'HR Screening', color: 'border-indigo-500/40 text-indigo-400' },
  { status: 'interviewing', title: 'Interviewing', color: 'border-amber-500/40 text-amber-400' },
  { status: 'tech_challenge', title: 'Challenge / Case', color: 'border-purple-500/40 text-purple-400' },
  { status: 'offer', title: 'Offer Received 🎉', color: 'border-emerald-500/50 text-emerald-400' },
  { status: 'standby', title: 'Standby / Paused', color: 'border-sky-500/40 text-sky-400' },
];

const REJECTED_COLUMN: { status: JobStatus; title: string; color: string } = {
  status: 'rejected',
  title: 'Not Selected / Rejected',
  color: 'border-rose-500/40 text-rose-400'
};

export const JobKanban: React.FC<JobKanbanProps> = ({
  jobs,
  onSelectJob,
  onUpdateStatus,
  onQuickAdvanceStage,
  onOpenFollowUpForJob,
  showRejected = true,
  onToggleShowRejected,
  rejectedCount
}) => {
  const columns = useMemo(() => {
    return showRejected ? [...BASE_KANBAN_COLUMNS, REJECTED_COLUMN] : BASE_KANBAN_COLUMNS;
  }, [showRejected]);

  const handleStatusChangeWithConfetti = (id: string, newStatus: JobStatus) => {
    if (newStatus === 'offer') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
    onUpdateStatus(id, newStatus);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Kanban Navigation Header with Show Rejected Switch */}
      {onToggleShowRejected && (
        <div className="px-4 py-2 bg-slate-950/90 border border-slate-800/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-400 flex-wrap">
            {/* Switch button: Show / Hide Rejected opportunities */}
            <div className="flex items-center gap-2 mr-1">
              <button
                type="button"
                role="switch"
                aria-checked={showRejected}
                onClick={() => onToggleShowRejected(!showRejected)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
                  showRejected ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
                title={showRejected ? 'Hide rejected opportunities' : 'Show rejected opportunities'}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showRejected ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => onToggleShowRejected(!showRejected)}
                className="text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer select-none"
                title={showRejected ? 'Hide rejected opportunities' : 'Show rejected opportunities'}
              >
                <span>Show Rejected</span>
                {typeof rejectedCount === 'number' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${
                      showRejected
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {rejectedCount}
                  </span>
                )}
              </button>
            </div>

            <span className="text-slate-600">•</span>

            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Kanban className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Kanban Board</span>
            </div>

            <span className="text-slate-600">•</span>

            <span className="text-slate-300 font-medium">
              {jobs.length} {jobs.length === 1 ? 'opportunity' : 'opportunities'} across {columns.length} columns
            </span>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${columns.length > 6 ? 'xl:grid-cols-7' : 'xl:grid-cols-6'} gap-4 pb-6 overflow-x-auto`}>
        {columns.map((col) => {
        const columnJobs = jobs.filter((j) => j.status === col.status);

        return (
          <div
            key={col.status}
            className="flex flex-col rounded-2xl bg-slate-900/40 border border-slate-800/80 p-3 min-w-[280px] shadow-sm"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.color.split(' ')[1]}`} />
                <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider">
                  {col.title}
                </h3>
              </div>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
                {columnJobs.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
              {columnJobs.length === 0 ? (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-800/60 rounded-xl text-slate-600 text-xs">
                  No applications here
                </div>
              ) : (
                columnJobs.map((job) => {
                  const mainContact = job.contacts[0];
                  const mainResume = job.resumes[0];
                  const completedStages = job.stages.filter((s) => s.completed).length;
                  const totalStages = job.stages.length;

                  return (
                    <div
                      key={job.id}
                      onClick={() => onSelectJob(job)}
                      className="group bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer relative"
                    >
                      {/* Top Row: Track & Priority */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className={`text-[10px] font-mono uppercase font-semibold px-1.5 py-0.5 rounded-md border ${
                            job.category === 'JobsTech'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}
                        >
                          {job.category}
                        </span>

                        <div className="flex items-center gap-1">
                          {job.priority === 'dream_job' && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                              ⭐ Top
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 capitalize">
                            {job.workModel}
                          </span>
                        </div>
                      </div>

                      {/* Company & Title */}
                      <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {job.company}
                      </h4>
                      <p className="text-xs text-slate-300 font-medium line-clamp-1 mb-3">
                        {job.title}
                      </p>

                      {/* 2nd Column Highlight: STAGE PROGRESS (0/3) */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 mb-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                          <span className="font-semibold text-slate-300">Stage Progress:</span>
                          <span className="font-mono text-indigo-400 font-bold">
                            {completedStages}/{totalStages}
                          </span>
                        </div>
                        <StageBadge
                          stages={job.stages}
                          size="sm"
                          showDetails={true}
                          onQuickAdvance={() => onQuickAdvanceStage(job)}
                        />
                      </div>

                      {/* Timing / Follow-up pill */}
                      {(() => {
                        const timing = getJobTimingInfo(job);
                        return (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenFollowUpForJob(job);
                            }}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] border ${timing.badge} mb-2.5 cursor-pointer hover:opacity-90`}
                            title={timing.tooltip}
                          >
                            {timing.source === 'future_stage' || timing.source === 'stage' ? (
                              <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
                            ) : timing.source === 'note' ? (
                              <StickyNote className="w-3 h-3 text-emerald-400 shrink-0" />
                            ) : (
                              <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                            )}
                            <span className="font-semibold truncate">{timing.primaryText}</span>
                            <span className="opacity-75 truncate">• {timing.subText}</span>
                          </div>
                        );
                      })()}

                      {/* Recruiter & Resume Snippets */}
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                        <div className="flex items-center gap-2">
                          {mainContact ? (
                            <div className="flex items-center gap-1" title={`Recruiter: ${mainContact.name}`}>
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[90px] text-[11px] text-slate-300">
                                {mainContact.name.split(' ')[0]}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-600">No recruiter</span>
                          )}

                          {mainResume && (
                            <span title={`CV: ${mainResume.fileName}`}>
                              <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            </span>
                          )}
                        </div>

                        {/* Move Column Selector */}
                        <select
                          value={job.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChangeWithConfetti(job.id, e.target.value as JobStatus)}
                          className="text-[10px] bg-slate-800/90 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
                        >
                          <option value="applied">➔ Applied</option>
                          <option value="screening">➔ Screening</option>
                          <option value="interviewing">➔ Interviewing</option>
                          <option value="tech_challenge">➔ Challenge</option>
                          <option value="offer">➔ Offer 🎉</option>
                          <option value="standby">➔ Standby</option>
                          <option value="rejected">➔ Rejected</option>
                        </select>
                      </div>

                      {/* Status date below status actions */}
                      {(() => {
                        const statusInfo = formatStatusDateInfo(job.statusDate || job.appliedDate);
                        return (
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2 pt-1.5 border-t border-slate-800/50">
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-2.5 h-2.5" />
                              <span>Status date:</span>
                            </span>
                            <span className="text-slate-300 font-medium">
                              {statusInfo.formattedDate} <span className="text-slate-400 font-sans">({statusInfo.daysLabel})</span>
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};
