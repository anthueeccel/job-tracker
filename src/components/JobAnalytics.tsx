import React from 'react';
import { JobOpportunity } from '../types/job';
import { BarChart3, TrendingUp, Award, CheckCircle2, Users, Code, Target } from 'lucide-react';

interface JobAnalyticsProps {
  jobs: JobOpportunity[];
}

export const JobAnalytics: React.FC<JobAnalyticsProps> = ({ jobs }) => {
  const total = jobs.length;
  if (total === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl max-w-md mx-auto my-12">
        <p className="text-slate-400">Add job opportunities to view conversion analytics.</p>
      </div>
    );
  }

  const techJobs = jobs.filter((j) => j.category === 'JobsTech');
  const mgmJobs = jobs.filter((j) => j.category === 'JobsMgm');

  const offers = jobs.filter((j) => j.status === 'offer');
  const interviews = jobs.filter(
    (j) => j.status === 'interviewing' || j.status === 'tech_challenge' || j.status === 'offer'
  );

  const interviewRate = total > 0 ? Math.round((interviews.length / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offers.length / total) * 100) : 0;

  // Average stages per job
  const totalStagesCount = jobs.reduce((acc, j) => acc + j.stages.length, 0);
  const avgStages = total > 0 ? (totalStagesCount / total).toFixed(1) : '0';

  const completedStagesCount = jobs.reduce(
    (acc, j) => acc + j.stages.filter((s) => s.completed).length,
    0
  );
  const stageCompletionRate = totalStagesCount > 0 ? Math.round((completedStagesCount / totalStagesCount) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Opportunities</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{total}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
            <span className="text-cyan-400">{techJobs.length} Tech</span>
            <span>•</span>
            <span className="text-purple-400">{mgmJobs.length} Management</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Interview Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{interviewRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {interviews.length} of {total} advanced to technical/management rounds
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Offers Received</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">{offers.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Application-to-offer conversion: {offerRate}%
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Stage Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 font-mono">{stageCompletionRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Average of {avgStages} stages per application
          </div>
        </div>
      </div>

      {/* Funnel & Conversion Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Hiring Pipeline Conversion Funnel
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">1. Submitted Applications</span>
                <span className="font-mono text-slate-200">{total} (100%)</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">2. Recruiter Screening Reached</span>
                <span className="font-mono text-slate-200">
                  {jobs.filter((j) => j.status !== 'applied').length} (
                  {Math.round((jobs.filter((j) => j.status !== 'applied').length / total) * 100)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (jobs.filter((j) => j.status !== 'applied').length / total) * 100
                    )}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">3. Interviews & Take-Home Challenges</span>
                <span className="font-mono text-slate-200">
                  {interviews.length} ({interviewRate}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${interviewRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">4. Formal Job Offers</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {offers.length} ({offerRate}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(offerRate, offers.length > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* JobsTech vs JobsMgm Comparison */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Track Breakdown: JobsTech vs JobsMgm
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-cyan-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-3">
                <Code className="w-4 h-4" /> JobsTech
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Total Opportunities:</span>
                  <span className="font-mono font-bold text-white">{techJobs.length}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Active Pipelines:</span>
                  <span className="font-mono text-cyan-300">
                    {techJobs.filter((j) => j.status !== 'rejected').length}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>In Interviews:</span>
                  <span className="font-mono text-amber-300">
                    {techJobs.filter((j) => j.status === 'interviewing' || j.status === 'tech_challenge').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-3">
                <Users className="w-4 h-4" /> JobsMgm
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Total Opportunities:</span>
                  <span className="font-mono font-bold text-white">{mgmJobs.length}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Active Pipelines:</span>
                  <span className="font-mono text-purple-300">
                    {mgmJobs.filter((j) => j.status !== 'rejected').length}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>In Interviews:</span>
                  <span className="font-mono text-amber-300">
                    {mgmJobs.filter((j) => j.status === 'interviewing' || j.status === 'tech_challenge').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            💡 <strong className="text-slate-200">Pro Tip:</strong> Maintain between 5 to 10 active opportunities in each track to maximize your negotiation leverage and secure competitive compensation packages!
          </div>
        </div>
      </div>
    </div>
  );
};
