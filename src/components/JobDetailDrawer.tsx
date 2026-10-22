import React, { useState } from 'react';
import {
  JobOpportunity,
  JobStatus,
  StageItem,
  JobNote,
  STATUS_CONFIG
} from '../types/job';
import { StageBadge } from './StageBadge';
import {
  getAllTemplatesForLanguage,
  fillTemplate,
  MessageTemplate,
  TemplateLanguage
} from '../services/templates';
import { INTERVIEW_QUESTIONS_TECH, INTERVIEW_QUESTIONS_MGM } from '../services/interviewPrep';
import { createGoogleCalendarUrl, downloadIcsFile } from '../services/calendar';
import { formatStatusDateInfo } from '../services/timing';
import { useAuth } from '../context/AuthContext';
import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  buildInterviewEventData
} from '../services/googleCalendarApi';
import { CalendarConfirmModal } from './CalendarConfirmModal';
import {
  X,
  Edit3,
  Trash2,
  CheckCircle2,
  Plus,
  Calendar,
  Clock,
  Mail,
  Phone,
  FileText,
  StickyNote,
  User,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Award,
  Download,
  BookOpen,
  MapPin,
  CalendarPlus,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface JobDetailDrawerProps {
  job: JobOpportunity | null;
  onClose: () => void;
  onUpdateJob: (job: JobOpportunity) => void;
  onEditJob: (job: JobOpportunity) => void;
  onDeleteJob: (id: string) => void;
  onOpenGoogleCalendarModal?: (job?: JobOpportunity, stage?: StageItem) => void;
}

type TabKey = 'stages' | 'notes' | 'contacts' | 'resumes' | 'interview_prep';

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  job,
  onClose,
  onUpdateJob,
  onEditJob,
  onDeleteJob,
  onOpenGoogleCalendarModal
}) => {
  const { getValidCalendarToken } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('stages');
  const [syncingStageId, setSyncingStageId] = useState<string | null>(null);
  const [deleteCalendarModal, setDeleteCalendarModal] = useState<{
    isOpen: boolean;
    stage?: StageItem;
    isDeleting: boolean;
  }>({ isOpen: false, isDeleting: false });

  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<JobNote['type']>('general');
  const [newStageName, setNewStageName] = useState('');
  const [newStageDate, setNewStageDate] = useState('');
  const [newStageTime, setNewStageTime] = useState('');
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);
  const [templateLang, setTemplateLang] = useState<TemplateLanguage>(() => {
    try {
      return (localStorage.getItem('jobtracker_template_lang') as TemplateLanguage) || 'en';
    } catch (e) {
      return 'en';
    }
  });
  const currentTemplates = getAllTemplatesForLanguage(templateLang);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('followup_7_days');

  if (!job) return null;

  const selectedTemplate =
    currentTemplates.find((t) => t.id === selectedTemplateId) || currentTemplates[0];

  const handleLanguageChange = (lang: TemplateLanguage) => {
    setTemplateLang(lang);
    try {
      localStorage.setItem('jobtracker_template_lang', lang);
    } catch (e) {}
  };

  const completedStages = job.stages.filter((s) => s.completed).length;
  const totalStages = job.stages.length;

  const handleToggleStage = (stageId: string) => {
    const updatedStages = job.stages.map((st) =>
      st.id === stageId ? { ...st, completed: !st.completed } : st
    );

    const newlyCompleted = updatedStages.filter((s) => s.completed).length;
    if (newlyCompleted === totalStages && totalStages > 0) {
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }

    onUpdateJob({
      ...job,
      stages: updatedStages,
      lastActivityDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;

    const newStage: StageItem = {
      id: `stage-${Date.now()}`,
      name: newStageName.trim(),
      completed: false,
      date: newStageDate.trim() || undefined,
      time: newStageTime.trim() || undefined
    };

    onUpdateJob({
      ...job,
      stages: [...job.stages, newStage],
      lastActivityDate: new Date().toISOString().split('T')[0]
    });
    setNewStageName('');
    setNewStageDate('');
    setNewStageTime('');
  };

  const handleUpdateExistingStageDate = (stageId: string, date: string) => {
    const updatedStages = job.stages.map((st) =>
      st.id === stageId ? { ...st, date: date.trim() || undefined } : st
    );
    onUpdateJob({
      ...job,
      stages: updatedStages,
      lastActivityDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleUpdateExistingStageTime = (stageId: string, time: string) => {
    const updatedStages = job.stages.map((st) =>
      st.id === stageId ? { ...st, time: time.trim() || undefined } : st
    );
    onUpdateJob({
      ...job,
      stages: updatedStages,
      lastActivityDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleRemoveStage = (stageId: string) => {
    onUpdateJob({
      ...job,
      stages: job.stages.filter((st) => st.id !== stageId)
    });
  };

  const handleSyncStageToGoogleCalendar = async (stage: StageItem) => {
    if (!stage.date) return;
    setSyncingStageId(stage.id);
    try {
      const token = await getValidCalendarToken();
      const eventData = buildInterviewEventData(job, stage, stage.date, stage.time);
      const created = await createGoogleCalendarEvent(token, eventData);

      const nowIso = new Date().toISOString();
      const updatedStages = job.stages.map((st) =>
        st.id === stage.id
          ? {
              ...st,
              calendarEventId: created.id,
              calendarEventLink: created.htmlLink,
              calendarSyncedAt: nowIso
            }
          : st
      );

      onUpdateJob({
        ...job,
        stages: updatedStages,
        lastActivityDate: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Failed to sync stage with Google Calendar:', err);
    } finally {
      setSyncingStageId(null);
    }
  };

  const handleConfirmDeleteStageFromCalendar = async () => {
    const stage = deleteCalendarModal.stage;
    if (!stage || !stage.calendarEventId) return;

    setDeleteCalendarModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      const token = await getValidCalendarToken();
      await deleteGoogleCalendarEvent(token, stage.calendarEventId);

      const updatedStages = job.stages.map((st) =>
        st.id === stage.id
          ? {
              ...st,
              calendarEventId: undefined,
              calendarEventLink: undefined,
              calendarSyncedAt: undefined
            }
          : st
      );

      onUpdateJob({
        ...job,
        stages: updatedStages
      });
    } catch (err) {
      console.error('Failed to delete stage from Google Calendar:', err);
    } finally {
      setDeleteCalendarModal({ isOpen: false, isDeleting: false, stage: undefined });
    }
  };

  // Note editing & deletion state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState<string>('');
  const [editingNoteType, setEditingNoteType] = useState<JobNote['type']>('general');
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);

  const handleStartEditNote = (note: JobNote) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
    setEditingNoteType(note.type);
    setNoteToDeleteId(null);
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const handleSaveEditNote = (noteId: string) => {
    if (!editingNoteContent.trim()) return;

    const updatedNotes = job.notes.map((n) =>
      n.id === noteId
        ? {
            ...n,
            content: editingNoteContent.trim(),
            type: editingNoteType
          }
        : n
    );

    onUpdateJob({
      ...job,
      notes: updatedNotes,
      lastActivityDate: new Date().toISOString().split('T')[0]
    });

    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = job.notes.filter((n) => n.id !== noteId);
    onUpdateJob({
      ...job,
      notes: updatedNotes,
      lastActivityDate: new Date().toISOString().split('T')[0]
    });
    setNoteToDeleteId(null);
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const newNote: JobNote = {
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      type: newNoteType,
      content: newNoteContent.trim()
    };

    onUpdateJob({
      ...job,
      notes: [newNote, ...job.notes],
      lastActivityDate: new Date().toISOString().split('T')[0]
    });
    setNewNoteContent('');
  };

  const handleStatusChange = (newStatus: JobStatus) => {
    if (newStatus === 'offer') {
      try {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    }
    const todayStr = new Date().toISOString().split('T')[0];
    onUpdateJob({
      ...job,
      status: newStatus,
      statusDate: todayStr,
      lastActivityDate: todayStr
    });
  };

  const handleCopyTemplate = (template: MessageTemplate) => {
    const contact = job.contacts[0];
    const { subject, body } = fillTemplate(template, job, contact, templateLang);
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopiedTemplateId(template.id);
    setTimeout(() => setCopiedTemplateId(null), 2500);
  };

  const statusConfig = STATUS_CONFIG[job.status] || STATUS_CONFIG.applied;
  const questionsList = job.category === 'JobsMgm' ? INTERVIEW_QUESTIONS_MGM : INTERVIEW_QUESTIONS_TECH;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-base text-white shrink-0 shadow-sm">
                {job.company.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white truncate">
                    {job.company}
                  </h2>
                  <span
                    className={`text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded-md border ${
                      job.category === 'JobsTech'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}
                  >
                    {job.category}
                  </span>
                  {job.jobUrl && (
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-indigo-400 transition-colors"
                      title="Open original posting"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-sm text-slate-300 font-medium truncate mt-0.5">
                  {job.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 opacity-70" />
                    {job.location} ({job.workModel})
                  </span>
                  {job.salaryExpected && (
                    <span className="font-mono text-slate-300">
                      • {job.salaryExpected}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onEditJob(job)}
                className="p-2 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Edit opportunity"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteJob(job.id)}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Delete opportunity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status & 2nd Column Highlight: Stages (0/3) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status:</span>
                <select
                  value={job.status}
                  onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
                  className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${statusConfig.badgeBg}`}
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
              </div>

              {/* Date below the Status badge */}
              {(() => {
                const statusInfo = formatStatusDateInfo(job.statusDate || job.appliedDate);
                return (
                  <div
                    className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono ml-12"
                    title={`Status "${statusConfig.label}" set on ${statusInfo.formattedDate} (${statusInfo.daysLabel})`}
                  >
                    <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>Since <strong className="text-slate-200">{statusInfo.formattedDate}</strong></span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${statusInfo.isToday ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      {statusInfo.daysLabel}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Stage Progress (2nd Column) */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Stages:</span>
              <StageBadge stages={job.stages} size="md" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 bg-slate-950/40 border-b border-slate-800 shrink-0 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('stages')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'stages'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Stages ({completedStages}/{totalStages})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>Notes ({job.notes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Contacts & Outreach</span>
          </button>

          <button
            onClick={() => setActiveTab('resumes')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'resumes'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tailored Resume</span>
          </button>

          <button
            onClick={() => setActiveTab('interview_prep')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'interview_prep'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interview Prep</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: STAGES & GOOGLE CALENDAR SYNC */}
          {activeTab === 'stages' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Interview Stage Pipeline
                  </h3>
                  <span className="font-mono text-xs text-indigo-400 font-semibold">
                    {completedStages}/{totalStages} Completed
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${totalStages > 0 ? (completedStages / totalStages) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Stages List */}
              <div className="space-y-2.5">
                {job.stages.map((stage, idx) => {
                  const gcalUrl = createGoogleCalendarUrl(job, stage, stage.date, stage.time);

                  return (
                    <div
                      key={stage.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        stage.completed
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                          : 'bg-slate-900/90 border-slate-800 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => handleToggleStage(stage.id)}
                            className={`mt-0.5 p-1 rounded transition-colors ${
                              stage.completed
                                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                                : 'text-slate-500 hover:text-indigo-400 bg-slate-800 border border-slate-700'
                            }`}
                            title={stage.completed ? 'Mark incomplete' : 'Mark stage complete'}
                          >
                            <CheckCircle2 className={`w-4 h-4 ${stage.completed ? 'fill-emerald-400/20' : ''}`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono font-bold text-slate-400">
                                Stage #{idx + 1}
                              </span>
                              <h4
                                className={`text-xs font-semibold ${
                                  stage.completed ? 'line-through text-slate-400' : 'text-slate-100'
                                }`}
                              >
                                {stage.name}
                              </h4>
                            </div>

                            {stage.notes && (
                              <p className="text-xs text-slate-400 mt-1 pl-0.5">
                                {stage.notes}
                              </p>
                            )}

                            {/* Scheduled Date, Time & Google Calendar Button */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {/* Inline Date & Time Picker to set or change stage interview schedule */}
                              <div className="inline-flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1 text-[11px]">
                                <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                <input
                                  type="date"
                                  value={stage.date || ''}
                                  onChange={(e) => handleUpdateExistingStageDate(stage.id, e.target.value)}
                                  className="bg-transparent text-slate-200 font-mono text-[11px] focus:outline-none cursor-pointer [color-scheme:dark]"
                                  title="Schedule or change interview date"
                                />
                                <Clock className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                                <input
                                  type="time"
                                  value={stage.time || ''}
                                  onChange={(e) => handleUpdateExistingStageTime(stage.id, e.target.value)}
                                  className="bg-transparent text-slate-300 font-mono text-[11px] focus:outline-none cursor-pointer w-16 [color-scheme:dark]"
                                  title="Schedule or change interview time"
                                />
                              </div>

                              {/* Google Calendar Controls */}
                              {stage.date && (
                                <>
                                  {stage.calendarEventLink ? (
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span>Google Calendar Synced</span>
                                      <a
                                        href={stage.calendarEventLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-emerald-400 hover:text-white p-0.5 rounded transition-colors"
                                        title="Open event in Google Calendar"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDeleteCalendarModal({
                                            isOpen: true,
                                            stage,
                                            isDeleting: false
                                          })
                                        }
                                        className="text-rose-400/80 hover:text-rose-400 p-0.5 rounded transition-colors ml-0.5"
                                        title="Remove event from Google Calendar"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center gap-1">
                                      <button
                                        type="button"
                                        disabled={syncingStageId === stage.id}
                                        onClick={() => handleSyncStageToGoogleCalendar(stage)}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-[11px] font-medium transition-colors"
                                        title="Sync this interview stage directly to Google Calendar"
                                      >
                                        {syncingStageId === stage.id ? (
                                          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                                        ) : (
                                          <CalendarPlus className="w-3 h-3" />
                                        )}
                                        <span>Sync to Google Calendar</span>
                                      </button>
                                      {onOpenGoogleCalendarModal && (
                                        <button
                                          type="button"
                                          onClick={() => onOpenGoogleCalendarModal(job, stage)}
                                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] border border-slate-700 transition-colors"
                                          title="Customize & Schedule in Google Calendar"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => downloadIcsFile(job, stage, stage.date, stage.time)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-white text-[11px] transition-colors"
                                    title="Download .ICS file (Outlook / Apple Calendar)"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>.ICS</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveStage(stage.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          title="Remove stage"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Stage Form */}
              <form onSubmit={handleAddStage} className="pt-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    placeholder="Add new interview stage (e.g., Live Coding, VP Panel)..."
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <input
                        type="date"
                        value={newStageDate}
                        onChange={(e) => setNewStageDate(e.target.value)}
                        title="Scheduled date (optional)"
                        className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer [color-scheme:dark]"
                      />
                      <Clock className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                      <input
                        type="time"
                        value={newStageTime}
                        onChange={(e) => setNewStageTime(e.target.value)}
                        title="Scheduled time (optional)"
                        className="bg-transparent text-slate-300 text-xs font-mono focus:outline-none cursor-pointer w-16 [color-scheme:dark]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!newStageName.trim()}
                      className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: NOTES & TIMELINE */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* New Note Form */}
              <form onSubmit={handleAddNote} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <StickyNote className="w-3.5 h-3.5 text-indigo-400" />
                    Add Note
                  </span>
                  <select
                    value={newNoteType}
                    onChange={(e) => setNewNoteType(e.target.value as any)}
                    className="text-xs bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-300 capitalize cursor-pointer focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="general">General</option>
                    <option value="interview">Interview</option>
                    <option value="feedback">Feedback</option>
                    <option value="question">Question</option>
                    <option value="research">Company Research</option>
                  </select>
                </div>

                <textarea
                  rows={10}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record interview notes, technical questions asked, feedback received, key takeaways, or compensation discussions..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 resize-y min-h-[220px] leading-relaxed font-sans placeholder:text-slate-500"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Input expanded to 10+ lines for comfortable long-form note-taking.
                  </span>
                  <button
                    type="submit"
                    disabled={!newNoteContent.trim()}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Save Note
                  </button>
                </div>
              </form>

              {/* Notes List */}
              {job.notes.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                  No notes recorded for this opportunity yet. Use the form above to add your first note.
                </div>
              ) : (
                <div className="space-y-3">
                  {job.notes.map((note) => {
                    const isEditing = editingNoteId === note.id;
                    const isConfirmingDelete = noteToDeleteId === note.id;

                    if (isEditing) {
                      return (
                        <div
                          key={note.id}
                          className="p-4 rounded-xl bg-slate-900 border border-indigo-500/70 shadow-lg space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit Note
                            </span>
                            <select
                              value={editingNoteType}
                              onChange={(e) => setEditingNoteType(e.target.value as any)}
                              className="text-xs bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-300 capitalize cursor-pointer focus:outline-none focus:border-indigo-400 font-medium"
                            >
                              <option value="general">General</option>
                              <option value="interview">Interview</option>
                              <option value="feedback">Feedback</option>
                              <option value="question">Question</option>
                              <option value="research">Company Research</option>
                            </select>
                          </div>

                          <textarea
                            rows={10}
                            value={editingNoteContent}
                            onChange={(e) => setEditingNoteContent(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-400 resize-y min-h-[220px] leading-relaxed font-sans"
                            placeholder="Edit your note..."
                          />

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                            <button
                              type="button"
                              onClick={handleCancelEditNote}
                              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditNote(note.id)}
                              disabled={!editingNoteContent.trim()}
                              className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" /> Save Changes
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={note.id}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors group"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700/50">
                              {note.type}
                            </span>
                            <span className="font-mono text-slate-500">
                              {new Date(note.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* Edit and Remove Action Buttons */}
                          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleStartEditNote(note)}
                              className="px-2 py-1 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
                              title="Edit this note"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-medium hidden sm:inline">Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setNoteToDeleteId(note.id)}
                              className="px-2 py-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 text-xs"
                              title="Remove this note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-medium hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Confirmation Prompt when Remove is clicked */}
                        {isConfirmingDelete && (
                          <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/50 flex items-center justify-between gap-3 text-xs text-rose-200">
                            <span className="font-medium text-xs">
                              Are you sure you want to delete this note?
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => setNoteToDeleteId(null)}
                                className="px-2.5 py-1 rounded text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteNote(note.id)}
                                className="px-3 py-1 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors"
                              >
                                Delete Note
                              </button>
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans pt-1">
                          {note.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONTACTS & FOLLOW-UP TEMPLATES */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              {/* Recruiter Contacts */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Recruiters & Hiring Managers
                </h3>

                {job.contacts.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    No recruiter contacts added yet. Click edit above to attach an email or phone number.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {job.contacts.map((contact, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5"
                      >
                        <div>
                          <h4 className="font-bold text-white text-sm">
                            {contact.name}
                          </h4>
                          {contact.role && (
                            <p className="text-xs text-slate-400">{contact.role}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/60 text-xs">
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/25 transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>{contact.email}</span>
                            </a>
                          )}

                          {contact.phone && (
                            <a
                              href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>WhatsApp ({contact.phone})</span>
                            </a>
                          )}

                          {contact.linkedin && (
                            <a
                              href={contact.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>LinkedIn</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Follow-up Message Generator with Multi-Language Switcher */}
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      1-Click Outreach Email Templates
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Pre-written professional follow-up templates in English, Spanish, and Portuguese.
                    </p>
                  </div>

                  {/* Language Selector Pills */}
                  <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('en')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                        templateLang === 'en'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Switch templates to American English"
                    >
                      <span>🇺🇸</span>
                      <span>English</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('es')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                        templateLang === 'es'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Cambiar plantillas a Español"
                    >
                      <span>🇪🇸</span>
                      <span>Español</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('pt')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                        templateLang === 'pt'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Alternar modelos para Português"
                    >
                      <span>🇧🇷</span>
                      <span>Português</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentTemplates.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                        selectedTemplate.id === tpl.id
                          ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-semibold text-slate-200 line-clamp-1">{tpl.title}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{tpl.description}</div>
                    </button>
                  ))}
                </div>

                {selectedTemplate && (
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    {(() => {
                      const { subject, body } = fillTemplate(selectedTemplate, job, job.contacts[0], templateLang);
                      return (
                        <>
                          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                            <span className="font-medium text-slate-300 truncate max-w-[340px]">
                              Subject: {subject}
                            </span>
                            <button
                              onClick={() => handleCopyTemplate(selectedTemplate)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-500 transition-colors"
                            >
                              {copiedTemplateId === selectedTemplate.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy Message
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                            {body}
                          </pre>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TAILORED RESUMES */}
          {activeTab === 'resumes' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Customized Resume Files
                </h3>
                <p className="text-xs text-slate-400">
                  Version of your resume submitted exclusively to this company.
                </p>
              </div>

              {job.resumes.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400">
                  No customized resume attached yet. Edit the opportunity above to attach your PDF.
                </div>
              ) : (
                <div className="space-y-3">
                  {job.resumes.map((cv) => (
                    <div
                      key={cv.id}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-xs">
                              {cv.fileName}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {cv.versionLabel || 'Standard Version'} • {cv.fileSize || 'PDF'}
                            </p>
                          </div>
                        </div>

                        {cv.dataUrl ? (
                          <a
                            href={cv.dataUrl}
                            download={cv.fileName}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium hover:bg-indigo-600/30 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            Document logged
                          </span>
                        )}
                      </div>

                      {cv.tailoredFocus && (
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                            🎯 Tailoring Highlights:
                          </div>
                          <p className="text-slate-300 leading-relaxed">
                            {cv.tailoredFocus}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: INTERVIEW PREP GUIDE */}
          {activeTab === 'interview_prep' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Strategic Interview Guide
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Key technical and managerial questions to review before meeting the {job.company} interview team.
                </p>
              </div>

              {questionsList.map((group, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-200">
                    {group.category}
                  </h4>
                  <ul className="space-y-2">
                    {group.items.map((item, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog for Workspace API Deletions */}
      <CalendarConfirmModal
        isOpen={deleteCalendarModal.isOpen}
        title="Remove Interview from Google Calendar?"
        message="Are you sure you want to remove this interview event from your primary Google Calendar? This action cannot be undone."
        eventSummary={
          deleteCalendarModal.stage
            ? `[Interview] ${job.company} - ${job.title} (${deleteCalendarModal.stage.name})`
            : undefined
        }
        eventDate={deleteCalendarModal.stage?.date}
        confirmLabel="Remove from Calendar"
        isDestructive={true}
        isLoading={deleteCalendarModal.isDeleting}
        onConfirm={handleConfirmDeleteStageFromCalendar}
        onCancel={() =>
          setDeleteCalendarModal({ isOpen: false, isDeleting: false, stage: undefined })
        }
      />
    </div>
  );
};
