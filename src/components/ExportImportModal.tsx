import React, { useState } from 'react';
import { JobOpportunity, JobCategory, JobStatus } from '../types/job';
import {
  exportJobsToCSV,
  downloadFile,
  INITIAL_JOBS,
  findAndRecoverAllLocalJobs
} from '../services/storage';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Database,
  Sparkles,
  Search
} from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobOpportunity[];
  onImportJobs: (jobs: JobOpportunity[]) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  jobs,
  onImportJobs
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [scanResult, setScanResult] = useState(() => findAndRecoverAllLocalJobs());

  const handleExportCSV = () => {
    const csvContent = exportJobsToCSV(jobs);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csvContent, `JobTracker_Pro_${dateStr}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(jobs, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(jsonContent, `JobTracker_Backup_${dateStr}.json`, 'application/json');
  };

  const handleImportJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportJobs(parsed);
          setImportStatus(`Successfully restored ${parsed.length} applications from backup!`);
          setTimeout(() => setImportStatus(null), 3500);
        } else {
          setImportStatus('Invalid JSON file format.');
        }
      } catch (err) {
        setImportStatus('Error reading JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setImportStatus('CSV file has no data rows.');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim().toLowerCase());
        const importedList: JobOpportunity[] = [];

        for (let i = 1; i < lines.length; i++) {
          // Parse CSV line taking quotes into account
          const row: string[] = [];
          let current = '';
          let insideQuotes = false;
          for (let c = 0; c < lines[i].length; c++) {
            const char = lines[i][c];
            if (char === '"') {
              insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
              row.push(current.trim().replace(/^"|"$/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          row.push(current.trim().replace(/^"|"$/g, ''));

          if (row.length >= 2 && (row[0] || row[1])) {
            const company = row[0] || 'Unknown Company';
            const title = row[2] || row[1] || 'Position';
            const rawCat = (row[3] || '').toLowerCase();
            let category: JobCategory = 'JobsTech';
            if (rawCat.includes('mgm') || rawCat.includes('manag') || rawCat.includes('lead') || rawCat.includes('product')) {
              category = 'JobsMgm';
            }

            importedList.push({
              id: `csv-${Date.now()}-${i}`,
              company,
              title,
              category,
              status: (row[4] as JobStatus) || 'applied',
              workModel: (row[5] as any) || 'remote',
              location: row[6] || 'Remote',
              salaryExpected: row[7] || '',
              salaryOffered: row[8] || '',
              appliedDate: row[9] || new Date().toISOString().split('T')[0],
              lastActivityDate: row[9] || new Date().toISOString().split('T')[0],
              nextFollowUpDate: row[10] || undefined,
              stages: [],
              contacts: row[11] ? [{ name: row[11], email: row[12], phone: row[13] }] : [],
              resumes: [],
              notes: [],
              priority: 'medium'
            });
          }
        }

        if (importedList.length > 0) {
          // Merge with existing
          const merged = [...importedList, ...jobs];
          onImportJobs(merged);
          setImportStatus(`Imported ${importedList.length} applications from CSV!`);
          setTimeout(() => setImportStatus(null), 3500);
        }
      } catch (err) {
        setImportStatus('Error parsing CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handleRecoverFromStorage = () => {
    const res = findAndRecoverAllLocalJobs();
    setScanResult(res);
    if (res.recoveredJobs.length > 0) {
      onImportJobs(res.recoveredJobs);
      setImportStatus(
        `Recovered and synced ${res.recoveredJobs.length} applications (${res.jobsMgmCount} JobsMgm, ${res.jobsTechCount} JobsTech)!`
      );
      setTimeout(() => setImportStatus(null), 4000);
    } else {
      setImportStatus('No additional records found across browser storage keys.');
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const handleResetToDefault = () => {
    onImportJobs(INITIAL_JOBS);
    setIsConfirmingReset(false);
    setImportStatus('Demo dataset restored successfully!');
    setTimeout(() => setImportStatus(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Data Manager, Backups & Recovery
              </h2>
              <p className="text-xs text-slate-400">
                Recover past browser data, export spreadsheets, or restore backups.
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

        {importStatus && (
          <div className="p-3 bg-indigo-950/50 border-b border-indigo-900/50 text-indigo-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Deep Browser Storage Scanner & Recovery */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    Browser Storage Scanner & Recovery
                    <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                      Auto-Detect
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Scans all previous versions of browser storage to find and restore all JobsMgm & JobsTech records.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRecoverFromStorage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Recover All
              </button>
            </div>

            <div className="text-[11px] font-mono bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-slate-300 flex flex-wrap gap-x-5 gap-y-1">
              <span>Total in Storage: <strong className="text-white">{scanResult.totalFound}</strong></span>
              <span>JobsMgm: <strong className="text-indigo-400">{scanResult.jobsMgmCount}</strong></span>
              <span>JobsTech: <strong className="text-cyan-400">{scanResult.jobsTechCount}</strong></span>
              {scanResult.sourceKeys.length > 0 && (
                <div className="text-[10px] text-slate-500 w-full truncate mt-1">
                  Storage sources: {scanResult.sourceKeys.join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Export CSV */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Export to Spreadsheet (CSV)</h4>
                <p className="text-[11px] text-slate-400">
                  Export all applications to Microsoft Excel, Apple Numbers, or Google Sheets.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Download CSV
            </button>
          </div>

          {/* Backup JSON */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Full JSON Backup</h4>
                <p className="text-[11px] text-slate-400">
                  Preserves all stage timelines, notes, recruiter details, and resume versions.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Download JSON
            </button>
          </div>

          {/* Import JSON or CSV */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Restore Backup or CSV</h4>
                <p className="text-[11px] text-slate-400">
                  Upload a JSON backup file or CSV spreadsheet.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shrink-0">
                <span>Upload CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSVFile}
                  className="hidden"
                />
              </label>
              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5" /> Restore JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSONFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset to Demo */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {isConfirmingReset ? 'Are you sure? This replaces current jobs:' : 'Need sample data to explore features?'}
            </span>
            {isConfirmingReset ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsConfirmingReset(false)}
                  className="px-2 py-1 text-[11px] text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetToDefault}
                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-300 bg-rose-500/20 border border-rose-500/30 rounded hover:bg-rose-500/30"
                >
                  Confirm Reset
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmingReset(true)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
              >
                <RefreshCw className="w-3 3 text-slate-400" /> Restore Demo Dataset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
