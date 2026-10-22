import React, { useState, useEffect } from 'react';
import { JobOpportunity, JobCategory, JobStatus, StageItem } from './types/job';
import { getStoredJobs, saveStoredJobs, calculateFollowUps } from './services/storage';
import { Header, ViewMode } from './components/Header';
import { JobTable } from './components/JobTable';
import { JobKanban } from './components/JobKanban';
import { JobCalendar } from './components/JobCalendar';
import { JobAnalytics } from './components/JobAnalytics';
import { JobModal } from './components/JobModal';
import { JobDetailDrawer } from './components/JobDetailDrawer';
import { FollowUpReminderModal } from './components/FollowUpReminderModal';
import { ExportImportModal } from './components/ExportImportModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { GoogleCalendarSyncModal } from './components/GoogleCalendarSyncModal';
import { LoginPage } from './components/LoginPage';
import { useAuth } from './context/AuthContext';
import {
  saveJobToFirestore,
  deleteJobFromFirestore,
  subscribeToUserJobs,
  batchSaveJobsToFirestore
} from './services/firebase';
import confetti from 'canvas-confetti';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function App() {
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // Filters & Views
  const [currentCategory, setCurrentCategory] = useState<JobCategory | 'All'>('JobsTech');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Drawers
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpportunity | null>(null);
  const [drawerJob, setDrawerJob] = useState<JobOpportunity | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobOpportunity | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarModalJob, setCalendarModalJob] = useState<JobOpportunity | null>(null);
  const [calendarModalStage, setCalendarModalStage] = useState<StageItem | null>(null);

  // Load jobs based on Firebase Auth state
  useEffect(() => {
    if (!user) {
      setJobs([]);
      setIsLoaded(true);
      return;
    }

    let isMounted = true;
    setIsLoaded(false);

    // Subscribe to Firestore updates for authenticated user
    const unsubscribe = subscribeToUserJobs(
      user.uid,
      async (cloudJobs) => {
        if (!isMounted) return;

        const localJobs = getStoredJobs();

        if (cloudJobs.length === 0) {
          // If Firestore is empty for this user, seed from local storage
          if (localJobs.length > 0) {
            try {
              await batchSaveJobsToFirestore(user.uid, localJobs);
              return; // listener will fire with saved jobs
            } catch (err) {
              console.error('Failed to sync initial local jobs to cloud:', err);
            }
          }
          setJobs(localJobs);
        } else {
          // If local storage has more jobs or recovered jobs from legacy keys, merge them!
          if (localJobs.length > cloudJobs.length) {
            const mergedMap = new Map<string, JobOpportunity>();
            cloudJobs.forEach((j) => mergedMap.set(j.id, j));
            localJobs.forEach((j) => {
              const uKey = `${j.company.toLowerCase()}:::${j.title.toLowerCase()}`;
              const alreadyHas = Array.from(mergedMap.values()).some(
                (m) => m.id === j.id || `${m.company.toLowerCase()}:::${m.title.toLowerCase()}` === uKey
              );
              if (!alreadyHas) {
                mergedMap.set(j.id, j);
              }
            });

            const mergedList = Array.from(mergedMap.values());
            if (mergedList.length > cloudJobs.length) {
              setJobs(mergedList);
              saveStoredJobs(mergedList);
              try {
                await batchSaveJobsToFirestore(user.uid, mergedList);
              } catch (e) {
                console.error('Failed to sync merged jobs to Firestore:', e);
              }
              setIsLoaded(true);
              return;
            }
          }

          setJobs(cloudJobs);
          saveStoredJobs(cloudJobs);
        }
        setIsLoaded(true);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        if (isMounted) {
          setJobs(getStoredJobs());
          setIsLoaded(true);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user]);

  // Save to local storage on change and sync to Firestore
  const handleSaveJobs = async (newJobs: JobOpportunity[]) => {
    setJobs(newJobs);
    saveStoredJobs(newJobs);
    if (user) {
      try {
        await batchSaveJobsToFirestore(user.uid, newJobs);
      } catch (err) {
        console.error('Failed to sync batch jobs to Firestore:', err);
      }
    }
  };

  // Add or update single job
  const handleAddOrUpdateJob = async (jobToSave: JobOpportunity) => {
    const exists = jobs.some((j) => j.id === jobToSave.id);
    let updated: JobOpportunity[];
    if (exists) {
      updated = jobs.map((j) => (j.id === jobToSave.id ? jobToSave : j));
    } else {
      updated = [jobToSave, ...jobs];
    }
    handleSaveJobs(updated);

    if (user) {
      try {
        await saveJobToFirestore(user.uid, jobToSave);
      } catch (err) {
        console.error('Failed to sync job to Firestore:', err);
      }
    }

    if (drawerJob && drawerJob.id === jobToSave.id) {
      setDrawerJob(jobToSave);
    }
    setIsJobModalOpen(false);
    setEditingJob(null);
  };

  // Delete job - opens custom in-app confirmation modal
  const handleDeleteJob = (id: string) => {
    const found = jobs.find((j) => j.id === id);
    if (found) {
      setJobToDelete(found);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    const id = jobToDelete.id;
    const updated = jobs.filter((j) => j.id !== id);
    handleSaveJobs(updated);

    if (user) {
      try {
        await deleteJobFromFirestore(user.uid, id);
      } catch (err) {
        console.error('Failed to delete job from Firestore:', err);
      }
    }

    if (drawerJob && drawerJob.id === id) {
      setDrawerJob(null);
    }
    setJobToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Quick update status
  const handleUpdateStatus = async (id: string, newStatus: JobStatus) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let updatedJobTarget: JobOpportunity | null = null;

    const updated = jobs.map((j) => {
      if (j.id === id) {
        const uj = {
          ...j,
          status: newStatus,
          statusDate: todayStr,
          lastActivityDate: todayStr
        };
        updatedJobTarget = uj;
        return uj;
      }
      return j;
    });
    handleSaveJobs(updated);

    if (user && updatedJobTarget) {
      try {
        await saveJobToFirestore(user.uid, updatedJobTarget);
      } catch (err) {
        console.error('Failed to update job status in Firestore:', err);
      }
    }

    if (drawerJob && drawerJob.id === id && updatedJobTarget) {
      setDrawerJob(updatedJobTarget);
    }
  };

  // Quick advance stage (+1 stage completed)
  const handleQuickAdvanceStage = async (job: JobOpportunity) => {
    const nextIncompleteIdx = job.stages.findIndex((s) => !s.completed);
    if (nextIncompleteIdx === -1) return;

    const updatedStages = [...job.stages];
    updatedStages[nextIncompleteIdx] = {
      ...updatedStages[nextIncompleteIdx],
      completed: true,
      date: new Date().toISOString().split('T')[0]
    };

    const isAllDone = updatedStages.every((s) => s.completed);
    if (isAllDone) {
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    }

    const updatedJob: JobOpportunity = {
      ...job,
      stages: updatedStages,
      lastActivityDate: new Date().toISOString().split('T')[0]
    };

    await handleAddOrUpdateJob(updatedJob);
  };

  // Filtering
  const filteredJobs = jobs.filter((job) => {
    // 1. Category Filter
    if (currentCategory !== 'All' && job.category !== currentCategory) {
      return false;
    }

    // 2. Status Filter
    if (statusFilter === 'active') {
      if (job.status === 'rejected' || job.status === 'withdrawn') return false;
    } else if (statusFilter !== 'all' && job.status !== statusFilter) {
      return false;
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCompany = job.company.toLowerCase().includes(q);
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchLocation = job.location?.toLowerCase().includes(q) || false;
      const matchContact = job.contacts.some(
        (c) => c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
      );
      const matchResume = job.resumes.some(
        (r) => r.fileName.toLowerCase().includes(q) || r.versionLabel?.toLowerCase().includes(q)
      );
      return matchCompany || matchTitle || matchLocation || matchContact || matchResume;
    }

    return true;
  });

  const followUps = calculateFollowUps(jobs);
  const urgentFollowUps = followUps.filter((f) => f.isOverdue || f.isToday);

  // Authentication & Session Gating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Connecting to JobTracker Pro...</span>
      </div>
    );
  }

  // If user is not logged in, render LoginPage gate (strictly hides all offers/jobs)
  if (!user) {
    return <LoginPage />;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Loading your interview pipelines...</span>
      </div>
    );
  }

  const handleOpenCalendarModal = (job?: JobOpportunity, stage?: StageItem) => {
    setCalendarModalJob(job || null);
    setCalendarModalStage(stage || null);
    setIsCalendarModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        currentCategory={currentCategory}
        onCategoryChange={setCurrentCategory}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        jobs={jobs}
        onOpenNewJobModal={() => {
          setEditingJob(null);
          setIsJobModalOpen(true);
        }}
        onOpenFollowUpModal={() => setIsFollowUpModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Urgent Follow-Up Alert Banner (if any) */}
      {urgentFollowUps.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-900 border-b border-amber-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5 text-amber-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>
                You have <strong>{urgentFollowUps.length}</strong> follow-up(s) requiring outreach today (e.g.,{' '}
                {urgentFollowUps[0].job.company})!
              </span>
            </div>
            <button
              onClick={() => setIsFollowUpModalOpen(true)}
              className="text-amber-200 hover:text-white font-semibold underline underline-offset-2 flex items-center gap-1 shrink-0"
            >
              <span>View Outreach Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Track Context Pill Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {currentCategory === 'JobsTech' && 'Tech Engineering & Architecture Pipeline'}
              {currentCategory === 'JobsMgm' && 'Management, Product & Agile Leadership Pipeline'}
              {currentCategory === 'All' && 'Consolidated Overview of All Opportunities'}
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              ({filteredJobs.length} {filteredJobs.length === 1 ? 'opportunity' : 'opportunities'})
            </span>
          </div>
        </div>

        {/* View Render */}
        {viewMode === 'table' && (
          <JobTable
            jobs={filteredJobs}
            onSelectJob={(job) => setDrawerJob(job)}
            onEditJob={(job) => {
              setEditingJob(job);
              setIsJobModalOpen(true);
            }}
            onDeleteJob={handleDeleteJob}
            onUpdateStatus={handleUpdateStatus}
            onQuickAdvanceStage={handleQuickAdvanceStage}
            onOpenFollowUpForJob={(job) => {
              setDrawerJob(job);
            }}
          />
        )}

        {viewMode === 'kanban' && (
          <JobKanban
            jobs={filteredJobs}
            onSelectJob={(job) => setDrawerJob(job)}
            onUpdateStatus={handleUpdateStatus}
            onQuickAdvanceStage={handleQuickAdvanceStage}
            onOpenFollowUpForJob={(job) => {
              setDrawerJob(job);
            }}
          />
        )}

        {viewMode === 'calendar' && (
          <JobCalendar
            jobs={filteredJobs}
            onSelectJob={(job) => setDrawerJob(job)}
            onOpenFollowUpForJob={(job) => {
              setDrawerJob(job);
            }}
            onUpdateJob={handleAddOrUpdateJob}
            onOpenGoogleCalendarModal={handleOpenCalendarModal}
          />
        )}

        {viewMode === 'analytics' && (
          <JobAnalytics jobs={filteredJobs} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950/90 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <strong>JobTracker Pro</strong> • Modern Spreadsheet Replacement for JobsTech & JobsMgm
          </div>
          <div className="flex items-center gap-4">
            <span>Stage Tracking (0/3)</span>
            <span>•</span>
            <span>Google Calendar Sync</span>
            <span>•</span>
            <span>Follow-up Reminders</span>
            <span>•</span>
            <span>Tailored Resumes</span>
          </div>
        </div>
      </footer>

      {/* Detail Drawer */}
      {drawerJob && (
        <JobDetailDrawer
          job={drawerJob}
          onClose={() => setDrawerJob(null)}
          onUpdateJob={handleAddOrUpdateJob}
          onEditJob={(job) => {
            setEditingJob(job);
            setIsJobModalOpen(true);
          }}
          onDeleteJob={handleDeleteJob}
          onOpenGoogleCalendarModal={handleOpenCalendarModal}
        />
      )}

      {/* New / Edit Job Modal */}
      {isJobModalOpen && (
        <JobModal
          isOpen={isJobModalOpen}
          onClose={() => {
            setIsJobModalOpen(false);
            setEditingJob(null);
          }}
          onSave={handleAddOrUpdateJob}
          initialJob={editingJob}
          defaultCategory={currentCategory === 'All' ? 'JobsTech' : currentCategory}
        />
      )}

      {/* Follow-up Reminder Modal */}
      {isFollowUpModalOpen && (
        <FollowUpReminderModal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          jobs={jobs}
          onUpdateJob={handleAddOrUpdateJob}
          onSelectJob={(job) => setDrawerJob(job)}
        />
      )}

      {/* Export & Import Modal */}
      {isExportModalOpen && (
        <ExportImportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          jobs={jobs}
          onImportJobs={(importedJobs) => {
            handleSaveJobs(importedJobs);
          }}
        />
      )}

      {/* In-App Delete Confirmation Modal */}
      {isDeleteModalOpen && jobToDelete && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          job={jobToDelete}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setJobToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Google Calendar Direct Sync & Scheduler Modal */}
      {isCalendarModalOpen && (
        <GoogleCalendarSyncModal
          isOpen={isCalendarModalOpen}
          onClose={() => {
            setIsCalendarModalOpen(false);
            setCalendarModalJob(null);
            setCalendarModalStage(null);
          }}
          jobs={jobs}
          onUpdateJob={handleAddOrUpdateJob}
          preselectedJob={calendarModalJob}
          preselectedStage={calendarModalStage}
        />
      )}
    </div>
  );
}
