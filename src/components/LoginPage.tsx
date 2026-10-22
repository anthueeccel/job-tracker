import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Bell,
  FileText,
  Sparkles,
  Loader2,
  Lock
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await signIn();
    } catch (err: any) {
      console.error('Sign in error:', err);
      // If user closed popup, don't show scary error
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative backdrop-blur-xl z-10 text-center">
        {/* Brand Header */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-indigo-500/25 text-white">
            <Briefcase className="w-8 h-8" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3 h-3" />
          <span>Private Career Pipeline</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          JobTracker Pro
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 mb-6 leading-relaxed">
          Sign in to access your confidential <strong className="text-slate-200">JobsTech</strong> and{' '}
          <strong className="text-slate-200">JobsMgm</strong> applications, interview stages, and offers.
        </p>

        {/* Security Alert Badge */}
        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 text-xs mb-6">
          <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Authentication required to view job applications</span>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs text-left">
            {error}
          </div>
        )}

        {/* Sign In with Google Button (Material Design Google Button) */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoggingIn}
          className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg bg-white text-slate-900 hover:bg-slate-100 hover:shadow-indigo-500/10 active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
          )}
          <span className="font-semibold text-slate-800">
            {isLoggingIn ? 'Connecting to Firebase...' : 'Sign in with Google'}
          </span>
        </button>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-8 text-left text-xs text-slate-400">
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold block text-[11px]">Stage Progress</span>
              <span className="text-[10px] text-slate-400">Track 0/3, 1/3 pipeline</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-2">
            <Calendar className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold block text-[11px]">Google Calendar</span>
              <span className="text-[10px] text-slate-400">1-click interview sync</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-2">
            <Bell className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold block text-[11px]">Follow-up Alerts</span>
              <span className="text-[10px] text-slate-400">Never miss a recruiter</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold block text-[11px]">Firebase Cloud</span>
              <span className="text-[10px] text-slate-400">Encrypted private sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-slate-500">
        <p>JobTracker Pro • Powered by Firebase Auth & Cloud Firestore</p>
      </div>
    </div>
  );
};
