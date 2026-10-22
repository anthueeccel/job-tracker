import React from 'react';
import { AlertTriangle, Calendar, Trash2 } from 'lucide-react';

interface CalendarConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  eventSummary?: string;
  eventDate?: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CalendarConfirmModal: React.FC<CalendarConfirmModalProps> = ({
  isOpen,
  title,
  message,
  eventSummary,
  eventDate,
  confirmLabel = 'Confirm Action',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDestructive
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
            }`}
          >
            {isDestructive ? <AlertTriangle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400">Google Calendar Workspace Sync</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-4 leading-relaxed">{message}</p>

        {eventSummary && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-5 space-y-1">
            <div className="text-xs font-semibold text-slate-200">{eventSummary}</div>
            {eventDate && (
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>{eventDate}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
            }`}
          >
            {isDestructive && <Trash2 className="w-3.5 h-3.5" />}
            <span>{isLoading ? 'Processing...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
