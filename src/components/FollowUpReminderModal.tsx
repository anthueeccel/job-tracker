import React, { useState } from 'react';
import { JobOpportunity } from '../types/job';
import { calculateFollowUps } from '../services/storage';
import {
  getAllTemplatesForLanguage,
  fillTemplate,
  TemplateLanguage
} from '../services/templates';
import { createGoogleCalendarUrl } from '../services/calendar';
import {
  X,
  Bell,
  CheckCircle2,
  Mail,
  Phone,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  CalendarPlus
} from 'lucide-react';

interface FollowUpReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobOpportunity[];
  onUpdateJob: (job: JobOpportunity) => void;
  onSelectJob: (job: JobOpportunity) => void;
}

export const FollowUpReminderModal: React.FC<FollowUpReminderModalProps> = ({
  isOpen,
  onClose,
  jobs,
  onUpdateJob,
  onSelectJob
}) => {
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [templateLang, setTemplateLang] = useState<TemplateLanguage>(() => {
    try {
      return (localStorage.getItem('jobtracker_template_lang') as TemplateLanguage) || 'en';
    } catch (e) {
      return 'en';
    }
  });

  if (!isOpen) return null;

  const handleLanguageChange = (lang: TemplateLanguage) => {
    setTemplateLang(lang);
    try {
      localStorage.setItem('jobtracker_template_lang', lang);
    } catch (e) {}
  };

  const followUps = calculateFollowUps(jobs);

  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      setNotificationPermission(res);
      if (res === 'granted') {
        new Notification('JobTracker Pro', {
          body: 'Follow-up reminders successfully enabled!',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const handleSnooze = (job: JobOpportunity, days: number) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    const dateStr = nextDate.toISOString().split('T')[0];

    onUpdateJob({
      ...job,
      nextFollowUpDate: dateStr,
      followUpDismissed: false,
      lastActivityDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleMarkDone = (job: JobOpportunity) => {
    onUpdateJob({
      ...job,
      followUpDismissed: true,
      lastActivityDate: new Date().toISOString().split('T')[0],
      notes: [
        {
          id: `note-${Date.now()}`,
          createdAt: new Date().toISOString(),
          type: 'general',
          content: 'Follow-up outreach completed.'
        },
        ...job.notes
      ]
    });
  };

  const handleQuickCopyEmail = (job: JobOpportunity) => {
    const templates = getAllTemplatesForLanguage(templateLang);
    const template = templates[0];
    const { subject, body } = fillTemplate(template, job, job.contacts[0], templateLang);
    const full = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(full);
    setCopiedJobId(job.id);
    setTimeout(() => setCopiedJobId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Follow-up & Outreach Reminders
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  {followUps.length} pending
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Maintain momentum and never let an application go cold without timely follow-up.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  templateLang === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="American English"
              >
                🇺🇸 EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('es')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  templateLang === 'es' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Español"
              >
                🇪🇸 ES
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('pt')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  templateLang === 'pt' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Português"
              >
                🇧🇷 PT
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Notification Banner */}
        {notificationPermission !== 'granted' && (
          <div className="p-3.5 bg-indigo-950/40 border-b border-indigo-900/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Would you like browser notifications for follow-up reminders?</span>
            </div>
            <button
              onClick={handleRequestNotificationPermission}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shrink-0"
            >
              Enable Notifications
            </button>
          </div>
        )}

        {/* Follow-up Items */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {followUps.length === 0 ? (
            <div className="p-12 text-center bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">All follow-ups up to date!</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active applications are overdue or requiring immediate outreach today. Excellent work!
              </p>
            </div>
          ) : (
            followUps.map((item) => {
              const { job, isOverdue, isToday, daysRemaining, reason } = item;
              const contact = job.contacts[0];
              const gcalUrl = createGoogleCalendarUrl(job);

              return (
                <div
                  key={job.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isOverdue
                      ? 'bg-rose-950/10 border-rose-500/30'
                      : isToday
                      ? 'bg-amber-950/15 border-amber-500/40'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            isOverdue
                              ? 'bg-rose-500/20 text-rose-400'
                              : isToday
                              ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isOverdue ? `Overdue by ${Math.abs(daysRemaining)}d` : isToday ? 'Due Today!' : `In ${daysRemaining} days`}
                        </span>
                        <h4 className="font-bold text-white text-sm">
                          {job.company}
                        </h4>
                        <span className="text-xs text-slate-400">• {job.title}</span>
                      </div>

                      <div className="text-xs text-slate-400 mt-1">
                        {reason === 'inactivity' ? (
                          <span>No recruiter activity for over 7 days since last update.</span>
                        ) : (
                          <span>Scheduled follow-up reminder for {job.nextFollowUpDate}.</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Add reminder to Google Calendar */}
                      <a
                        href={gcalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 text-xs flex items-center gap-1"
                        title="Add follow-up to Google Calendar"
                      >
                        <CalendarPlus className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => {
                          onClose();
                          onSelectJob(job);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 text-xs flex items-center gap-1"
                        title="Open opportunity details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {contact && (
                    <div className="text-xs text-slate-300 py-2 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        Recruiter: <strong className="text-slate-200">{contact.name}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="p-1 text-indigo-400 hover:text-indigo-300"
                            title={`Email ${contact.email}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {contact.phone && (
                          <a
                            href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                            title={`Chat on WhatsApp`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleQuickCopyEmail(job)}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20"
                    >
                      {copiedJobId === job.id ? (
                        <>
                          <Check className="w-3 h-3" /> Email Copied ({templateLang.toUpperCase()})!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Follow-up ({templateLang === 'en' ? '🇺🇸 EN' : templateLang === 'es' ? '🇪🇸 ES' : '🇧🇷 PT'})
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSnooze(job, 3)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                        title="Snooze for 3 days"
                      >
                        +3 days
                      </button>
                      <button
                        onClick={() => handleSnooze(job, 7)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                        title="Snooze for 7 days"
                      >
                        +7 days
                      </button>
                      <button
                        onClick={() => handleMarkDone(job)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-colors"
                      >
                        Done ✓
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
