import React from 'react';
import { StageItem } from '../types/job';
import { CheckCircle2, ChevronRight, ListOrdered, Calendar, Clock, AlertCircle } from 'lucide-react';

interface StageBadgeProps {
  stages: StageItem[];
  size?: 'sm' | 'md' | 'lg';
  onQuickAdvance?: () => void;
  onClick?: () => void;
  showDetails?: boolean;
}

export const StageBadge: React.FC<StageBadgeProps> = ({
  stages,
  size = 'md',
  onQuickAdvance,
  onClick,
  showDetails = false
}) => {
  const total = stages.length;
  const completed = stages.filter((s) => s.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Find the current active (next incomplete) stage
  const nextStage = stages.find((s) => !s.completed);
  const isFinished = total > 0 && completed === total;

  let progressColor = 'bg-blue-500';
  let badgeColor = 'text-blue-400 border-blue-500/30 bg-blue-500/10';

  if (completed === 0) {
    progressColor = 'bg-slate-500';
    badgeColor = 'text-slate-300 border-slate-700 bg-slate-800/80';
  } else if (isFinished) {
    progressColor = 'bg-emerald-500';
    badgeColor = 'text-emerald-300 border-emerald-500/40 bg-emerald-500/15';
  } else if (percentage >= 50) {
    progressColor = 'bg-indigo-500';
    badgeColor = 'text-indigo-300 border-indigo-500/40 bg-indigo-500/15';
  }

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  // Helper to calculate days relative to today
  const getRelativeDateInfo = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = `${monthNames[target.getMonth()]} ${target.getDate()}`;

    let relativeLabel = '';
    let isUrgent = false;

    if (diffDays === 0) {
      relativeLabel = 'Today';
      isUrgent = true;
    } else if (diffDays === 1) {
      relativeLabel = 'Tomorrow';
      isUrgent = true;
    } else if (diffDays < 0) {
      relativeLabel = `${Math.abs(diffDays)}d overdue`;
      isUrgent = true;
    } else {
      relativeLabel = `In ${diffDays}d`;
    }

    return { formatted, relativeLabel, diffDays, isUrgent };
  };

  const nextStageDateInfo = nextStage?.date ? getRelativeDateInfo(nextStage.date) : null;

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col gap-1.5 ${onClick ? 'cursor-pointer group' : ''}`}
      title={nextStage ? `Next stage: ${nextStage.name}${nextStage.date ? ` on ${nextStage.date}` : ''}` : isFinished ? 'All stages completed!' : 'No stages configured'}
    >
      {/* 2nd Column Badge: e.g. 0/3 (0%) */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded-md border ${badgeColor} ${
            isSmall ? 'text-xs px-2 py-0.5' : isLarge ? 'text-base px-3 py-1' : 'text-xs px-2.5 py-1'
          } transition-all duration-150 group-hover:border-indigo-400/60 shadow-xs`}
        >
          {isFinished ? (
            <CheckCircle2 className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-400`} />
          ) : (
            <ListOrdered className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} opacity-75`} />
          )}
          <span>{completed}/{total}</span>
          <span className="text-[10px] font-sans font-normal opacity-70">
            ({percentage}%)
          </span>
        </span>

        {onQuickAdvance && !isFinished && total > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdvance();
            }}
            title="Mark next stage as completed (+1)"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors text-xs flex items-center gap-0.5 border border-slate-800 hover:border-slate-700"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">+1</span>
          </button>
        )}
      </div>

      {/* Mini Progress Bar */}
      {total > 0 && (
        <div className="w-full min-w-[70px] max-w-[130px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-300 rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {/* Next Stage Name & Scheduled Interview Date */}
      {showDetails && nextStage && (
        <div className="flex flex-col gap-1 mt-0.5 max-w-[180px]">
          {/* Stage Name */}
          <div className="text-[11px] text-slate-400 truncate">
            Next: <span className="text-slate-200 font-medium">{nextStage.name}</span>
          </div>

          {/* Next Stage Scheduled Interview Date */}
          {nextStageDateInfo ? (
            <div
              className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                nextStageDateInfo.diffDays < 0
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-semibold'
                  : nextStageDateInfo.diffDays === 0
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-semibold animate-pulse'
                  : nextStageDateInfo.diffDays === 1
                  ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 font-medium'
                  : 'bg-slate-800/90 text-slate-300 border-slate-700'
              }`}
              title={`Scheduled for ${nextStage.date}${nextStage.time ? ` at ${nextStage.time}` : ''}`}
            >
              <Calendar className="w-3 h-3 shrink-0 text-indigo-400" />
              <span>{nextStageDateInfo.formatted}</span>
              {nextStage.time && (
                <span className="text-[10px] opacity-80">· {nextStage.time}</span>
              )}
              <span className="text-[9px] font-sans opacity-75">
                ({nextStageDateInfo.relativeLabel})
              </span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-500 flex items-center gap-1 italic">
              <Calendar className="w-2.5 h-2.5 opacity-50" />
              <span>Date TBD (Not scheduled)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
