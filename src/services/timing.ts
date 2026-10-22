import { JobOpportunity, StageItem } from '../types/job';
import { createGoogleCalendarUrl } from './calendar';

export interface JobTimingInfo {
  date: string; // YYYY-MM-DD
  source: 'future_stage' | 'future_follow_up' | 'stage' | 'note' | 'activity' | 'applied' | 'none';
  sourceLabel: string; // "Stage", "Note", "Follow-up", "Activity", "Applied"
  stageName?: string;
  diffDays: number; // >0 future, 0 today, <0 past
  isFuture: boolean;
  isToday: boolean;
  isOverdue: boolean;
  primaryText: string;
  subText: string;
  tooltip: string;
  badge: string;
  calendarDate?: string;
  calendarTime?: string;
  calendarTitle?: string;
  calendarUrl?: string;
  stage?: StageItem;
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysDiff(targetDateStr: string, todayStr: string): number {
  try {
    const target = new Date(`${targetDateStr}T00:00:00`).getTime();
    const today = new Date(`${todayStr}T00:00:00`).getTime();
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
}

/**
 * Calculates the exact timing display for a job:
 * 1. If there is a scheduled date in the future (stage date or next follow-up date),
 *    always show that upcoming future date.
 * 2. If there are no future dates, always show the LAST ADDED date between
 *    the interview stages and the notes (e.g., if note was added today and interview
 *    stage was yesterday, show the note date).
 */
export function getJobTimingInfo(job: JobOpportunity): JobTimingInfo {
  const todayStr = getTodayString();

  // 1. Check for FUTURE dates first (e.g. upcoming interview stage or scheduled follow-up)
  interface FutureCandidate {
    date: string;
    time?: string;
    source: 'future_stage' | 'future_follow_up';
    stage?: StageItem;
    name?: string;
  }

  const futureCandidates: FutureCandidate[] = [];

  // Check uncompleted stages with a future date
  if (job.stages && job.stages.length > 0) {
    for (const st of job.stages) {
      if (st.date && st.date > todayStr) {
        futureCandidates.push({
          date: st.date,
          time: st.time,
          source: 'future_stage',
          stage: st,
          name: st.name
        });
      }
    }
  }

  // Check scheduled follow-up date in the future
  if (job.nextFollowUpDate && job.nextFollowUpDate > todayStr) {
    futureCandidates.push({
      date: job.nextFollowUpDate,
      source: 'future_follow_up',
      name: 'Follow-up'
    });
  }

  // If we have future dates, pick the earliest upcoming one
  if (futureCandidates.length > 0) {
    futureCandidates.sort((a, b) => a.date.localeCompare(b.date));
    const upcoming = futureCandidates[0];
    const diffDays = getDaysDiff(upcoming.date, todayStr);

    if (upcoming.source === 'future_stage') {
      const gcal = createGoogleCalendarUrl(job, upcoming.stage, upcoming.date, upcoming.time);
      return {
        date: upcoming.date,
        source: 'future_stage',
        sourceLabel: 'Stage',
        stageName: upcoming.name,
        diffDays,
        isFuture: true,
        isToday: false,
        isOverdue: false,
        primaryText: `Stage: ${upcoming.date}`,
        subText: `In ${diffDays}d • ${upcoming.name}`,
        tooltip: `Upcoming interview stage "${upcoming.name}" scheduled for ${upcoming.date} (in ${diffDays} days).`,
        badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 font-medium',
        calendarDate: upcoming.date,
        calendarTime: upcoming.time,
        calendarTitle: `Interview (${upcoming.name})`,
        calendarUrl: gcal,
        stage: upcoming.stage
      };
    } else {
      const gcal = createGoogleCalendarUrl(job, undefined, upcoming.date);
      return {
        date: upcoming.date,
        source: 'future_follow_up',
        sourceLabel: 'Follow-up',
        diffDays,
        isFuture: true,
        isToday: false,
        isOverdue: false,
        primaryText: `Follow-up: ${upcoming.date}`,
        subText: `In ${diffDays}d`,
        tooltip: `Follow-up check-in scheduled for ${upcoming.date} (in ${diffDays} days).`,
        badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-medium',
        calendarDate: upcoming.date,
        calendarTitle: `Follow-up outreach`,
        calendarUrl: gcal
      };
    }
  }

  // 2. No future dates: Find the LAST ADDED date between interview stages and notes
  interface PastCandidate {
    date: string;
    source: 'note' | 'stage' | 'activity' | 'applied';
    stage?: StageItem;
    name?: string;
    createdAtTimestamp?: number;
  }

  const pastCandidates: PastCandidate[] = [];

  // Collect notes dates (<= todayStr)
  if (job.notes && job.notes.length > 0) {
    for (const n of job.notes) {
      if (n.createdAt) {
        const noteDate = n.createdAt.slice(0, 10);
        if (noteDate <= todayStr) {
          const ts = new Date(n.createdAt).getTime();
          pastCandidates.push({
            date: noteDate,
            source: 'note',
            createdAtTimestamp: isNaN(ts) ? 0 : ts
          });
        }
      }
    }
  }

  // Collect stage dates (<= todayStr)
  if (job.stages && job.stages.length > 0) {
    for (const st of job.stages) {
      if (st.date && st.date <= todayStr) {
        pastCandidates.push({
          date: st.date,
          source: 'stage',
          stage: st,
          name: st.name
        });
      }
    }
  }

  // Fallbacks: lastActivityDate and appliedDate
  if (job.lastActivityDate && job.lastActivityDate <= todayStr) {
    pastCandidates.push({
      date: job.lastActivityDate,
      source: 'activity'
    });
  }
  if (job.appliedDate && job.appliedDate <= todayStr) {
    pastCandidates.push({
      date: job.appliedDate,
      source: 'applied'
    });
  }

  // If no dates at all exist
  if (pastCandidates.length === 0) {
    return {
      date: '',
      source: 'none',
      sourceLabel: 'None',
      diffDays: 0,
      isFuture: false,
      isToday: false,
      isOverdue: false,
      primaryText: 'No date set',
      subText: 'Add stage or note',
      tooltip: 'No activity, stage or note dates recorded yet.',
      badge: 'bg-slate-800 text-slate-400 border-slate-700'
    };
  }

  // Sort descending by date string (e.g. 2026-10-21 > 2026-10-20)
  // If dates are identical, prefer note or highest timestamp
  pastCandidates.sort((a, b) => {
    const cmp = b.date.localeCompare(a.date);
    if (cmp !== 0) return cmp;
    // Tie-breaker: prioritize notes over generic activity
    if (a.source === 'note' && b.source !== 'note') return -1;
    if (b.source === 'note' && a.source !== 'note') return 1;
    return (b.createdAtTimestamp || 0) - (a.createdAtTimestamp || 0);
  });

  const latest = pastCandidates[0];
  const diffDays = getDaysDiff(latest.date, todayStr); // <= 0
  const isTerminal = job.status === 'rejected' || job.status === 'withdrawn' || job.status === 'offer';
  const followUpInterval = job.followUpDaysInterval || 7;
  const daysAgo = Math.abs(diffDays);

  const sourceNameMap = {
    note: 'Note',
    stage: 'Stage',
    activity: 'Activity',
    applied: 'Applied'
  };
  const sourceLabel = sourceNameMap[latest.source] || 'Activity';

  // Case A: Date is TODAY
  if (diffDays === 0) {
    if (latest.source === 'note') {
      return {
        date: latest.date,
        source: 'note',
        sourceLabel: 'Note',
        diffDays: 0,
        isFuture: false,
        isToday: true,
        isOverdue: false,
        primaryText: 'Note: Today',
        subText: `${latest.date}`,
        tooltip: `Last note added today (${latest.date}). Application is up to date!`,
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-semibold',
        calendarDate: latest.date,
        calendarTitle: `Follow-up: ${job.company}`,
        calendarUrl: createGoogleCalendarUrl(job, undefined, latest.date)
      };
    } else if (latest.source === 'stage') {
      return {
        date: latest.date,
        source: 'stage',
        sourceLabel: 'Stage',
        stageName: latest.name,
        diffDays: 0,
        isFuture: false,
        isToday: true,
        isOverdue: false,
        primaryText: 'Stage: Today',
        subText: `${latest.date}${latest.name ? ` • ${latest.name}` : ''}`,
        tooltip: `Interview stage scheduled today: ${latest.name || 'Stage'} (${latest.date})`,
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-semibold animate-pulse',
        calendarDate: latest.date,
        stage: latest.stage,
        calendarTitle: `Interview (${latest.name})`,
        calendarUrl: createGoogleCalendarUrl(job, latest.stage, latest.date)
      };
    } else {
      return {
        date: latest.date,
        source: 'activity',
        sourceLabel: 'Activity',
        diffDays: 0,
        isFuture: false,
        isToday: true,
        isOverdue: false,
        primaryText: 'Active Today',
        subText: `${latest.date}`,
        tooltip: `Last activity updated today (${latest.date}).`,
        badge: 'bg-slate-800 text-slate-200 border-slate-700',
        calendarDate: latest.date,
        calendarUrl: createGoogleCalendarUrl(job, undefined, latest.date)
      };
    }
  }

  // Case B: Date is in the PAST (daysAgo > 0)
  const isOverdue = !isTerminal && daysAgo >= followUpInterval;
  const remainingUntilFollowUp = followUpInterval - daysAgo;

  if (isTerminal) {
    return {
      date: latest.date,
      source: latest.source,
      sourceLabel,
      stageName: latest.name,
      diffDays,
      isFuture: false,
      isToday: false,
      isOverdue: false,
      primaryText: `${sourceLabel}: ${latest.date}`,
      subText: `${daysAgo}d ago`,
      tooltip: `Last ${sourceLabel.toLowerCase()} on ${latest.date} (${daysAgo} days ago). Status: ${job.status}`,
      badge: 'bg-slate-800 text-slate-400 border-slate-700',
      calendarDate: latest.date,
      stage: latest.stage,
      calendarUrl: createGoogleCalendarUrl(job, latest.stage, latest.date)
    };
  }

  if (isOverdue) {
    return {
      date: latest.date,
      source: latest.source,
      sourceLabel,
      stageName: latest.name,
      diffDays,
      isFuture: false,
      isToday: false,
      isOverdue: true,
      primaryText: `${sourceLabel}: ${latest.date}`,
      subText: `Overdue (${daysAgo}d ago)`,
      tooltip: `Last ${sourceLabel.toLowerCase()} on ${latest.date} (${daysAgo} days ago). Exceeded follow-up threshold of ${followUpInterval} days!`,
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-semibold',
      calendarDate: latest.date,
      stage: latest.stage,
      calendarUrl: createGoogleCalendarUrl(job, latest.stage, latest.date)
    };
  }

  // Normal recent past activity
  return {
    date: latest.date,
    source: latest.source,
    sourceLabel,
    stageName: latest.name,
    diffDays,
    isFuture: false,
    isToday: false,
    isOverdue: false,
    primaryText: `${sourceLabel}: ${latest.date}`,
    subText: `${daysAgo}d ago • Follow-up in ${remainingUntilFollowUp}d`,
    tooltip: `Last ${sourceLabel.toLowerCase()} on ${latest.date} (${daysAgo} days ago). Follow-up recommended in ${remainingUntilFollowUp} days.`,
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    calendarDate: latest.date,
    stage: latest.stage,
    calendarUrl: createGoogleCalendarUrl(job, latest.stage, latest.date)
  };
}

export interface StatusDateDisplay {
  formattedDate: string; // "20/10/2026" (DD/MM/YYYY)
  daysLabel: string;     // "Today", "1 day", "5 days"
  isToday: boolean;
  rawDate: string;       // "2026-10-20"
}

/**
 * Formats the status date as DD/MM/YYYY (e.g. 20/10/2026)
 * and calculates human-readable duration (e.g. "Today", "3 days").
 */
export function formatStatusDateInfo(dateStr?: string): StatusDateDisplay {
  const todayStr = getTodayString();
  const raw = (dateStr ? dateStr.slice(0, 10) : '') || todayStr;

  let formattedDate = raw;
  const parts = raw.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    formattedDate = `${day}/${month}/${year}`;
  }

  const diffDays = getDaysDiff(raw, todayStr); // raw - today. Past dates result in negative value
  const daysAgo = Math.abs(diffDays);

  let daysLabel = 'Today';
  let isToday = true;

  if (diffDays === 0) {
    daysLabel = 'Today';
    isToday = true;
  } else if (diffDays < 0) {
    isToday = false;
    daysLabel = daysAgo === 1 ? '1 day' : `${daysAgo} days`;
  } else {
    isToday = false;
    daysLabel = diffDays === 1 ? 'In 1 day' : `In ${diffDays} days`;
  }

  return {
    formattedDate,
    daysLabel,
    isToday,
    rawDate: raw
  };
}

