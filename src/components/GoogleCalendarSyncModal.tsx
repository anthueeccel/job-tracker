import React, { useState, useEffect } from 'react';
import { JobOpportunity, GoogleCalendarEvent, StageItem } from '../types/job';
import { useAuth } from '../context/AuthContext';
import {
  listUpcomingGoogleCalendarEvents,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  buildInterviewEventData
} from '../services/googleCalendarApi';
import { CalendarConfirmModal } from './CalendarConfirmModal';
import {
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  Trash2,
  X,
  AlertCircle,
  Briefcase,
  MapPin,
  Check,
  Video,
  Sparkles
} from 'lucide-react';

interface GoogleCalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobOpportunity[];
  onUpdateJob: (job: JobOpportunity) => void;
  preselectedJob?: JobOpportunity | null;
  preselectedStage?: StageItem | null;
}

export const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({
  isOpen,
  onClose,
  jobs,
  onUpdateJob,
  preselectedJob,
  preselectedStage
}) => {
  const { user, isCalendarConnected, connectCalendar, getValidCalendarToken } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'schedule' | 'upcoming'>('schedule');
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Scheduling Form State
  const [selectedJobId, setSelectedJobId] = useState<string>(preselectedJob?.id || (jobs[0]?.id || ''));
  const [selectedStageName, setSelectedStageName] = useState<string>(preselectedStage?.name || '');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>(
    preselectedStage?.date || preselectedJob?.nextFollowUpDate || new Date().toISOString().split('T')[0]
  );
  const [eventTime, setEventTime] = useState<string>(preselectedStage?.time || '10:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [locationType, setLocationType] = useState<'meet' | 'custom'>('meet');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [eventNotes, setEventNotes] = useState<string>(preselectedStage?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<GoogleCalendarEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (preselectedJob) {
      setSelectedJobId(preselectedJob.id);
      if (preselectedStage) {
        setSelectedStageName(preselectedStage.name);
        if (preselectedStage.date) setEventDate(preselectedStage.date);
        if (preselectedStage.time) setEventTime(preselectedStage.time);
        if (preselectedStage.notes) setEventNotes(preselectedStage.notes);
      }
    }
  }, [preselectedJob, preselectedStage]);

  const currentJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  // Fetch upcoming events when tab is active or calendar connects
  const fetchEvents = async () => {
    setErrorMessage(null);
    setLoadingEvents(true);
    try {
      const token = await getValidCalendarToken();
      const items = await listUpcomingGoogleCalendarEvents(token, 25);
      setEvents(items);
    } catch (err: any) {
      console.error('Failed to fetch Google Calendar events:', err);
      setErrorMessage(err.message || 'Could not load calendar events. Please re-authorize Google Calendar.');
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'upcoming' && isCalendarConnected) {
      fetchEvents();
    }
  }, [isOpen, activeTab, isCalendarConnected]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setErrorMessage(null);
    try {
      await connectCalendar();
      setSuccessMessage('Successfully connected to Google Calendar!');
      setTimeout(() => setSuccessMessage(null), 3500);
      fetchEvents();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authenticate with Google Calendar.');
    }
  };

  const handleScheduleEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentJob) {
      setErrorMessage('Please select a job opportunity first.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const token = await getValidCalendarToken();

      const stageObj = currentJob.stages.find((s) => s.name === selectedStageName);
      const stageParams = buildInterviewEventData(currentJob, stageObj, eventDate, eventTime);

      const title = customTitle.trim()
        ? `[Interview] ${currentJob.company} - ${currentJob.title} (${customTitle.trim()})`
        : selectedStageName
        ? `[Interview] ${currentJob.company} - ${currentJob.title} (${selectedStageName})`
        : `[Interview] ${currentJob.company} - ${currentJob.title}`;

      const finalLocation =
        locationType === 'meet'
          ? 'Google Meet / Video Conference (Remote)'
          : customLocation.trim() || currentJob.location || 'Remote';

      const finalDescription = [
        `Company: ${currentJob.company}`,
        `Position: ${currentJob.title}`,
        selectedStageName ? `Stage: ${selectedStageName}` : '',
        currentJob.contacts[0]
          ? `Interviewer/Contact: ${currentJob.contacts[0].name} (${currentJob.contacts[0].email || 'N/A'})`
          : '',
        eventNotes ? `Notes & Prep: ${eventNotes}` : '',
        currentJob.jobUrl ? `Job Posting: ${currentJob.jobUrl}` : '',
        `\nScheduled via JobTracker Pro`
      ]
        .filter(Boolean)
        .join('\n');

      const created = await createGoogleCalendarEvent(token, {
        summary: title,
        description: finalDescription,
        location: finalLocation,
        date: eventDate,
        time: eventTime,
        durationMinutes
      });

      // Update the Job opportunity in local & Firestore state
      const nowIso = new Date().toISOString();
      let updatedStages = currentJob.stages;

      if (stageObj) {
        updatedStages = currentJob.stages.map((st) =>
          st.id === stageObj.id
            ? {
                ...st,
                date: eventDate,
                time: eventTime,
                calendarEventId: created.id,
                calendarEventLink: created.htmlLink,
                calendarSyncedAt: nowIso
              }
            : st
        );
      }

      const updatedJob: JobOpportunity = {
        ...currentJob,
        stages: updatedStages,
        calendarEventId: created.id,
        calendarEventLink: created.htmlLink,
        calendarSyncedAt: nowIso,
        lastActivityDate: eventDate
      };

      onUpdateJob(updatedJob);
      setSuccessMessage(`Event successfully scheduled and synced to Google Calendar!`);
      
      // Auto-refresh feed
      fetchEvents();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Schedule event error:', err);
      setErrorMessage(err.message || 'Failed to create event in Google Calendar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiateDeleteEvent = (event: GoogleCalendarEvent) => {
    setEventToDelete(event);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      const token = await getValidCalendarToken();
      await deleteGoogleCalendarEvent(token, eventToDelete.id);

      // Remove from events feed
      setEvents((prev) => prev.filter((ev) => ev.id !== eventToDelete.id));

      // Clean up reference in jobs if exists
      for (const j of jobs) {
        let changed = false;
        const newStages = j.stages.map((st) => {
          if (st.calendarEventId === eventToDelete.id) {
            changed = true;
            return {
              ...st,
              calendarEventId: undefined,
              calendarEventLink: undefined,
              calendarSyncedAt: undefined
            };
          }
          return st;
        });

        if (changed || j.calendarEventId === eventToDelete.id) {
          onUpdateJob({
            ...j,
            stages: newStages,
            calendarEventId: j.calendarEventId === eventToDelete.id ? undefined : j.calendarEventId,
            calendarEventLink: j.calendarEventId === eventToDelete.id ? undefined : j.calendarEventLink
          });
        }
      }

      setSuccessMessage('Event deleted from Google Calendar.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Delete error:', err);
      setErrorMessage(err.message || 'Failed to delete event from Google Calendar.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Google Calendar Integration</h2>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Direct API Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Schedule interview rounds and view live Google Calendar events
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connection Bar */}
        <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCalendarConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">
              {isCalendarConnected ? (
                <span>
                  Connected to Google Calendar as{' '}
                  <strong className="text-indigo-400">{user?.email || 'User'}</strong>
                </span>
              ) : (
                <span className="text-slate-400">Not connected to Google Calendar</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
            >
              <span>calendar.google.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {!isCalendarConnected && (
              <button
                onClick={handleConnect}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-xs transition-colors"
              >
                <span>Connect Google Calendar</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="m-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-3 px-4 font-semibold border-b-2 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'schedule'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Interview Event</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('upcoming');
              if (isCalendarConnected) fetchEvents();
            }}
            className={`flex-1 py-3 px-4 font-semibold border-b-2 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'upcoming'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Live Calendar Feed ({events.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'schedule' ? (
            <form onSubmit={handleScheduleEvent} className="space-y-4 text-xs">
              {/* Select Job */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Job Opportunity
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => {
                    setSelectedJobId(e.target.value);
                    const chosen = jobs.find((j) => j.id === e.target.value);
                    if (chosen && chosen.stages[0]) {
                      setSelectedStageName(chosen.stages[0].name);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.company} — {j.title} ({j.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage / Custom Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Interview Stage
                  </label>
                  <select
                    value={selectedStageName}
                    onChange={(e) => setSelectedStageName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Custom Stage --</option>
                    {currentJob?.stages.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name} {st.completed ? '(Completed)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Custom Title / Round Subtitle
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Technical Round 2 (System Design)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Date, Time & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Duration
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes (1 hour)</option>
                    <option value={90}>90 minutes (1.5 hours)</option>
                    <option value={120}>120 minutes (2 hours)</option>
                  </select>
                </div>
              </div>

              {/* Location Type */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Interview Location / Video Tool
                </label>
                <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="locationType"
                      checked={locationType === 'meet'}
                      onChange={() => setLocationType('meet')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-indigo-400" />
                      Google Meet / Remote Video
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="locationType"
                      checked={locationType === 'custom'}
                      onChange={() => setLocationType('custom')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Office / Custom Address
                    </span>
                  </label>
                </div>
                {locationType === 'custom' && (
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="e.g. 100 Main St, Suite 400, New York or Zoom link"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              {/* Notes & Prep */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Interview Prep Notes (Included in Calendar event description)
                </label>
                <textarea
                  rows={3}
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  placeholder="Review system design diagrams, prepare questions for VP of Engineering..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Action */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Syncing to Google Calendar...' : 'Add Event to Google Calendar'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Upcoming Google Calendar Events
                </h3>
                <button
                  onClick={fetchEvents}
                  disabled={loadingEvents}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingEvents ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingEvents ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Loading events from your primary Google Calendar...
                </div>
              ) : events.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-xl">
                  <p className="text-slate-400 text-xs">No upcoming calendar events found.</p>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Schedule an interview using the first tab to populate your calendar.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {events.map((ev) => {
                    const isJobTrackerEvent = ev.summary?.includes('[Interview]') || ev.summary?.includes('[Follow-up]');
                    const eventStartDate = ev.start?.dateTime ? new Date(ev.start.dateTime) : ev.start?.date ? new Date(ev.start.date) : null;
                    const dateFormatted = eventStartDate
                      ? eventStartDate.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: ev.start?.dateTime ? '2-digit' : undefined,
                          minute: ev.start?.dateTime ? '2-digit' : undefined
                        })
                      : 'Date unspecified';

                    return (
                      <div
                        key={ev.id}
                        className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                          isJobTrackerEvent
                            ? 'bg-indigo-950/20 border-indigo-500/30'
                            : 'bg-slate-950/40 border-slate-800'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {isJobTrackerEvent && (
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                JobTracker
                              </span>
                            )}
                            <h4 className="text-xs font-semibold text-white truncate">
                              {ev.summary || 'Untitled Event'}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {dateFormatted}
                            </span>
                            {ev.location && (
                              <span className="flex items-center gap-1 max-w-xs truncate">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                {ev.location}
                              </span>
                            )}
                          </div>

                          {ev.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                              {ev.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {ev.htmlLink && (
                            <a
                              href={ev.htmlLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="Open event in Google Calendar web"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => initiateDeleteEvent(ev)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                            title="Remove event from Google Calendar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog for Destructive Operations */}
      <CalendarConfirmModal
        isOpen={deleteConfirmOpen}
        title="Remove Google Calendar Event?"
        message="Are you sure you want to delete this event from your primary Google Calendar? This action cannot be undone."
        eventSummary={eventToDelete?.summary}
        eventDate={
          eventToDelete?.start?.dateTime
            ? new Date(eventToDelete.start.dateTime).toLocaleString()
            : undefined
        }
        confirmLabel="Delete from Calendar"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setEventToDelete(null);
        }}
      />
    </div>
  );
};
