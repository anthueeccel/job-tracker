import React from 'react';
import { JobOpportunity } from '../types/job';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  job: JobOpportunity | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  job,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Opportunity</h3>
              <p className="text-xs text-slate-400">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to permanently delete the application for:
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1">
            <div className="font-bold text-sm text-white">{job.company}</div>
            <div className="text-xs text-indigo-400 font-medium">{job.title}</div>
            <div className="text-[11px] text-slate-500">
              {job.stages.length} stages • {job.notes.length} notes • {job.contacts.length} recruiter contact(s)
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            All stage progress, tailored resume metadata, and interview log entries for this role will be removed.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Yes, Delete Opportunity</span>
          </button>
        </div>
      </div>
    </div>
  );
};
