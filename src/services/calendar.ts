import { JobOpportunity, StageItem } from '../types/job';

/**
 * Generates a direct Google Calendar web event creation URL.
 * When the user clicks this, it opens Google Calendar with all event details pre-filled.
 */
export function createGoogleCalendarUrl(
  job: JobOpportunity,
  stage?: StageItem,
  dateStr?: string,
  timeStr?: string // e.g. "14:00" or defaults to 10:00 AM
): string {
  const eventDate = dateStr || stage?.date || job.nextFollowUpDate || new Date().toISOString().split('T')[0];
  const startTime = timeStr || '10:00';
  
  // Format start and end date/time in ISO UTC format (YYYYMMDDTHHmmssZ)
  const [year, month, day] = eventDate.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);

  const start = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

  const formatGCalDate = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d+/g, '');

  const datesParam = `${formatGCalDate(start)}/${formatGCalDate(end)}`;

  const eventTitle = stage
    ? `Interview: ${job.company} - ${job.title} (${stage.name})`
    : `Follow-up: ${job.company} - ${job.title}`;

  const mainContact = job.contacts[0];
  const contactText = mainContact
    ? `Recruiter Contact: ${mainContact.name} (${mainContact.role || 'Hiring Team'})\nEmail: ${mainContact.email || 'N/A'}\nPhone/WhatsApp: ${mainContact.phone || 'N/A'}\n\n`
    : '';

  const notesText = stage?.notes
    ? `Stage Notes / Prep:\n${stage.notes}\n\n`
    : '';

  const jobLinkText = job.jobUrl ? `Job Posting: ${job.jobUrl}\n\n` : '';

  const details = encodeURIComponent(
    `${contactText}${notesText}${jobLinkText}Scheduled via JobTracker Pro`
  );

  const location = encodeURIComponent(
    job.workModel === 'remote'
      ? 'Google Meet / Video Call (Remote)'
      : job.location || 'Remote'
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    eventTitle
  )}&dates=${datesParam}&details=${details}&location=${location}`;
}

/**
 * Generates and triggers download of an .ICS file (standard iCalendar format).
 * Compatible with Apple Calendar, Microsoft Outlook, and Google Calendar.
 */
export function downloadIcsFile(
  job: JobOpportunity,
  stage?: StageItem,
  dateStr?: string,
  timeStr?: string
) {
  const eventDate = dateStr || stage?.date || job.nextFollowUpDate || new Date().toISOString().split('T')[0];
  const startTime = timeStr || '10:00';
  
  const [year, month, day] = eventDate.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);

  const start = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const formatIcsDate = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d+/g, '');

  const eventTitle = stage
    ? `Interview: ${job.company} - ${job.title} (${stage.name})`
    : `Follow-up: ${job.company} - ${job.title}`;

  const mainContact = job.contacts[0];
  const description = [
    `Interview for ${job.title} at ${job.company}`,
    stage ? `Stage: ${stage.name}` : '',
    mainContact ? `Contact: ${mainContact.name} (${mainContact.email || ''})` : '',
    stage?.notes ? `Notes: ${stage.notes}` : '',
    job.jobUrl ? `Job Link: ${job.jobUrl}` : ''
  ].filter(Boolean).join('\\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JobTracker Pro//Job Interview Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:job-${job.id}-${stage?.id || 'event'}@jobtrackerpro`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${eventTitle}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${job.workModel === 'remote' ? 'Remote Video Call' : job.location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Interview_${job.company.replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
