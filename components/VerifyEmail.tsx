import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Send, RefreshCw, LogOut, CheckCircle, Clock } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const { currentUser, logout, resendVerificationEmail, reloadUser } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await resendVerificationEmail();
      setCooldown(60);
      setMessage('Verification link resent!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Failed to resend email", error);
      setMessage('Error resending email. Try again later.');
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      await reloadUser(); // Reloads the user from Firebase to update emailVerified status
      // If verified, App.tsx will automatically redirect to Dashboard
    } catch (error) {
      console.error("Error reloading user", error);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] dark:bg-slate-900 transition-colors p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700 text-center animate-fade-in relative overflow-hidden">
        
        {/* Status Icon */}
        <div className="w-20 h-20 bg-pink-50 dark:bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-500 relative">
          <Send size={32} className="animate-pulse" />
          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1.5 border-4 border-white dark:border-slate-800">
             <Clock size={12} className="text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Verify your email
        </h2>
        
        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed text-sm">
          We've sent a verification link to <br/>
          <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{currentUser?.email}</span>
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 px-4">
          Click the link in your email to verify your account. If you don't see it, check your spam folder.
        </p>
        
        {message && (
          <div className="mb-4 p-2 bg-green-50 text-green-600 text-xs rounded-lg font-medium">
            {message}
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            disabled={checking}
            className="w-full py-3.5 px-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
          >
            {checking ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            I've Verified! (Refresh)
          </button>

          <button
            onClick={handleResend}
            disabled={cooldown > 0}
            className="w-full py-3.5 px-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {cooldown > 0 ? `Resend Email in ${cooldown}s` : 'Resend Verification Link'}
          </button>
          
          <button
            onClick={() => logout()}
            className="w-full py-2 px-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
