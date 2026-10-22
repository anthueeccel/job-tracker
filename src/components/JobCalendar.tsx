import React, { useState } from 'react';
import { JobOpportunity, StageItem } from '../types/job';
import { createGoogleCalendarUrl, downloadIcsFile } from '../services/calendar';
import { useAuth } from '../context/AuthContext';
import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  buildInterviewEventData
} from '../services/googleCalendarApi';
import { CalendarConfirmModal } from './CalendarConfirmModal';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  CalendarPlus,
  Download,
  ExternalLink,
  Trash2,
  Loader2,
  Check,
  Plus
} from 'lucide-react';

interface JobCalendarProps {
  jobs: JobOpportunity[];
  onSelectJob: (job: JobOpportunity) => void;
  onOpenFollowUpForJob: (job: JobOpportunity) => void;
  onUpdateJob?: (job: JobOpportunity) => void;
  onOpenGoogleCalendarModal?: (job?: JobOpportunity, stage?: StageItem) => void;
}

interface TimelineEvent {
  id: string;
  date: string;
  time?: string;
  job: JobOpportunity;
  stage?: StageItem;
  type: 'stage' | 'followup' | 'applied';
  title: string;
  description?: string;
  completed?: boolean;
  calendarEventId?: string;
  calendarEventLink?: string;
  calendarSyncedAt?: string;
}

export const JobCalendar: React.FC<JobCalendarProps> = ({
  jobs,
  onSelectJob,
  onUpdateJob,
  onOpenGoogleCalendarModal
}) => {
  const { isCalendarConnected, getValidCalendarToken, user } = useAuth();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    event?: TimelineEvent;
    isDeleting: boolean;
  }>({ isOpen: false, isDeleting: false });

  const events: TimelineEvent[] = [];

  for (const job of jobs) {
    // Stage dates
    job.stages.forEach((st) => {
      if (st.date) {
        events.push({
          id: `${job.id}-stage-${st.id}`,
          date: st.date,
          time: st.time,
          job,
          stage: st,
          type: 'stage',
          title: `${st.name}`,
          description: st.notes,
          completed: st.completed,
          calendarEventId: st.calendarEventId,
          calendarEventLink: st.calendarEventLink,
          calendarSyncedAt: st.calendarSyncedAt
        });
      }
    });

    // Follow-up date
    if (job.nextFollowUpDate) {
      events.push({
        id: `${job.id}-followup`,
        date: job.nextFollowUpDate,
        job,
        type: 'followup',
        title: `Outreach Follow-up with ${job.contacts[0]?.name || job.company}`,
        description: 'Check status and maintain application momentum',
        completed: false,
        calendarEventId: job.calendarEventId,
        calendarEventLink: job.calendarEventLink,
        calendarSyncedAt: job.calendarSyncedAt
      });
    }

    // Applied date
    if (job.appliedDate) {
      events.push({
        id: `${job.id}-applied`,
        date: job.appliedDate,
        job,
        type: 'applied',
        title: `Application Submitted`,
        description: `Position: ${job.title}`,
        completed: true
      });
    }
  }

  // Sort events chronologically
  const sortedEvents = events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group events by date
  const groupedByDate: Record<string, TimelineEvent[]> = {};
  sortedEvents.forEach((ev) => {
    if (!groupedByDate[ev.date]) {
      groupedByDate[ev.date] = [];
    }
    groupedByDate[ev.date].push(ev);
  });

  const dates = Object.keys(groupedByDate);

  // Direct Google Calendar 1-Click Sync
  const handleDirectCalendarSync = async (ev: TimelineEvent) => {
    if (!onUpdateJob) return;
    setSyncingId(ev.id);
    try {
      const token = await getValidCalendarToken();
      const eventData = buildInterviewEventData(ev.job, ev.stage, ev.date, ev.time);
      const created = await createGoogleCalendarEvent(token, eventData);

      const nowIso = new Date().toISOString();
      if (ev.stage) {
        const updatedStages = ev.job.stages.map((st) =>
          st.id === ev.stage?.id
            ? {
                ...st,
                calendarEventId: created.id,
                calendarEventLink: created.htmlLink,
                calendarSyncedAt: nowIso
              }
            : st
        );
        onUpdateJob({
          ...ev.job,
          stages: updatedStages
        });
      } else {
        onUpdateJob({
          ...ev.job,
          calendarEventId: created.id,
          calendarEventLink: created.htmlLink,
          calendarSyncedAt: nowIso
        });
      }
    } catch (err) {
      console.error('Direct Google Calendar Sync failed:', err);
    } finally {
      setSyncingId(null);
    }
  };

  // Safe removal with mandatory confirmation dialog
  const handleConfirmCalendarDelete = async () => {
    const ev = deleteModalState.event;
    if (!ev || !ev.calendarEventId || !onUpdateJob) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const token = await getValidCalendarToken();
      await deleteGoogleCalendarEvent(token, ev.calendarEventId);

      if (ev.stage) {
        const updatedStages = ev.job.stages.map((st) =>
          st.id === ev.stage?.id
            ? {
                ...st,
                calendarEventId: undefined,
                calendarEventLink: undefined,
                calendarSyncedAt: undefined
              }
            : st
        );
        onUpdateJob({
          ...ev.job,
          stages: updatedStages
        });
      } else {
        onUpdateJob({
          ...ev.job,
          calendarEventId: undefined,
          calendarEventLink: undefined,
          calendarSyncedAt: undefined
        });
      }
    } catch (err) {
      console.error('Failed to delete Google Calendar event:', err);
    } finally {
      setDeleteModalState({ isOpen: false, isDeleting: false, event: undefined });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Interview Schedule & Google Calendar Sync
            </h2>
            {isCalendarConnected && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Connected
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Track interview dates and sync directly with Google Calendar or Apple/Outlook (.ICS).
          </p>
        </div>

        {onOpenGoogleCalendarModal && (
          <button
            onClick={() => onOpenGoogleCalendarModal()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule in Google Calendar</span>
          </button>
        )}
      </div>

      {dates.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-sm">No scheduled events or interview dates found.</p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-800">
          {dates.map((dateKey) => {
            const dateObj = new Date(dateKey + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            const dayEvents = groupedByDate[dateKey];

            return (
              <div key={dateKey} className="relative pl-10">
                <div className="absolute left-3.5 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-500 border-4 border-slate-950" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">
                  {formattedDate}
                </h3>

                <div className="space-y-3">
                  {dayEvents.map((ev) => {
                    const isFollowUp = ev.type === 'followup';
                    const isStage = ev.type === 'stage';
                    const gcalFallbackUrl = createGoogleCalendarUrl(ev.job, ev.stage, ev.date, ev.time);
                    const isSynced = Boolean(ev.calendarEventLink || ev.calendarEventId);
                    const isSyncing = syncingId === ev.id;

                    return (
                      <div
                        key={ev.id}
                        onClick={() => onSelectJob(ev.job)}
                        className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 transition-all cursor-pointer flex flex-wrap items-start justify-between gap-4"
                      >
                        <div className="space-y-1.5 max-w-lg">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${
                                isFollowUp
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : isStage
                                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              }`}
                            >
                              {isFollowUp ? 'Follow-up' : isStage ? 'Interview Stage' : 'Applied'}
                            </span>
                            <span className="font-semibold text-white text-sm">
                              {ev.job.company}
                            </span>
                            <span className="text-slate-400 text-xs">
                              • {ev.job.title}
                            </span>
                          </div>

                          <div className="text-slate-200 font-medium text-xs flex items-center gap-2">
                            <span>{ev.title}</span>
                            {ev.time && (
                              <span className="text-indigo-400 font-mono text-[11px] bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-900/40">
                                {ev.time}
                              </span>
                            )}
                          </div>

                          {ev.description && (
                            <p className="text-slate-400 text-[11px] line-clamp-2">
                              {ev.description}
                            </p>
                          )}
                        </div>

                        {/* Calendar Sync & Status Controls */}
                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {/* Live Google Calendar API Direct Sync or View */}
                          {isSynced ? (
                            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-2 py-1">
                              <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Synced with Google Calendar
                              </span>
                              {ev.calendarEventLink && (
                                <a
                                  href={ev.calendarEventLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-400 hover:text-white p-0.5 rounded transition-colors"
                                  title="Open in Google Calendar web"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              <button
                                onClick={() =>
                                  setDeleteModalState({
                                    isOpen: true,
                                    event: ev,
                                    isDeleting: false
                                  })
                                }
                                className="text-rose-400/80 hover:text-rose-400 p-0.5 rounded transition-colors ml-1"
                                title="Remove from Google Calendar (User confirmation required)"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={isSyncing}
                              onClick={() => handleDirectCalendarSync(ev)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-medium transition-colors"
                              title="Sync this interview directly to your Google Calendar"
                            >
                              {isSyncing ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CalendarPlus className="w-3.5 h-3.5" />
                              )}
                              <span>Sync to Google Calendar</span>
                            </button>
                          )}

                          {/* Fallback link & .ICS export */}
                          {!isSynced && (
                            <a
                              href={gcalFallbackUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs border border-slate-700 transition-colors"
                              title="Open prefilled Google Calendar link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => downloadIcsFile(ev.job, ev.stage, ev.date, ev.time)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
                            title="Download .ICS file (Apple Calendar / Outlook)"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {ev.completed ? (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium pl-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 pl-1">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          )}

                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Workspace API Deletions */}
      <CalendarConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Remove from Google Calendar?"
        message="Are you sure you want to delete this event from your primary Google Calendar? This action cannot be undone."
        eventSummary={deleteModalState.event?.title}
        eventDate={deleteModalState.event?.date}
        confirmLabel="Confirm Deletion"
        isDestructive={true}
        isLoading={deleteModalState.isDeleting}
        onConfirm={handleConfirmCalendarDelete}
        onCancel={() =>
          setDeleteModalState({ isOpen: false, isDeleting: false, event: undefined })
        }
      />
    </div>
  );
};
