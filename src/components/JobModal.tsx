import React, { useState, useEffect } from 'react';
import {
  JobOpportunity,
  JobCategory,
  JobStatus,
  StageItem,
  RecruiterContact,
  ResumeAttachment,
  JobNote,
  DEFAULT_TECH_STAGES,
  DEFAULT_MGM_STAGES
} from '../types/job';
import { formatStatusDateInfo } from '../services/timing';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  User,
  Mail,
  Phone,
  FileText,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock,
  Edit3,
  Check,
  StickyNote
} from 'lucide-react';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobOpportunity) => void;
  initialJob?: JobOpportunity | null;
  defaultCategory?: JobCategory;
}

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialJob,
  defaultCategory = 'JobsTech'
}) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState<JobCategory>(defaultCategory);
  const [status, setStatus] = useState<JobStatus>('applied');
  const [location, setLocation] = useState('Remote / US or Europe');
  const [workModel, setWorkModel] = useState<'remote' | 'hybrid' | 'onsite'>('remote');
  const [jobUrl, setJobUrl] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('$');
  const [salaryExpected, setSalaryExpected] = useState('');
  const [salaryOffered, setSalaryOffered] = useState('');
  const [benefits, setBenefits] = useState('');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [followUpDaysInterval, setFollowUpDaysInterval] = useState(7);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'dream_job'>('high');

  // Stages (2nd column control)
  const [stages, setStages] = useState<StageItem[]>([]);

  // Recruiter Contact
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactLinkedin, setContactLinkedin] = useState('');

  // Tailored Resume
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeVersionLabel, setResumeVersionLabel] = useState('');
  const [resumeTailoredFocus, setResumeTailoredFocus] = useState('');
  const [resumeDataUrl, setResumeDataUrl] = useState<string | undefined>(undefined);

  // Initial Note & Notes Management
  const [initialNote, setInitialNote] = useState('');
  const [modalNotes, setModalNotes] = useState<JobNote[]>([]);
  const [editingModalNoteId, setEditingModalNoteId] = useState<string | null>(null);
  const [editingModalNoteContent, setEditingModalNoteContent] = useState<string>('');
  const [editingModalNoteType, setEditingModalNoteType] = useState<JobNote['type']>('general');
  const [modalNoteToDeleteId, setModalNoteToDeleteId] = useState<string | null>(null);

  const handleStartEditModalNote = (note: JobNote) => {
    setEditingModalNoteId(note.id);
    setEditingModalNoteContent(note.content);
    setEditingModalNoteType(note.type);
    setModalNoteToDeleteId(null);
  };

  const handleSaveModalNote = (noteId: string) => {
    if (!editingModalNoteContent.trim()) return;
    setModalNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? { ...n, content: editingModalNoteContent.trim(), type: editingModalNoteType }
          : n
      )
    );
    setEditingModalNoteId(null);
    setEditingModalNoteContent('');
  };

  const handleDeleteModalNote = (noteId: string) => {
    setModalNotes((prev) => prev.filter((n) => n.id !== noteId));
    setModalNoteToDeleteId(null);
    if (editingModalNoteId === noteId) {
      setEditingModalNoteId(null);
    }
  };

  useEffect(() => {
    if (initialJob) {
      setTitle(initialJob.title);
      setCompany(initialJob.company);
      setCategory(initialJob.category);
      setStatus(initialJob.status);
      setLocation(initialJob.location || '');
      setWorkModel(initialJob.workModel || 'remote');
      setJobUrl(initialJob.jobUrl || '');
      setSalaryCurrency(initialJob.salaryCurrency || '$');
      setSalaryExpected(initialJob.salaryExpected || '');
      setSalaryOffered(initialJob.salaryOffered || '');
      setBenefits(initialJob.benefits || '');
      setAppliedDate(initialJob.appliedDate || new Date().toISOString().split('T')[0]);
      setNextFollowUpDate(initialJob.nextFollowUpDate || '');
      setFollowUpDaysInterval(initialJob.followUpDaysInterval || 7);
      setPriority(initialJob.priority || 'high');
      setStages(initialJob.stages || []);
      setModalNotes(initialJob.notes ? [...initialJob.notes] : []);

      if (initialJob.contacts && initialJob.contacts.length > 0) {
        const c = initialJob.contacts[0];
        setContactName(c.name || '');
        setContactRole(c.role || '');
        setContactEmail(c.email || '');
        setContactPhone(c.phone || '');
        setContactLinkedin(c.linkedin || '');
      } else {
        setContactName('');
        setContactRole('');
        setContactEmail('');
        setContactPhone('');
        setContactLinkedin('');
      }

      if (initialJob.resumes && initialJob.resumes.length > 0) {
        const r = initialJob.resumes[0];
        setResumeFileName(r.fileName || '');
        setResumeVersionLabel(r.versionLabel || '');
        setResumeTailoredFocus(r.tailoredFocus || '');
        setResumeDataUrl(r.dataUrl);
      } else {
        setResumeFileName('');
        setResumeVersionLabel('');
        setResumeTailoredFocus('');
        setResumeDataUrl(undefined);
      }

      setInitialNote('');
    } else {
      setTitle('');
      setCompany('');
      setCategory(defaultCategory);
      setStatus('applied');
      setLocation('Remote / US or Europe');
      setWorkModel('remote');
      setJobUrl('');
      setSalaryCurrency(defaultCategory === 'JobsTech' ? '$' : '€');
      setSalaryExpected(defaultCategory === 'JobsTech' ? '$140,000 - $160,000 / yr' : '€85,000 / yr');
      setSalaryOffered('');
      setModalNotes([]);
      setBenefits('');
      const todayStr = new Date().toISOString().split('T')[0];
      setAppliedDate(todayStr);

      const d7 = new Date();
      d7.setDate(d7.getDate() + 7);
      setNextFollowUpDate(d7.toISOString().split('T')[0]);
      setFollowUpDaysInterval(7);
      setPriority('high');

      const defaultStageNames = defaultCategory === 'JobsMgm' ? DEFAULT_MGM_STAGES : DEFAULT_TECH_STAGES;
      setStages(
        defaultStageNames.map((name, i) => ({
          id: `stage-new-${Date.now()}-${i}`,
          name,
          completed: false
        }))
      );

      setContactName('');
      setContactRole(defaultCategory === 'JobsMgm' ? 'Executive Talent Partner' : 'Senior Tech Recruiter');
      setContactEmail('');
      setContactPhone('');
      setContactLinkedin('');

      setResumeFileName('');
      setResumeVersionLabel('');
      setResumeTailoredFocus('');
      setResumeDataUrl(undefined);
      setInitialNote('');
    }
  }, [initialJob, defaultCategory, isOpen]);

  const handleAddStage = () => {
    setStages([
      ...stages,
      {
        id: `stage-${Date.now()}`,
        name: `Stage ${stages.length + 1}`,
        completed: false
      }
    ]);
  };

  const handleUpdateStageName = (index: number, newName: string) => {
    const updated = [...stages];
    updated[index].name = newName;
    setStages(updated);
  };

  const handleUpdateStageDate = (index: number, newDate: string) => {
    const updated = [...stages];
    updated[index].date = newDate;
    setStages(updated);
  };

  const handleUpdateStageTime = (index: number, newTime: string) => {
    const updated = [...stages];
    updated[index].time = newTime;
    setStages(updated);
  };

  const handleToggleStageCompleted = (index: number) => {
    const updated = [...stages];
    updated[index].completed = !updated[index].completed;
    setStages(updated);
  };

  const handleRemoveStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setResumeDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !title.trim()) return;

    const contacts: RecruiterContact[] = [];
    if (contactName.trim() || contactEmail.trim() || contactPhone.trim()) {
      contacts.push({
        name: contactName.trim() || 'Primary Recruiter',
        role: contactRole.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
        linkedin: contactLinkedin.trim()
      });
    }

    const resumes: ResumeAttachment[] = [];
    if (resumeFileName.trim()) {
      resumes.push({
        id: initialJob?.resumes?.[0]?.id || `cv-${Date.now()}`,
        fileName: resumeFileName.trim(),
        fileSize: resumeDataUrl ? '320 KB' : 'PDF',
        fileType: 'application/pdf',
        dataUrl: resumeDataUrl,
        uploadedAt: new Date().toISOString(),
        versionLabel: resumeVersionLabel.trim(),
        tailoredFocus: resumeTailoredFocus.trim()
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let computedStatusDate = todayStr;
    if (initialJob) {
      if (status !== initialJob.status) {
        computedStatusDate = todayStr;
      } else {
        computedStatusDate = initialJob.statusDate || initialJob.appliedDate || todayStr;
      }
    } else {
      computedStatusDate = todayStr;
    }

    const updatedJob: JobOpportunity = {
      id: initialJob?.id || `job-${Date.now()}`,
      title: title.trim(),
      company: company.trim(),
      category,
      status,
      statusDate: computedStatusDate,
      stages,
      location: location.trim(),
      workModel,
      jobUrl: jobUrl.trim(),
      salaryCurrency,
      salaryExpected: salaryExpected.trim(),
      salaryOffered: salaryOffered.trim(),
      benefits: benefits.trim(),
      appliedDate,
      lastActivityDate: todayStr,
      nextFollowUpDate: nextFollowUpDate || undefined,
      followUpDaysInterval,
      priority,
      contacts,
      resumes,
      notes: [...modalNotes],
      rating: initialJob?.rating || 4
    };

    if (initialNote.trim()) {
      updatedJob.notes.unshift({
        id: `note-${Date.now()}`,
        createdAt: new Date().toISOString(),
        type: 'general',
        content: initialNote.trim()
      });
    }

    onSave(updatedJob);
  };

  const completedCount = stages.filter((s) => s.completed).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialJob ? 'Edit Opportunity' : 'Add New Job Opportunity'}
              </h2>
              <p className="text-xs text-slate-400">
                Manage interview stages, recruiter contacts, and customized resumes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="E.g., Stripe, Cabify, Glovo..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Position Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Senior Fullstack Engineer..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Track / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as JobCategory)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="JobsTech">JobsTech (Software & Engineering)</option>
                <option value="JobsMgm">JobsMgm (Management & Product)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Status, Priority, Work Model, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Application Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="applied">Applied</option>
                <option value="screening">HR Screening</option>
                <option value="interviewing">Interviewing</option>
                <option value="tech_challenge">Technical Challenge</option>
                <option value="offer">Offer Received 🎉</option>
                <option value="standby">Awaiting Feedback</option>
                <option value="rejected">Not Selected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
              {initialJob ? (
                <div className="mt-1 text-[10px] text-slate-400 font-mono">
                  {status !== initialJob.status ? (
                    <span className="text-amber-400">Date will update to today</span>
                  ) : (
                    <span>
                      Set: <strong className="text-slate-300">{formatStatusDateInfo(initialJob.statusDate || initialJob.appliedDate).formattedDate}</strong> ({formatStatusDateInfo(initialJob.statusDate || initialJob.appliedDate).daysLabel})
                    </span>
                  )}
                </div>
              ) : (
                <div className="mt-1 text-[10px] text-slate-400 font-mono">
                  Date: <strong className="text-slate-300">{formatStatusDateInfo().formattedDate}</strong> (Today)
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Model
              </label>
              <select
                value={workModel}
                onChange={(e) => setWorkModel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="remote">100% Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="E.g., Madrid, New York, Remote"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="dream_job">⭐ Dream Job (Top Priority)</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* 2ND COLUMN CONTROL: STAGE PROGRESSION (0/3, 1/3) */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  Interview Stages Pipeline (2nd Column: X/Y)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Current progress: <strong className="text-white font-mono">{completedCount}/{stages.length}</strong> stages completed.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddStage}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Stage
              </button>
            </div>

            <div className="space-y-2">
              {stages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleStageCompleted(idx)}
                    className={`p-1 rounded text-xs transition-colors ${
                      stage.completed ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-400'
                    }`}
                    title={stage.completed ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${stage.completed ? 'fill-emerald-400/20' : ''}`} />
                  </button>

                  <span className="text-xs font-mono font-bold text-slate-500 w-6">
                    #{idx + 1}
                  </span>

                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => handleUpdateStageName(idx, e.target.value)}
                    placeholder="Stage name (e.g., Live Coding, VP Interview...)"
                    className={`flex-1 min-w-[160px] px-2.5 py-1 text-xs rounded bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 ${
                      stage.completed ? 'line-through text-slate-400' : ''
                    }`}
                  />

                  {/* Date & Time for Google Calendar Sync */}
                  <div className="flex items-center gap-1">
                    <input
                      type="date"
                      value={stage.date || ''}
                      onChange={(e) => handleUpdateStageDate(idx, e.target.value)}
                      title="Scheduled interview date"
                      className="px-2 py-1 text-[11px] rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono focus:outline-none"
                    />
                    <input
                      type="time"
                      value={stage.time || ''}
                      onChange={(e) => handleUpdateStageTime(idx, e.target.value)}
                      title="Interview time"
                      className="px-2 py-1 text-[11px] rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono focus:outline-none w-20"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveStage(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove this stage"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Compensation & Job URL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Salary
              </label>
              <input
                type="text"
                value={salaryExpected}
                onChange={(e) => setSalaryExpected(e.target.value)}
                placeholder="E.g., $150,000 / yr"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Offered Compensation
              </label>
              <input
                type="text"
                value={salaryOffered}
                onChange={(e) => setSalaryOffered(e.target.value)}
                placeholder="E.g., $160,000 + 15% Bonus"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Job Posting URL
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Recruiter Contact Information */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Recruiter / Hiring Manager Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="E.g., Sarah Recruiter"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="recruiter@company.com"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Tailored Resumes */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Tailored Resume for this Employer
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  File Name / Version Label
                </label>
                <input
                  type="text"
                  value={resumeFileName}
                  onChange={(e) => setResumeFileName(e.target.value)}
                  placeholder="E.g., CV_Senior_Fullstack_Stripe.pdf"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Upload File (PDF / DOCX)
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose file...</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {resumeFileName && (
                    <span className="text-xs text-indigo-400 truncate max-w-[150px]">
                      {resumeFileName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Customization Strategy & Key Highlights
              </label>
              <input
                type="text"
                value={resumeTailoredFocus}
                onChange={(e) => setResumeTailoredFocus(e.target.value)}
                placeholder="E.g., Highlighted microservices, distributed caching, and 8+ years with React..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Follow-up Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Next Follow-up Date
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Application Date
              </label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Existing Notes Management (if any) */}
          {modalNotes.length > 0 && (
            <div className="space-y-3 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <StickyNote className="w-3.5 h-3.5 text-indigo-400" />
                  Recorded Notes ({modalNotes.length})
                </label>
                <span className="text-[11px] text-slate-500">
                  Click Edit or Delete to manage any note
                </span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {modalNotes.map((note) => {
                  const isEditing = editingModalNoteId === note.id;
                  const isConfirmingDelete = modalNoteToDeleteId === note.id;

                  if (isEditing) {
                    return (
                      <div
                        key={note.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/70 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5" />
                            Editing Note
                          </span>
                          <select
                            value={editingModalNoteType}
                            onChange={(e) => setEditingModalNoteType(e.target.value as any)}
                            className="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 capitalize cursor-pointer focus:outline-none focus:border-indigo-400 font-medium"
                          >
                            <option value="general">General</option>
                            <option value="interview">Interview</option>
                            <option value="feedback">Feedback</option>
                            <option value="question">Question</option>
                            <option value="research">Company Research</option>
                          </select>
                        </div>

                        <textarea
                          rows={8}
                          value={editingModalNoteContent}
                          onChange={(e) => setEditingModalNoteContent(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-400 resize-y min-h-[160px] leading-relaxed font-sans"
                          placeholder="Edit note..."
                        />

                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingModalNoteId(null);
                              setEditingModalNoteContent('');
                            }}
                            className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveModalNote(note.id)}
                            disabled={!editingModalNoteContent.trim()}
                            className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" /> Save Changes
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium text-[10px]">
                            {note.type}
                          </span>
                          <span className="font-mono text-slate-500 text-[10px]">
                            {new Date(note.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEditModalNote(note)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                            title="Edit this note"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalNoteToDeleteId(note.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete this note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Confirmation Prompt */}
                      {isConfirmingDelete && (
                        <div className="p-2 rounded bg-rose-950/50 border border-rose-500/50 flex items-center justify-between text-xs text-rose-200">
                          <span>Delete this note?</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setModalNoteToDeleteId(null)}
                              className="px-2 py-0.5 rounded text-[11px] text-slate-300 hover:bg-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteModalNote(note.id)}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                        {note.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Initial / New Note */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                {initialJob ? 'Add New Note / Follow-up Impressions' : 'Initial Notes & Impressions'}
              </label>
              <span className="text-[11px] text-slate-500">10 lines</span>
            </div>
            <textarea
              rows={10}
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              placeholder="E.g., How I found the role, referral source, recruiter contact summary, initial thoughts on team tech stack, compensation details..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 resize-y min-h-[220px] leading-relaxed font-sans placeholder:text-slate-500"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {initialJob ? 'Save Changes' : 'Create Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
