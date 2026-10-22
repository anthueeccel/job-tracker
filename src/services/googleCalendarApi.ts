import { GoogleCalendarEvent, JobOpportunity, StageItem } from '../types/job';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export interface CreateEventParams {
  summary: string;
  description?: string;
  location?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm or defaults to 10:00
  durationMinutes?: number;
  timeZone?: string;
}

export interface CalendarApiError {
  status: number;
  message: string;
  isAuthError?: boolean;
}

/**
 * Parses API error response and provides friendly diagnostics
 */
async function handleResponseError(res: Response): Promise<never> {
  let message = `Calendar API error (${res.status} ${res.statusText})`;
  try {
    const errorJson = await res.json();
    if (errorJson.error?.message) {
      message = errorJson.error.message;
    }
  } catch (e) {
    // Response not JSON
  }

  const error: CalendarApiError = {
    status: res.status,
    message,
    isAuthError: res.status === 401 || res.status === 403
  };
  throw error;
}

/**
 * List upcoming events from the user's primary Google Calendar
 */
export async function listUpcomingGoogleCalendarEvents(
  accessToken: string,
  maxResults = 30
): Promise<GoogleCalendarEvent[]> {
  const timeMin = new Date().toISOString();
  const url = `${CALENDAR_API_BASE}/calendars/primary/events?timeMin=${encodeURIComponent(
    timeMin
  )}&singleEvents=true&orderBy=startTime&maxResults=${maxResults}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    await handleResponseError(res);
  }

  const data = await res.json();
  return (data.items || []) as GoogleCalendarEvent[];
}

/**
 * Create a new event on user's primary Google Calendar
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  params: CreateEventParams
): Promise<GoogleCalendarEvent> {
  const userTimeZone = params.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const startTime = params.time || '10:00';
  const duration = params.durationMinutes || 60;

  // Construct start date
  const [year, month, day] = params.date.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);

  const startDate = new Date(year, month - 1, day, hours, minutes, 0);
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  const formatRFC3339 = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    
    // Timezone offset
    const offset = -d.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
    const offsetMinutes = pad(Math.abs(offset) % 60);
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${sign}${offsetHours}:${offsetMinutes}`;
  };

  const payload = {
    summary: params.summary,
    description: params.description || '',
    location: params.location || '',
    start: {
      dateTime: formatRFC3339(startDate),
      timeZone: userTimeZone
    },
    end: {
      dateTime: formatRFC3339(endDate),
      timeZone: userTimeZone
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'popup', minutes: 10 },
        { method: 'email', minutes: 60 }
      ]
    }
  };

  const res = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    await handleResponseError(res);
  }

  return (await res.json()) as GoogleCalendarEvent;
}

/**
 * Update an existing Google Calendar event
 */
export async function updateGoogleCalendarEvent(
  accessToken: string,
  eventId: string,
  params: Partial<CreateEventParams>
): Promise<GoogleCalendarEvent> {
  const patchPayload: Record<string, unknown> = {};

  if (params.summary) patchPayload.summary = params.summary;
  if (params.description !== undefined) patchPayload.description = params.description;
  if (params.location !== undefined) patchPayload.location = params.location;

  if (params.date) {
    const userTimeZone = params.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const startTime = params.time || '10:00';
    const duration = params.durationMinutes || 60;

    const [year, month, day] = params.date.split('-').map(Number);
    const [hours, minutes] = startTime.split(':').map(Number);

    const startDate = new Date(year, month - 1, day, hours, minutes, 0);
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    const formatRFC3339 = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      const ss = pad(d.getSeconds());
      const offset = -d.getTimezoneOffset();
      const sign = offset >= 0 ? '+' : '-';
      const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
      const offsetMinutes = pad(Math.abs(offset) % 60);
      return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${sign}${offsetHours}:${offsetMinutes}`;
    };

    patchPayload.start = { dateTime: formatRFC3339(startDate), timeZone: userTimeZone };
    patchPayload.end = { dateTime: formatRFC3339(endDate), timeZone: userTimeZone };
  }

  const res = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(patchPayload)
  });

  if (!res.ok) {
    await handleResponseError(res);
  }

  return (await res.json()) as GoogleCalendarEvent;
}

/**
 * Delete an event from primary Google Calendar.
 * MANDATORY: Call this only after explicit user confirmation in UI!
 */
export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  const res = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  // 204 No Content is normal for successful deletion
  if (!res.ok && res.status !== 204 && res.status !== 404) {
    await handleResponseError(res);
  }
}

/**
 * Build standard event details for a Job Opportunity interview stage
 */
export function buildInterviewEventData(
  job: JobOpportunity,
  stage?: StageItem,
  dateStr?: string,
  timeStr?: string
): CreateEventParams {
  const eventDate = dateStr || stage?.date || job.nextFollowUpDate || new Date().toISOString().split('T')[0];
  const startTime = timeStr || stage?.time || '10:00';
  
  const summary = stage
    ? `[Interview] ${job.company} - ${job.title} (${stage.name})`
    : `[Follow-up] ${job.company} - ${job.title}`;

  const mainContact = job.contacts[0];
  const contactText = mainContact
    ? `Recruiter/Contact: ${mainContact.name} (${mainContact.role || 'Talent Team'})\nEmail: ${mainContact.email || 'N/A'}\nPhone/WhatsApp: ${mainContact.phone || 'N/A'}\n\n`
    : '';

  const notesText = stage?.notes
    ? `Stage Notes / Prep:\n${stage.notes}\n\n`
    : '';

  const jobLinkText = job.jobUrl ? `Job Posting: ${job.jobUrl}\n\n` : '';

  const description = `${contactText}${notesText}${jobLinkText}Scheduled via JobTracker Pro`;

  const location = job.workModel === 'remote'
    ? 'Google Meet / Video Conference (Remote)'
    : job.location || 'Remote';

  return {
    summary,
    description,
    location,
    date: eventDate,
    time: startTime,
    durationMinutes: 60
  };
}
