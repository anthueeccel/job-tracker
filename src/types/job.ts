export type JobCategory = 'JobsTech' | 'JobsMgm' | 'Other';

export type JobStatus =
  | 'applied'           // Application submitted
  | 'screening'         // Initial HR / Recruiter screen
  | 'interviewing'      // Active technical or managerial interviews
  | 'tech_challenge'    // Take-home assignment / practical case
  | 'offer'             // Job offer received
  | 'standby'           // Waiting for response / paused
  | 'rejected'          // Not selected by company
  | 'withdrawn';        // Withdrawn by candidate

export interface StageItem {
  id: string;
  name: string;           // E.g., "HR Screen", "Live Coding", "System Design", "Executive Fit"
  completed: boolean;
  date?: string;          // Scheduled or completed date (YYYY-MM-DD)
  time?: string;          // E.g., "14:00"
  notes?: string;         // Stage feedback or notes
  calendarEventId?: string;
  calendarEventLink?: string;
  calendarSyncedAt?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
}

export interface JobNote {
  id: string;
  createdAt: string;      // ISO string
  type: 'general' | 'interview' | 'feedback' | 'question' | 'research';
  content: string;
}

export interface ResumeAttachment {
  id: string;
  fileName: string;
  fileSize?: string;
  fileType?: string;
  dataUrl?: string;       // base64 or blob URL for download/preview
  uploadedAt: string;
  versionLabel?: string;  // E.g., "Senior Fullstack US", "Agile Engineering Manager", "Frontend & Cloud Focus"
  tailoredFocus?: string; // Summary of how this CV was customized for this employer
}

export interface RecruiterContact {
  name: string;
  role?: string;          // E.g., "Senior Tech Recruiter", "VP of Engineering", "Talent Partner"
  email?: string;
  phone?: string;         // Supports WhatsApp / phone calls
  linkedin?: string;
  notes?: string;
}

export interface JobOpportunity {
  id: string;
  title: string;          // Position title (e.g., Senior Fullstack Engineer, Engineering Manager)
  company: string;        // Company name
  category: JobCategory;  // 'JobsTech' | 'JobsMgm'
  status: JobStatus;
  statusDate?: string;    // YYYY-MM-DD - Date this status was set / changed
  
  // 2nd Column requested by user: Stages Progress (e.g. 0/3, 1/3)
  stages: StageItem[];
  
  // Location and Work Model
  location: string;
  workModel: 'remote' | 'hybrid' | 'onsite';
  jobUrl?: string;
  
  // Compensation
  salaryCurrency?: string; // "$", "€", "£"
  salaryExpected?: string; // E.g., "$150,000 - $170,000 / yr" or "€75,000 / yr"
  salaryOffered?: string;
  benefits?: string;
  
  // Follow-ups & Dates
  appliedDate: string;        // YYYY-MM-DD
  lastActivityDate: string;   // YYYY-MM-DD
  nextFollowUpDate?: string;  // YYYY-MM-DD
  followUpDaysInterval?: number;
  followUpDismissed?: boolean;
  
  // Recruiter Contacts
  contacts: RecruiterContact[];
  
  // Tailored Resumes & Portfolio
  resumes: ResumeAttachment[];
  portfolioUrl?: string;
  coverLetter?: string;
  
  // Structured Notes Log
  notes: JobNote[];
  
  // Priority & Rating
  priority: 'low' | 'medium' | 'high' | 'dream_job';
  rating?: number; // 1 to 5 stars

  // Google Calendar Integration
  calendarEventId?: string;
  calendarEventLink?: string;
  calendarSyncedAt?: string;
}

export const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; badgeBg: string; border: string }> = {
  applied: {
    label: 'Applied',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    border: 'border-blue-500/30',
  },
  screening: {
    label: 'HR Screening',
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    border: 'border-indigo-500/30',
  },
  interviewing: {
    label: 'Interviewing',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    border: 'border-amber-500/30',
  },
  tech_challenge: {
    label: 'Technical Challenge',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    border: 'border-purple-500/30',
  },
  offer: {
    label: 'Offer Received 🎉',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    border: 'border-emerald-500/40',
  },
  standby: {
    label: 'Awaiting Feedback',
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    border: 'border-sky-500/30',
  },
  rejected: {
    label: 'Not Selected',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    border: 'border-rose-500/30',
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'text-slate-400',
    badgeBg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    border: 'border-slate-500/30',
  },
};

export const DEFAULT_TECH_STAGES: string[] = [
  'Initial Recruiter Screening',
  'Technical Interview & Live Coding',
  'System Design & Architecture',
  'Executive & Team Culture Fit',
];

export const DEFAULT_MGM_STAGES: string[] = [
  'Talent Partner Screening',
  'Leadership & People Management Case',
  'Cross-Functional Stakeholder Panel',
  'VP of Engineering / Final Offer',
];
